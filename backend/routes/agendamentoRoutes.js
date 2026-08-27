// backend/routes/agendamentoRoutes.js
const express = require('express');
const router = express.Router();
const agendamentoController = require('../controllers/agendamentoController');
<<<<<<< HEAD

const authMiddleware = require('../middlewares/authMiddleware');
const autorizarPerfis = require('../middlewares/rbacMiddleware');

// ----------------------------------------------------------------------
// Rotas do Candidato (Qualquer utilizador autenticado)
// ----------------------------------------------------------------------
router.post('/', authMiddleware, agendamentoController.criar);
router.get('/meus', authMiddleware, agendamentoController.listarMeus);
router.put('/:id/cancelar', authMiddleware, agendamentoController.cancelar);

// ----------------------------------------------------------------------
// Rotas Administrativas (Apenas Admin e Coordenador)
// ----------------------------------------------------------------------
router.put(
    '/admin/:id/cancelar',
    authMiddleware,
    autorizarPerfis('admin', 'coordenador'), // Apenas a chefia pode usar este atalho
    agendamentoController.adminCancelar
);
=======
const authMiddleware = require('../middlewares/authMiddleware');


// Ao colocar o middleware aqui, protegemos TODAS as rotas abaixo dele
router.use(authMiddleware);

router.post('/', agendamentoController.criar);
router.put('/:id/cancelar', agendamentoController.cancelar);
router.get('/meus', agendamentoController.listarMeus);
router.get('/admin/todos', agendamentoController.listarTodos);
>>>>>>> e07bd8c7e6080daa48705b3c909a3ed090e004e2

module.exports = router;