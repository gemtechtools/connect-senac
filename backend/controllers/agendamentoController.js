// backend/controllers/agendamentoController.js
<<<<<<< HEAD
const supabase = require('../config/database');

// ============================================================================
// LÓGICA DO CANDIDATO
// ============================================================================

// [Funcionalidade] Candidato: Criar Agendamento (Inscrever-se na vaga)
exports.criar = async (req, res) => {
    const { disponibilidade_id } = req.body;
    const usuario_id = req.usuario.id; // Pegamos o ID de quem está logado pelo token!

    if (!disponibilidade_id) {
        return res.status(400).json({ erro: 'O ID da disponibilidade é obrigatório.' });
    }

    try {
        // 1. Verificar se a vaga existe e tem espaço (Regra de Overbooking)
        const { data: disponibilidade, error: erroDisp } = await supabase
            .from('disponibilidades')
            .select('vagas_totais, vagas_ocupadas')
            .eq('id', disponibilidade_id)
            .single();

        if (erroDisp || !disponibilidade) {
            return res.status(404).json({ erro: 'Horário não encontrado.' });
        }

        if (disponibilidade.vagas_ocupadas >= disponibilidade.vagas_totais) {
            return res.status(400).json({ erro: 'Infelizmente, não há mais vagas para este horário.' });
        }

        // 2. Inserir o Agendamento
        const { data: novoAgendamento, error: erroAgendamento } = await supabase
            .from('agendamentos')
            .insert([{ usuario_id, disponibilidade_id, status: 'agendado' }])
            .select();

        if (erroAgendamento) {
            // Se cair na regra UNIQUE do banco de dados (mesmo utilizador e mesma vaga)
            if (erroAgendamento.code === '23505') {
                return res.status(400).json({ erro: 'Você já está agendado para este exato horário!' });
            }
            throw erroAgendamento;
        }

        // 3. Atualizar o contador de vagas ocupadas
        await supabase
            .from('disponibilidades')
            .update({ vagas_ocupadas: disponibilidade.vagas_ocupadas + 1 })
            .eq('id', disponibilidade_id);

        res.status(201).json({
            mensagem: 'Agendamento realizado com sucesso!',
            agendamento: novoAgendamento[0]
        });

    } catch (error) {
        console.error('Erro ao agendar:', error.message);
        res.status(500).json({ erro: 'Erro interno ao realizar agendamento.' });
    }
};

// [Funcionalidade] Candidato: Listar os seus próprios agendamentos
exports.listarMeus = async (req, res) => {
    const usuario_id = req.usuario.id;

    try {
        const { data: meusAgendamentos, error } = await supabase
            .from('agendamentos')
            .select(`
                id, status, created_at,
                disponibilidades (
                    data_hora,
                    cursos ( nome, foto_url )
                )
            `)
            .eq('usuario_id', usuario_id)
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json(meusAgendamentos);
    } catch (error) {
        console.error('Erro ao buscar agendamentos:', error.message);
        res.status(500).json({ erro: 'Erro ao carregar os seus agendamentos.' });
    }
};

