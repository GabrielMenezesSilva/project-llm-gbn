require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");
const axios = require("axios");
const authRoutes = require("./routes/auth.routes");
const authMiddleware = require("./middleware/auth.middleware");
const langfuse = require("./utils/langfuse.utils").default;
const { encode } = require("gpt-3-encoder");

const app = express();
const prisma = new PrismaClient();

// Middleware
app.use(cors());
app.use(express.json());

// Rotas de autenticação
app.use("/api/auth", authRoutes);

// Rotas protegidas
app.get("/api/prompts", authMiddleware, async (req, res) => {
  try {
    const prompts = await prisma.prompt.findMany({
      where: {
        userId: req.user.id,
      },
      include: {
        responses: true,
      },
      orderBy: {
        timestamp: "desc",
      },
    });
    res.json(prompts);
  } catch (error) {
    console.error("Error fetching prompts:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/prompts", authMiddleware, async (req, res) => {
  try {
    console.log("[POST /api/prompts] chamada recebida");
    console.log("Body:", req.body);
    console.log("Usuário autenticado:", req.user);
    const { content } = req.body;

    // Salva o prompt do usuário
    const prompt = await prisma.prompt.create({
      data: {
        content,
        userId: req.user.id,
      },
    });

    // Exemplo de sessionId (pode ser adaptado para seu caso)
    const sessionId = req.sessionId || `user-${req.user.id}`;
    const tags = ["production", "chat"];
    const modelParameters = {
      temperature: 0.7,
      maxTokens: 512,
    };

    // Inicia o rastreamento Langfuse com todos os metadados possíveis, incluindo campos de topo para aparecerem como colunas
    const trace = langfuse.trace({
      name: "LLM Chat Completion",
      userId: req.user.id.toString(),
      input: content,
      output: undefined, // será atualizado depois
      sessionId,
      tags,
      userEmail: req.user.email, // campo de topo
      userRole: req.user.role, // campo de topo
      userName: req.user.name, // campo de topo
      promptId: prompt.id, // campo de topo
      endpoint: "/api/prompts", // campo de topo
      model: "gemma-3-4b-it", // campo de topo
      modelParameters: { temperature: 0.7, maxTokens: 512 }, // campo de topo
      temperature: 0.7, // campo de topo
      maxTokens: 512, // campo de topo
      createdAt: prompt.timestamp || new Date().toISOString(),
      metadata: {
        endpoint: "/api/prompts",
        userEmail: req.user.email,
        userName: req.user.name,
        userRole: req.user.role,
        promptId: prompt.id,
        createdAt: prompt.timestamp || new Date().toISOString(),
        sessionId,
        tags,
        model: "gemma-3-4b-it",
        modelParameters: { temperature: 0.7, maxTokens: 512 },
        temperature: 0.7,
        maxTokens: 512,
      },
    });

    // Cria a geração antes de chamar o LLM, também com todos os metadados
    const generation = trace.generation({
      name: "chat-completion",
      model: "gemma-3-4b-it",
      input: content,
      modelParameters,
      tags,
      metadata: {
        userId: req.user.id,
        userEmail: req.user.email,
        promptId: prompt.id,
        endpoint: "/api/prompts",
        requestTimestamp: new Date().toISOString(),
        modelParameters,
        tags,
      },
    });

    try {
      // Envia o prompt para a LLM
      const llmResponse = await axios.post(
        "http://10.150.6.181:1234/v1/chat/completions",
        {
          model: "gemma-3-4b-it",
          messages: [
            {
              role: "user",
              content: content,
            },
          ],
          stream: false,
          temperature: modelParameters.temperature,
          max_tokens: modelParameters.maxTokens,
        }
      );

      // Calcula tokens do prompt e da resposta
      const promptTokens = encode(content).length;
      const completion = llmResponse.data.choices[0].message.content;
      const completionTokens = encode(completion).length;
      const totalTokens = promptTokens + completionTokens;

      const usage = {
        input: promptTokens,
        output: completionTokens,
        total: totalTokens,
      };

      // Finaliza a geração com a resposta do LLM e todos os metadados
      await generation.end({
        output: completion,
        usage,
        startTime: new Date(),
        endTime: new Date(),
        metadata: {
          responseTimestamp: new Date().toISOString(),
          status: "success",
          usage,
          statusMessage: "Resposta gerada com sucesso",
          level: "DEFAULT",
        },
        tags,
      });

      // Atualiza a trace com o output e usage
      await trace.update({
        output: completion,
        usage,
        startTime: new Date(),
        endTime: new Date(),
        metadata: {
          responseTimestamp: new Date().toISOString(),
          status: "success",
          usage,
          statusMessage: "Resposta gerada com sucesso",
          level: "DEFAULT",
        },
        tags,
      });

      // Salva a resposta da LLM
      const botResponse = await prisma.response.create({
        data: {
          content: completion,
          promptId: prompt.id,
        },
      });

      // Retorna o prompt e a resposta da LLM
      res.status(201).json({
        prompt,
        response: botResponse,
      });
    } catch (llmError) {
      console.error("Error calling LLM:", llmError);
      // Finaliza a geração com o erro e todos os metadados
      const fallbackTime = new Date();
      await generation.end({
        output: llmError.toString(),
        usage: {
          input: promptTokens,
          output: 0,
          total: promptTokens,
        },
        startTime: fallbackTime,
        endTime: fallbackTime,
        metadata: {
          error: true,
          responseTimestamp: fallbackTime.toISOString(),
          status: "error",
          statusMessage: llmError.message || llmError.toString(),
          level: "ERROR",
        },
        tags: ["error", ...tags],
      });
      // Atualiza a trace com o erro
      await trace.update({
        output: llmError.toString(),
        usage: {
          input: promptTokens,
          output: 0,
          total: promptTokens,
        },
        startTime: fallbackTime,
        endTime: fallbackTime,
        metadata: {
          error: true,
          responseTimestamp: fallbackTime.toISOString(),
          status: "error",
          statusMessage: llmError.message || llmError.toString(),
          level: "ERROR",
        },
        tags: ["error", ...tags],
      });
      // Em caso de erro na LLM, salva uma resposta de erro
      const errorResponse = await prisma.response.create({
        data: {
          content:
            "Désolé, une erreur s'est produite lors du traitement de votre question. Veuillez réessayer.",
          promptId: prompt.id,
        },
      });
      res.status(201).json({
        prompt,
        response: errorResponse,
      });
    }
  } catch (error) {
    console.error("Error creating prompt:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/prompts/:id/responses", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const responses = await prisma.response.findMany({
      where: {
        promptId: parseInt(id),
        prompt: {
          userId: req.user.id,
        },
      },
      orderBy: {
        timestamp: "asc",
      },
    });
    res.json(responses);
  } catch (error) {
    console.error("Error fetching responses:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/prompts/:id/responses", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    // Verifica se o prompt pertence ao usuário
    const prompt = await prisma.prompt.findFirst({
      where: {
        id: parseInt(id),
        userId: req.user.id,
      },
    });

    if (!prompt) {
      return res.status(404).json({ error: "Prompt not found" });
    }

    const response = await prisma.response.create({
      data: {
        content,
        promptId: parseInt(id),
      },
    });
    res.status(201).json(response);
  } catch (error) {
    console.error("Error creating response:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Erro interno do servidor" });
});

const PORT = process.env.PORT || 3000;
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`);
  });
}

module.exports = app;
