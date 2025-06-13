const { body, validationResult } = require("express-validator");

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const registerValidation = [
  body("email").isEmail().withMessage("Email inválido").normalizeEmail(),
  body("password")
    .isLength({ min: 8 })
    .withMessage("A senha deve ter no mínimo 8 caracteres")
    .matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/)
    .withMessage("A senha deve conter letras e números"),
  body("confirmPassword").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("As senhas não conferem");
    }
    return true;
  }),
  body("name")
    .notEmpty()
    .withMessage("Nome é obrigatório")
    .isLength({ min: 3 })
    .withMessage("Nome deve ter no mínimo 3 caracteres"),
  validate,
];

const loginValidation = [
  body("email").isEmail().withMessage("Email inválido").normalizeEmail(),
  body("password").notEmpty().withMessage("Senha é obrigatória"),
  validate,
];

module.exports = {
  registerValidation,
  loginValidation,
};
