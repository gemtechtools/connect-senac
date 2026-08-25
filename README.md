# Connect Senac 🎓✨

Sistema Web de Gestão e Agendamento de Modelos Voluntários para Cursos Práticos do SENAC.

---

## 🚀 Funcionalidades Principais

* **Vitrine Dinâmica de Serviços:** Catálogo de cursos com descrição, fotos, benefícios, restrições e horários disponíveis.
* **Agendamento em Tempo Real:** Reserva instantânea com bloqueio de overbooking e controle de capacidade de vagas.
* **Controle de Absenteísmo & Cancelamentos:** Política temporal de cancelamento (mínimo de 2h de antecedência) e cálculo automático da taxa de cancelamento.
* **Painel do Docente:** Acesso exclusivo do professor para gerenciar suas turmas, realizar chamada em tempo real, dar baixa nas presenças e contatar alunos via WhatsApp com 1 clique.
* **Central de Administração & Moderação (RBAC):** Métricas operacionais, gerenciamento de usuários (bloqueio/desbloqueio e promoção de cargos), criação de colaboradores institucionais e pautas globais de todos os cursos.
* **Sistema de Avaliações (Feedbacks):** Avaliação de 1 a 5 estrelas e depoimentos pós-atendimento para feedback pedagógico dos alunos.
* **Motor de Notificações Automáticas (Cron):** Varredura preventiva disparando alertas de agendamento 24h e 3h antes do início do curso.
* **Conformidade com a LGPD:** Registro de consentimento de termos de uso e autorização de uso de imagem.

---

## 🛠️ Stack Tecnológica

* **Back-end:** Node.js (v20 LTS), Express.js.
* **Banco de Dados:** PostgreSQL hospedado no **Supabase** via `@supabase/supabase-js`.
* **Front-end:** HTML5, CSS3, JavaScript Vanilla (ES6+) e Bootstrap 5 (via CDN).
* **Segurança:** Autenticação stateless com JWT (`jsonwebtoken`) e criptografia com Bcrypt.
* **Background Tasks:** `node-cron`.

---

## 📦 Como Instalar e Rodar Localmente

### 1. Clonar o repositório e instalar dependências
```bash
git clone <url-do-repositorio>
cd connect-senac
npm install
```

### 2. Configurar o Banco de Dados no Supabase
1. Crie um projeto gratuito no [Supabase](https://supabase.com/).
2. Abra o **SQL Editor** no painel do Supabase.
3. Copie o conteúdo do arquivo [`backend/config/schema.sql`](backend/config/schema.sql) e execute-o.
4. O script criará todas as tabelas (`usuarios`, `cursos`, `disponibilidades`, `agendamentos`, `feedbacks`), views analíticas, índices e usuários padrão de teste.

### 3. Configurar as Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto baseado no `.env.example`:
```env
PORT=3000
JWT_SECRET=sua_chave_jwt_secreta
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_KEY=sua-chave-anon-ou-service-role
```

### 4. Iniciar o Servidor
```bash
# Modo de desenvolvimento com auto-reload
npm run dev

# Ou modo de produção padrão
npm start
```
Acesse a aplicação no navegador em: `http://localhost:3000`

---

## 👥 Contas de Teste Pré-configuradas (Seeds)

Após executar o `schema.sql`, as seguintes contas estarão disponíveis com a senha padrão `Senac@123`:

| Perfil | E-mail | Acesso / Painel |
| :--- | :--- | :--- |
| **Administrador** | `admin@senac.com.br` | `admin.html` (Acesso total) |
| **Coordenador** | `coordenacao@senac.com.br` | `admin.html` (Gestão de cursos e vagas) |
| **Docente** | `prof.ana@senac.com.br` | `profissional.html` (Pauta de presença) |
| **Docente** | `prof.carlos@senac.com.br` | `profissional.html` (Pauta de presença) |

Novos **Candidatos/Modelos** podem ser registrados diretamente na tela de cadastro (`cadastro.html`).

---

## 🌐 Guia de Deploy (Render.com)

1. Crie um **Web Service** no [Render.com](https://render.com/) apontando para o repositório.
2. **Environment:** `Node`
3. **Build Command:** `npm install`
4. **Start Command:** `npm start`
5. Adicione as variáveis de ambiente (`PORT`, `JWT_SECRET`, `SUPABASE_URL`, `SUPABASE_KEY`) nas configurações do serviço no Render.

---

## 📄 Licença
Projeto acadêmico e institucional desenvolvido para o SENAC Bahia.
