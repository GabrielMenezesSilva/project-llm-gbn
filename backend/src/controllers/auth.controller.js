const { PrismaClient } = require("@prisma/client");
const { hashPassword, comparePassword } = require("../utils/password.utils");
const {
  generateTokens,
  verifyRefreshToken,
  revokeRefreshToken,
} = require("../utils/jwt.utils");

const prisma = new PrismaClient();

const register = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Verifica se o email já está em uso
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ error: "Email já está em uso" });
    }

    // Hash da senha
    const hashedPassword = await hashPassword(password);

    // Cria o usuário
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    // Gera os tokens
    const tokens = await generateTokens(user.id);

    return res.status(201).json({
      user,
      ...tokens,
    });
  } catch (error) {
    console.error("Erro no registro:", error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Busca o usuário
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ error: "Email ou senha inválidos" });
    }

    // Verifica a senha
    const isValidPassword = await comparePassword(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ error: "Email ou senha inválidos" });
    }

    // Gera os tokens
    const tokens = await generateTokens(user.id);

    // Remove a senha do objeto user
    const { password: _, ...userWithoutPassword } = user;

    return res.json({
      user: userWithoutPassword,
      ...tokens,
    });
  } catch (error) {
    console.error("Erro no login:", error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};

const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: "Refresh token não fornecido" });
    }

    // Verifica o refresh token
    const decoded = await verifyRefreshToken(refreshToken);

    // Gera novos tokens
    const tokens = await generateTokens(decoded.userId);

    // Revoga o refresh token antigo
    await revokeRefreshToken(refreshToken);

    return res.json(tokens);
  } catch (error) {
    console.error("Erro no refresh:", error);
    return res.status(401).json({ error: "Refresh token inválido" });
  }
};

const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      await revokeRefreshToken(refreshToken);
    }

    return res.status(204).send();
  } catch (error) {
    console.error("Erro no logout:", error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};

const me = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    return res.json(user);
  } catch (error) {
    console.error("Erro ao buscar usuário:", error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};

module.exports = {
  register,
  login,
  refresh,
  logout,
  me,
};
