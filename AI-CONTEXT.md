# [CONTEXTO TÉCNICO] Documentação do Sistema - Connect Senac

## 1. Visão Geral do Projeto
* **Nome:** Connect Senac
* **Status:** Versão Completa (Produção / Supabase)
* **Objetivo:** Sistema web responsivo para gestão e agendamento de modelos voluntários em cursos práticos do SENAC, com controle de capacidade de vagas, gestão de absenteísmo, pautas globais de presença e avaliações pós-atendimento.
* **Ambiente de Hospedagem:** Render.com (Web Service Node.js) conectado ao **Supabase (PostgreSQL)**.

---

## 2. Stack Tecnológica
* **Back-end:** Node.js (v20 LTS), Express.js.
* **Banco de Dados:** PostgreSQL hospedado no **Supabase** via `@supabase/supabase-js`.
* **Front-end:** HTML5 semântico, CSS3, JavaScript Vanilla (ES6+) e Bootstrap 5 (CDN).
* **Segurança:** Autenticação stateless via JWT (`jsonwebtoken`), criptografia Bcrypt (`bcrypt`), verificação de bloqueio em tempo real e controle de acesso granular baseado em perfis (RBAC).
* **Processamento em Background:** Motor `node-cron` para notificações preventivas de agendamentos com 24h e 3h de antecedência.

---

## 3. Estrutura de Diretórios
```text
connect-senac/
├── backend/
│   ├── config/
│   │   ├── database.js               # Conexão com o Supabase
│   │   └── schema.sql                # DDL, Views e Seeds do banco de dados
│   ├── controllers/
│   │   ├── adminController.js        # Gestão de usuários, moderação, pautas globais
│   │   ├── agendamentoController.js  # Regras de agendamento e cancelamento
│   │   ├── cursoController.js        # Gestão do catálogo de cursos
│   │   ├── dashboardController.js    # Métricas consolidadas e absenteísmo
│   │   ├── disponibilidadeController.js # Controle de datas, horários e vagas
│   │   ├── feedbackController.js     # Avaliações (1 a 5 estrelas) pós-serviço
│   │   ├── profissionalController.js # Pauta do docente e confirmação de presença
│   │   └── usuarioController.js      # Cadastro (LGPD), login e recuperação de senha
│   ├── cron/
│   │   └── notificador.js            # Motor de notificações em background
│   ├── middlewares/
│   │   ├── authMiddleware.js         # Validação de JWT e checagem de bloqueio
│   │   └── rbacMiddleware.js         # Autorização por perfil (RBAC)
│   └── routes/                       # Roteadores Express REST
├── frontend/
│   ├── admin.html                    # Painel do Administrador e Coordenador
│   ├── cadastro.html                 # Registro de novos usuários com LGPD
│   ├── esqueci-senha.html            # Solicitação de recuperação de senha
│   ├── redefinir-senha.html          # Redefinição com token
│   ├── index.html                    # Login com redirecionamento inteligente
│   ├── painel.html                   # Área do Candidato / Modelo
│   ├── profissional.html             # Área do Docente / Professor
│   └── js/                           # Scripts dos clientes front-end
├── .env.example                      # Modelo de variáveis de ambiente
├── server.js                         # Servidor Express e roteamento estático
└── package.json                      # Dependências e scripts de execução
```

---

## 4. Perfis de Usuário (RBAC)
1. **`admin`**: Acesso completo a métricas, criação de colaboradores (`admin`, `coordenador`, `profissional`), moderação (bloqueio/desbloqueio), promoção de cargos, catálogo de cursos e cancelamento de emergência com override.
2. **`coordenador`**: Acesso a métricas, catálogo de cursos, abertura de vagas, consulta a pautas globais e exclusão de contas de candidatos.
3. **`profissional`**: Acesso a turmas vinculadas ao seu ID, controle de presença, cancelamento por falta e chamada de modelos com atalho WhatsApp.
4. **`candidato`**: Visualização do catálogo de cursos ativos, agendamento em vagas disponíveis, cancelamento com mais de 2h de antecedência e envio de feedbacks pós-conclusão.

---

## 5. Regras de Negócio Críticas
1. **LGPD no Cadastro:** Consentimento obrigatório de termos de uso (`consentimento_termos = true`) e opcional para uso de imagem (`consentimento_imagem`).
2. **Prevenção de Overbooking:** Inscrição atômica validando `vagas_ocupadas < vagas_totais` e constraint `UNIQUE (usuario_id, disponibilidade_id)`.
3. **Cancelamento do Candidato:** Bloqueio de cancelamento com menos de 2 horas de antecedência ao horário marcado. Administradores possuem rota com override.
4. **Validação de Propriedade do Docente:** Professores só podem dar baixa em agendamentos de cursos aos quais estejam vinculados como responsáveis.
5. **Feedbacks Únicos:** Apenas agendamentos com status `concluido` podem ser avaliados, com limite de 1 avaliação por atendimento.