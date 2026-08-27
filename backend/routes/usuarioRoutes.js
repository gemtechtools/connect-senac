// backend/routes/usuarioRoutes.js
const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');

// Definindo os Endpoints
router.post('/registrar', usuarioController.registrar);
router.post('/login', usuarioController.login);

<<<<<<< HEAD
// Rotas públicas (não precisam de authMiddleware porque o utilizador esqueceu a senha)
router.post('/esqueci-senha', usuarioController.solicitarRecuperacao);
router.post('/redefinir-senha', usuarioController.redefinirSenha);

=======
>>>>>>> e07bd8c7e6080daa48705b3c909a3ed090e004e2
module.exports = router;