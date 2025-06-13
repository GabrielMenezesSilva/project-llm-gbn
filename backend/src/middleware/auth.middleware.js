const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const authMiddleware = async (req, res, next) => {
  try {
    // Verifica se o token está presente no header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: "Token não fornecido" });
    }

    // Extrai o token do header (formato: "Bearer TOKEN")
    const [, token] = authHeader.split(" ");

    // Verifica se o token é válido
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Busca o usuário no banco de dados
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    if (!user) {
      return res.status(401).json({ error: "Usuário não encontrado" });
    }

    // Adiciona o usuário ao objeto request
    req.user = user;

    return next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expirado" });
    }
    return res.status(401).json({ error: "Token inválido" });
  }
};

module.exports = authMiddleware;
