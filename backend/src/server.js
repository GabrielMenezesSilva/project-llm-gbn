require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");
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
    console.error("Erro ao buscar prompts:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
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

    // Cria uma resposta automática do bot AQUI NAO VAI EXISTIR QUANDO IMPLEMENTAR O LLM
    const botResponse = await prisma.response.create({
      data: {
        content: "Esta é uma resposta automática do bot.",
        promptId: prompt.id,
      },
    });

    // Retorna o prompt e a resposta do bot
    res.status(201).json({
      prompt,
      response: botResponse,
    });
  } catch (error) {
    console.error("Erro ao criar prompt:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
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
    console.error("Erro ao buscar respostas:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
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
      return res.status(404).json({ error: "Prompt não encontrado" });
    }

    const response = await prisma.response.create({
      data: {
        content,
        promptId: parseInt(id),
      },
    });
    res.status(201).json(response);
  } catch (error) {
    console.error("Erro ao criar resposta:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// Tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Erro interno do servidor" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
