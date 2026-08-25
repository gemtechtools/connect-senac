// backend/cron/notificador.js
const cron = require('node-cron');
const supabase = require('../config/database');

// Conjunto para evitar disparos duplicados na mesma execução
const notificacoesEnviadas = new Set();

// Expressão CRON: '* * * * *' executa a cada minuto
cron.schedule('* * * * *', async () => {
    try {
        const agora = new Date();

        // 1. Procurar agendamentos com status 'agendado'
        const { data: agendamentos, error } = await supabase
            .from('agendamentos')
            .select(`
                id,
                status,
                usuarios ( id, nome, email, telefone ),
                disponibilidades!inner ( id, data_hora, cursos ( id, nome ) )
            `)
            .eq('status', 'agendado');

        if (error) throw error;
        if (!agendamentos || agendamentos.length === 0) return;

        for (const ag of agendamentos) {
            if (!ag.disponibilidades || !ag.disponibilidades.data_hora) continue;

            const dataCurso = new Date(ag.disponibilidades.data_hora);
            const diferencaEmMinutos = Math.round((dataCurso.getTime() - agora.getTime()) / (1000 * 60));

            // Se o horário já passou há mais de 1 hora, atualiza preguiçosamente para 'concluido'
            if (diferencaEmMinutos < -60) {
                await supabase
                    .from('agendamentos')
                    .update({ status: 'concluido' })
                    .eq('id', ag.id);
                continue;
            }

            // Janela de 24 horas (entre 1435 e 1445 minutos)
            const chave24h = `${ag.id}_24h`;
            if (diferencaEmMinutos >= 1435 && diferencaEmMinutos <= 1445 && !notificacoesEnviadas.has(chave24h)) {
                notificacoesEnviadas.add(chave24h);
                dispararNotificacao(ag, dataCurso, '24 horas');
            }

            // Janela de 3 horas (entre 175 e 185 minutos)
            const chave3h = `${ag.id}_3h`;
            if (diferencaEmMinutos >= 175 && diferencaEmMinutos <= 185 && !notificacoesEnviadas.has(chave3h)) {
                notificacoesEnviadas.add(chave3h);
                dispararNotificacao(ag, dataCurso, '3 horas');
            }
        }

        // Limpa o cache de notificações enviadas periodicamente para não acumular memória
        if (notificacoesEnviadas.size > 5000) notificacoesEnviadas.clear();

    } catch (error) {
        console.error('❌ [CRON ERRO] Falha ao processar notificações:', error.message);
    }
});

function dispararNotificacao(ag, dataCurso, antecedencia) {
    const curso = ag.disponibilidades?.cursos?.nome || 'Curso Prático';
    const cliente = ag.usuarios?.nome || 'Modelo Voluntário';
    const email = ag.usuarios?.email || 'Sem e-mail';
    const horaFormatada = dataCurso.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });

    console.log(`\n🔔 [NOTIFICAÇÃO DISPARADA - ${antecedencia.toUpperCase()} DE ANTECEDÊNCIA]`);
    console.log(`📧 Destinatário: ${cliente} <${email}>`);
    console.log(`📌 Mensagem: Olá, ${cliente}! Lembramos que o seu agendamento para "${curso}" ocorrerá em ${horaFormatada}.`);
    console.log(`⚠️ Regra de Cancelamento: Caso não possa comparecer, cancele no sistema com no mínimo 2 horas de antecedência.\n`);
}

console.log('⏳ Motor de Notificações (CRON) ativado e a aguardar...');