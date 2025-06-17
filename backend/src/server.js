require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");
const axios = require("axios");
const authRoutes = require("./routes/auth.routes");
const authMiddleware = require("./middleware/auth.middleware");

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
        }
      );

      // Salva a resposta da LLM
      const botResponse = await prisma.response.create({
        data: {
          content: llmResponse.data.choices[0].message.content,
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
app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});