// [Funcionalidade] Candidato: Cancelar Agendamento (Com Regra das 2 Horas)
exports.cancelar = async (req, res) => {
    const { id } = req.params;
    const usuario_id = req.usuario.id;

    try {
        // Busca o agendamento para verificar a data e o dono
        const { data: agendamento, error: erroBusca } = await supabase
            .from('agendamentos')
            .select('id, status, disponibilidades(data_hora, vagas_ocupadas, id)')
            .eq('id', id)
            .eq('usuario_id', usuario_id) // Garante que o usuário só cancela o DELE
            .single();

        if (erroBusca || !agendamento) {
            return res.status(404).json({ erro: 'Agendamento não encontrado ou não pertence a você.' });
        }

        if (agendamento.status === 'cancelado') {
            return res.status(400).json({ erro: 'Este agendamento já está cancelado.' });
        }

        // Validação da Regra das 2 Horas
        const dataHoraCurso = new Date(agendamento.disponibilidades.data_hora);
        const agora = new Date();
        const diferencaEmHoras = (dataHoraCurso - agora) / (1000 * 60 * 60);

        if (diferencaEmHoras < 2) {
            return res.status(403).json({
                erro: 'Não é possível cancelar com menos de 2 horas de antecedência. Em caso de emergência, contacte a coordenação.'
            });
        }

        // Atualiza status para cancelado
        await supabase.from('agendamentos').update({ status: 'cancelado' }).eq('id', id);

        // Liberta a vaga na tabela de disponibilidades
        await supabase
            .from('disponibilidades')
            .update({ vagas_ocupadas: agendamento.disponibilidades.vagas_ocupadas - 1 })
            .eq('id', agendamento.disponibilidades.id);

        res.json({ mensagem: 'Agendamento cancelado com sucesso. A sua vaga foi libertada.' });
    } catch (error) {
        console.error('Erro ao cancelar:', error.message);
        res.status(500).json({ erro: 'Erro interno ao cancelar o agendamento.' });
    }
};

// ============================================================================
// LÓGICA ADMINISTRATIVA (OVERRIDE)
// ============================================================================

