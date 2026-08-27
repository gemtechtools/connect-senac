// backend/middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');
<<<<<<< HEAD
const supabase = require('../config/database'); // Importação do banco

module.exports = async (req, res, next) => {
    const token = req.header('Authorization');

    if (!token) {
        return res.status(401).json({ erro: 'Acesso negado. Faça login para continuar.' });
    }

    try {
        const tokenLimpo = token.replace('Bearer ', '');
        const decodificado = jwt.verify(tokenLimpo, process.env.JWT_SECRET || 'chave_super_secreta_senac');

        // CONSULTA DE SEGURANÇA EM TEMPO REAL:
        const { data: usuario, error } = await supabase
            .from('usuarios')
            .select('is_bloqueado')
            .eq('id', decodificado.id)
            .single();

        if (error || !usuario) {
            return res.status(401).json({ erro: 'Usuário não encontrado no sistema.' });
        }

        if (usuario.is_bloqueado) {
            return res.status(403).json({ erro: 'Sua conta foi suspensa. Entre em contato com a coordenação.' });
        }

        req.usuario = decodificado;
        next();
    } catch (err) {
        return res.status(401).json({ erro: 'Sessão expirada ou inválida. Faça login novamente.' });
=======

module.exports = (req, res, next) => {
    // Busca o token no cabeçalho da requisição
    const token = req.header('Authorization');

    // Se não tiver token, barra a entrada
    if (!token) {
        return res.status(401).json({ erro: 'Acesso negado. Token não fornecido. Faça login.' });
    }

    try {
        // Verifica se o token é válido e foi gerado pela nossa API
        const tokenLimpo = token.replace('Bearer ', '');
        const decodificado = jwt.verify(tokenLimpo, process.env.JWT_SECRET || 'chave_super_secreta_senac');

        // Pendura os dados do usuário (id, email) na requisição para usarmos no Controller
        req.usuario = decodificado;

        // Libera a passagem para o Controller
        next();
    } catch (erro) {
        res.status(400).json({ erro: 'Token inválido ou expirado.' });
>>>>>>> e07bd8c7e6080daa48705b3c909a3ed090e004e2
    }
};