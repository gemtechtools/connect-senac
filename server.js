// server.js
require('dotenv').config(); // Carrega as variáveis do arquivo .env
require('./backend/cron/notificador');
const express = require('express');
const path = require('path');
const cors = require('cors');
const db = require('./backend/config/database');
const usuarioRoutes = require('./backend/routes/usuarioRoutes');
const agendamentoRoutes = require('./backend/routes/agendamentoRoutes');
const cursoRoutes = require('./backend/routes/cursoRoutes'); // NOVA LINHA
const disponibilidadeRoutes = require('./backend/routes/disponibilidadeRoutes'); // NOVA LINHA


const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors()); // Libera o acesso do Front-end
app.use(express.json()); // Ensina o Express a entender requisições no formato JSON
app.use(express.static(path.join(__dirname, 'frontend')));

// Rota de teste simples
app.get('/api/status', (req, res) => {
    res.json({ mensagem: "Servidor Connect Senac rodando com sucesso!", status: "OK" });
});

// Usando as rotas na API
// Todas as rotas de usuário terão o prefixo /api/usuarios
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/agendamentos', agendamentoRoutes);
app.use('/api/cursos', cursoRoutes); // NOVA LINHA
app.use('/api/disponibilidades', disponibilidadeRoutes); // NOVA LINHA
app.use('/api/dashboard', require('./backend/routes/dashboardRoutes'));
app.use('/api/admin', require('./backend/routes/adminRoutes'));
app.use('/api/profissional', require('./backend/routes/profissionalRoutes'));
app.use('/api/feedbacks', require('./backend/routes/feedbackRoutes'));

// Iniciando o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Acesse: http://localhost:${PORT}/api/status`);
});

