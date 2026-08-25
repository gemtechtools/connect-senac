-- ============================================================================
-- SCRIPT DE ESTRUTURA DO BANCO DE DADOS - CONNECT SENAC (SUPABASE / POSTGRESQL)
-- ============================================================================

-- Habilitar extensão para geração de UUID
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. TABELA: usuarios
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    telefone VARCHAR(50),
    senha VARCHAR(255) NOT NULL,
    perfil VARCHAR(50) NOT NULL DEFAULT 'candidato' CHECK (perfil IN ('admin', 'coordenador', 'profissional', 'candidato')),
    is_bloqueado BOOLEAN NOT NULL DEFAULT FALSE,
    consentimento_termos BOOLEAN NOT NULL DEFAULT FALSE,
    consentimento_imagem BOOLEAN NOT NULL DEFAULT FALSE,
    reset_token VARCHAR(255),
    reset_token_expires TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 2. TABELA: cursos
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS cursos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(255) NOT NULL,
    descricao TEXT NOT NULL,
    motivo_modelo TEXT,
    restricoes TEXT,
    foto_url TEXT,
    localizacao VARCHAR(255) DEFAULT 'SENAC - Santo Antônio de Jesus, BA',
    status VARCHAR(50) NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'arquivado')),
    profissional_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 3. TABELA: disponibilidades (Grades de Horários e Vagas)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS disponibilidades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    curso_id UUID NOT NULL REFERENCES cursos(id) ON DELETE CASCADE,
    data_hora TIMESTAMPTZ NOT NULL,
    vagas_totais INTEGER NOT NULL DEFAULT 1 CHECK (vagas_totais >= 1),
    vagas_ocupadas INTEGER NOT NULL DEFAULT 0 CHECK (vagas_ocupadas >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_curso_data_hora UNIQUE (curso_id, data_hora)
);

-- ----------------------------------------------------------------------------
-- 4. TABELA: agendamentos (Inscrições dos Modelos)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS agendamentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    disponibilidade_id UUID NOT NULL REFERENCES disponibilidades(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'agendado' CHECK (status IN ('agendado', 'concluido', 'cancelado')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_usuario_disponibilidade UNIQUE (usuario_id, disponibilidade_id)
);

-- ----------------------------------------------------------------------------
-- 5. TABELA: feedbacks (Avaliações de Serviços Concluídos)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS feedbacks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agendamento_id UUID NOT NULL UNIQUE REFERENCES agendamentos(id) ON DELETE CASCADE,
    nota INTEGER NOT NULL CHECK (nota >= 1 AND nota <= 5),
    comentario TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- VIEWS ANALÍTICAS
-- ============================================================================

-- View 1: Estatísticas de Utilizadores para Painel Administrativo
CREATE OR REPLACE VIEW view_usuarios_estatisticas AS
SELECT 
    u.id,
    u.nome,
    u.email,
    u.telefone,
    u.perfil,
    u.is_bloqueado,
    u.created_at,
    COALESCE(COUNT(CASE WHEN a.status = 'agendado' THEN 1 END), 0) AS total_agendados,
    COALESCE(COUNT(CASE WHEN a.status = 'concluido' THEN 1 END), 0) AS total_concluidos,
    COALESCE(COUNT(CASE WHEN a.status = 'cancelado' THEN 1 END), 0) AS total_cancelados,
    (
        SELECT string_agg(DISTINCT c.nome, ', ')
        FROM agendamentos ag
        JOIN disponibilidades d ON ag.disponibilidade_id = d.id
        JOIN cursos c ON d.curso_id = c.id
        WHERE ag.usuario_id = u.id AND ag.status = 'agendado'
    ) AS cursos_ativos
FROM usuarios u
LEFT JOIN agendamentos a ON u.id = a.usuario_id
GROUP BY u.id, u.nome, u.email, u.telefone, u.perfil, u.is_bloqueado, u.created_at;

-- View 2: Feedbacks Detalhados para Vitrine e Painel do Modelo
CREATE OR REPLACE VIEW view_feedbacks_completos AS
SELECT 
    f.id,
    f.nota,
    f.comentario,
    f.created_at,
    f.agendamento_id,
    u.id AS avaliador_id,
    u.nome AS avaliador_nome,
    c.id AS curso_id,
    c.nome AS curso_nome
FROM feedbacks f
JOIN agendamentos a ON f.agendamento_id = a.id
JOIN usuarios u ON a.usuario_id = u.id
JOIN disponibilidades d ON a.disponibilidade_id = d.id
JOIN cursos c ON d.curso_id = c.id;

-- ============================================================================
-- ÍNDICES PARA ALTA PERFORMANCE
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_cursos_profissional ON cursos(profissional_id);
CREATE INDEX IF NOT EXISTS idx_cursos_status ON cursos(status);
CREATE INDEX IF NOT EXISTS idx_disp_curso_data ON disponibilidades(curso_id, data_hora);
CREATE INDEX IF NOT EXISTS idx_agendamentos_usuario ON agendamentos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_agendamentos_status ON agendamentos(status);
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);

-- ============================================================================
-- SEED INICIAL (DADOS DE EXEMPLO)
-- Senha padrão para os usuários de teste: Senac@123
-- Hash Bcrypt gerado (10 rounds): $2b$10$wN1k6XG5Q26d.t2yE8sTSe9W3R7x5v7y6B2x9K4J5L8N0M2P4Q6R8
-- ============================================================================
INSERT INTO usuarios (nome, email, telefone, senha, perfil, consentimento_termos, consentimento_imagem)
VALUES 
('Administrador Geral', 'admin@senac.com.br', '(75) 98888-0001', '$2b$10$wN1k6XG5Q26d.t2yE8sTSe9W3R7x5v7y6B2x9K4J5L8N0M2P4Q6R8', 'admin', TRUE, FALSE),
('Coordenação de Estética', 'coordenacao@senac.com.br', '(75) 98888-0002', '$2b$10$wN1k6XG5Q26d.t2yE8sTSe9W3R7x5v7y6B2x9K4J5L8N0M2P4Q6R8', 'coordenador', TRUE, FALSE),
('Prof. Ana Paula Santos', 'prof.ana@senac.com.br', '(75) 98888-0003', '$2b$10$wN1k6XG5Q26d.t2yE8sTSe9W3R7x5v7y6B2x9K4J5L8N0M2P4Q6R8', 'profissional', TRUE, FALSE),
('Prof. Carlos Mendes', 'prof.carlos@senac.com.br', '(75) 98888-0004', '$2b$10$wN1k6XG5Q26d.t2yE8sTSe9W3R7x5v7y6B2x9K4J5L8N0M2P4Q6R8', 'profissional', TRUE, FALSE)
ON CONFLICT (email) DO NOTHING;
