const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const generateTokens = async (userId) => {
  // Gera o token de acesso
  const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "15m",
  });

  // Gera o refresh token
  const refreshToken = jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });

  // Salva o refresh token no banco
  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias
    },
  });

  return {
    accessToken,
    refreshToken,
  };
};

const verifyRefreshToken = async (token) => {
  try {
    // Verifica se o token é válido
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

    // Busca o token no banco
    const refreshToken = await prisma.refreshToken.findFirst({
      where: {
        token,
        userId: decoded.userId,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!refreshToken) {
      throw new Error("Refresh token inválido ou expirado");
    }

    return decoded;
  } catch (error) {
    throw new Error("Refresh token inválido");
  }
};

const revokeRefreshToken = async (token) => {
  await prisma.refreshToken.deleteMany({
    where: {
      token,
    },
  });
};

module.exports = {
  generateTokens,
  verifyRefreshToken,
  revokeRefreshToken,
};