// [Funcionalidade] Admin: Cancelar QUALQUER agendamento sem restrição de tempo
exports.adminCancelar = async (req, res) => {
    const { id } = req.params;

    try {
        const { data: agendamento } = await supabase
            .from('agendamentos')
            .select('id, status, disponibilidades(vagas_ocupadas, id)')
            .eq('id', id)
            .single();

        if (!agendamento) return res.status(404).json({ erro: 'Agendamento não encontrado.' });

        // O Admin cancela sem verificar dono e sem verificar a regra das 2 horas!
        await supabase.from('agendamentos').update({ status: 'cancelado' }).eq('id', id);

        await supabase
            .from('disponibilidades')
            .update({ vagas_ocupadas: agendamento.disponibilidades.vagas_ocupadas - 1 })
            .eq('id', agendamento.disponibilidades.id);

        res.json({ mensagem: '[ADMIN] Agendamento cancelado forçadamente.' });
    } catch (error) {
        console.error('Erro no cancelamento admin:', error.message);
        res.status(500).json({ erro: 'Erro interno na operação administrativa.' });
    }
=======
const db = require('../config/database');

// Função para Agendar Serviço
exports.criar = (req, res) => {
    const { servico_id, data_hora } = req.body;
    const usuario_id = req.usuario.id; // Veio do nosso Middleware!

    const dataAgendamento = new Date(data_hora);

    // Regra 1: Não agendar no passado
    if (dataAgendamento < new Date()) {
        return res.status(400).json({ erro: 'Não é possível agendar em um horário que já passou.' });
    }

    // Regra 2: Prevenir Overbooking (horário já reservado por outro)
    const queryDisponibilidade = `SELECT * FROM agendamentos WHERE data_hora = ? AND status = 'Agendado'`;

    db.get(queryDisponibilidade, [data_hora], (err, conflito) => {
        if (err) return res.status(500).json({ erro: 'Erro no servidor.' });
        if (conflito) return res.status(400).json({ erro: 'Este horário já está reservado.' });

        // Se passou por tudo, salva no banco
        const insertQuery = `INSERT INTO agendamentos (usuario_id, servico_id, data_hora) VALUES (?, ?, ?)`;
        db.run(insertQuery, [usuario_id, servico_id, data_hora], function(err){
            if (err) return res.status(500).json({ erro: 'Erro ao criar agendamento.' });
            res.status(201).json({ mensagem: 'Agendamento realizado com sucesso!', id: this.lastID });
        });
    });
};

// Função para Cancelar Serviço
exports.cancelar = (req, res) => {
    const agendamento_id = req.params.id;
    const usuario_id = req.usuario.id; // Garante que o usuário só cancele o PRÓPRIO agendamento

    const query = `SELECT data_hora FROM agendamentos WHERE id = ? AND usuario_id = ? AND status = 'Agendado'`;

    db.get(query, [agendamento_id, usuario_id], (err, agendamento) => {
        if (err) return res.status(500).json({ erro: 'Erro no servidor.' });
        if (!agendamento) return res.status(404).json({ erro: 'Agendamento não encontrado.' });

        // Regra 3: Restrição de 2 horas para cancelamento
        const dataAgendamento = new Date(agendamento.data_hora);
        const agora = new Date();

        // Calcula a diferença em horas
        const diferencaHoras = (dataAgendamento - agora) / (1000 * 60 * 60);

        if (diferencaHoras < 2) {
            return res.status(400).json({
                erro: 'Cancelamento negado. A antecedência mínima é de 2 horas para não prejudicar as aulas práticas.'
            });
        }

        // Se estiver no prazo, atualiza o status para 'Cancelado'
        const updateQuery = `UPDATE agendamentos SET status = 'Cancelado' WHERE id = ?`;
        db.run(updateQuery, [agendamento_id], function(err){
            if (err) return res.status(500).json({ erro: 'Erro ao cancelar.' });
            res.json({ mensagem: 'Agendamento cancelado com sucesso.' });
        });
    });
};

// Função para Listar os Agendamentos do Usuário Logado (Com Lazy Update)
exports.listarMeus = (req, res) => {
    const usuario_id = req.usuario.id;

    // 1. Pegar a data e hora atual e ajustar para o fuso horário local
    // O input 'datetime-local' do HTML salva no formato YYYY-MM-DDTHH:mm
    const agora = new Date();
    const tzOffset = agora.getTimezoneOffset() * 60000; // Diferença de fuso em milissegundos
    const dataAtualLocal = new Date(agora.getTime() - tzOffset).toISOString().slice(0, 16);

    // 2. Lazy Update: Atualiza para 'Concluido' tudo o que já passou da data atual
    const updateQuery = `
        UPDATE agendamentos
        SET status = 'Concluido'
        WHERE usuario_id = ? AND status = 'Agendado' AND data_hora < ?
    `;

    db.run(updateQuery, [usuario_id, dataAtualLocal], (err) => {
        if (err) {
            console.error('Erro ao fazer a atualização preguiçosa (Lazy Update):', err);
        }

        // 3. Após atualizar (ou se não houver nada a atualizar), busca os dados reais
        const selectQuery = `
            SELECT a.id, a.data_hora, a.status, s.nome as servico_nome
            FROM agendamentos a
            LEFT JOIN servicos s ON a.servico_id = s.id
            WHERE a.usuario_id = ?
            ORDER BY a.data_hora DESC
        `;

        db.all(selectQuery, [usuario_id], (err, agendamentos) => {
            if (err) return res.status(500).json({ erro: 'Erro ao buscar agendamentos.' });
            res.json(agendamentos);
        });
    });
};

// Função para a Coordenação: Listar TODOS os agendamentos do sistema
exports.listarTodos = (req, res) => {
    // JOIN triplo: Trazemos os dados do Agendamento, o Nome do Serviço e o Nome do Cliente (Usuário)
    const query = `
        SELECT a.id, a.data_hora, a.status, s.nome as servico_nome, u.nome as cliente_nome, u.telefone
        FROM agendamentos a
        INNER JOIN servicos s ON a.servico_id = s.id
        INNER JOIN usuarios u ON a.usuario_id = u.id
        ORDER BY a.data_hora DESC
    `;

    db.all(query, [], (err, agendamentos) => {
        if (err) return res.status(500).json({ erro: 'Erro ao buscar todos os agendamentos.' });
        res.json(agendamentos);
    });
>>>>>>> e07bd8c7e6080daa48705b3c909a3ed090e004e2
};