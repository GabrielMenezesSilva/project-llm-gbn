const express = require("express");
const {
  register,
  login,
  refresh,
  logout,
  me,
} = require("../controllers/auth.controller");
const {
  registerValidation,
  loginValidation,
} = require("../middleware/validate.middleware");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

// Rotas públicas
router.post("/register", registerValidation, register);
router.post("/login", loginValidation, login);
router.post("/refresh", refresh);

// Rotas protegidas
router.post("/logout", authMiddleware, logout);
router.get("/me", authMiddleware, me);

module.exports = router;
