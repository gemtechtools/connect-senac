
```markdown
# [CONTEXTO PARA I.A.] Documentação Técnica - Connect Senac MVP

**Atenção I.A.:** Leia este documento inteiramente antes de sugerir qualquer código. Ele contém as regras de negócio, a arquitetura de software e as restrições de infraestrutura do sistema "Connect Senac". Ao final da leitura, atue como um Desenvolvedor Full-Stack Sênior pronto para evoluir este MVP.

## 1. Visão Geral do Projeto
* **Nome:** Connect Senac
* **Status:** MVP V1.0 (Finalizado e em Produção)
* **Objetivo:** Sistema de agendamento web responsivo para serviços de beleza (cursos práticos do SENAC), focado em reduzir o absenteísmo e automatizar a gestão de horários para a coordenação.
* **Ambiente de Produção:** Render.com (Web Service único).

## 2. Stack Tecnológica Base
* **Back-end:** Node.js (v20 LTS), Express.js.
* **Front-end:** HTML5, CSS3, JavaScript (Vanilla - ES6+), Bootstrap 5 (via CDN). Sem frameworks de compilação (ex: sem React/Angular).
* **Banco de Dados:** SQLite (Driver `sqlite3`).
* **Segurança:** Autenticação Stateless com `jsonwebtoken` (JWT) e criptografia de senhas com `bcrypt`.
* **Arquitetura:** Monolito unificado. O Front-end é servido estaticamente pelo próprio Node.js via `app.use(express.static(path.join(__dirname, 'frontend')));`.

## 3. Estrutura de Diretórios (Padrão MVC no Back-end)
```text
connect-senac/
├── backend/
│   ├── config/
│   │   ├── database.js (Conexão SQLite e Seeding de Serviços)
│   │   └── database.sqlite (Arquivo DB gerado dinamicamente)
│   ├── controllers/
│   │   ├── usuarioController.js (Login, Registo)
│   │   └── agendamentoController.js (Criar, Cancelar, ListarMeus, ListarTodos)
│   ├── middlewares/
│   │   └── authMiddleware.js (Verificação de JWT Bearer Token)
│   └── routes/
│   │   ├── usuarioRoutes.js (/api/usuarios)
│   │   └── agendamentoRoutes.js (/api/agendamentos)
├── frontend/
│   ├── index.html (Login)
│   ├── cadastro.html (Registo + LGPD)
│   ├── painel.html (Área do Cliente)
│   ├── admin.html (Visão da Coordenação)
│   └── js/
│       ├── auth.js
│       ├── painel.js
│       └── admin.js
├── .env (PORT, JWT_SECRET)
├── server.js (Ponto de entrada, Configuração Express e CORS)
└── package.json

```

## 4. Regras de Negócio Ativas (CRÍTICO)

Qualquer nova implementação deve respeitar estas regras:

1. **LGPD no Cadastro:** O registo de utilizadores exige campos `BOOLEAN (0 ou 1)` no banco de dados para `consentimento_termos` (obrigatório) e `consentimento_imagem` (opcional).
2. **Regra de Overbooking:** Não é permitido o cadastro de dois agendamentos no mesmo `data_hora` com status `Agendado`.
3. **Restrição de Cancelamento:** O endpoint de cancelar (`PUT /api/agendamentos/:id/cancelar`) possui um bloqueio temporal. O cliente **não pode** cancelar com menos de **2 horas de antecedência** da hora agendada.
4. **Lazy Update (Atualização Preguiçosa de Tempo):** O banco de dados não roda CRON Jobs. A verificação se um agendamento já expirou ocorre no `agendamentoController.js` (rota `GET /meus`). Antes de devolver a lista, o backend calcula o fuso horário local e executa um `UPDATE` mudando agendamentos passados de `Agendado` para `Concluido`.

## 5. Convenções de Código e Integração

1. **Rotas de API Dinâmicas (Front-end):** Os ficheiros no diretório `frontend/js/` configuram a `API_URL` dinamicamente. Exemplo obrigatório:
`const API_URL = window.location.protocol === 'file:' ? 'http://localhost:3000/api' : \`${window.location.origin}/api`;`
2. **Segurança em Requisições:** Todas as rotas protegidas exigem o cabeçalho `Authorization: Bearer <token_do_localStorage>`.
3. **Manipulação do DOM:** Utilizar apenas `document.getElementById` e manipulação via `innerHTML` ou `document.createElement`.

## 6. Restrições de Deploy (Render.com)

* **Problema de GLIBC (SQLite):** Devido a incompatibilidades de bibliotecas C++ no ambiente Linux do Render, o `node_modules` e `package-lock.json` **NÃO** devem ser versionados.
* **Build Command Obrigatório:** Qualquer instrução de CI/CD ou ajuste no `package.json` deve considerar que o comando de build no servidor é estritamente:
`rm -rf node_modules package-lock.json && npm install && npm rebuild sqlite3 bcrypt --build-from-source`
* **Persistência Efêmera:** Como o Render usa disco efêmero, o ficheiro `database.sqlite` é reiniciado a cada novo deploy. O `database.js` possui uma função de *Seeding* que repopula a tabela `servicos` se ela estiver vazia no *startup*.

## 7. Diretrizes para a I.A. (Como você deve agir a partir de agora)

Ao receber um pedido para adicionar uma nova funcionalidade (ex: "Adicionar recuperação de senha" ou "Criar tabela de horários bloqueados"):

1. **Não reescreva tudo:** Altere apenas os ficheiros estritamente necessários para a nova funcionalidade.
2. **Iteração Ágil:** Apresente o código do Back-end (Model/Database -> Controller -> Route) e aguarde aprovação antes de gerar o código do Front-end (HTML -> JS).
3. **Explicação Didática:** O utilizador é um Instrutor Técnico. Sempre explique *o porquê* das suas escolhas arquiteturais (ex: por que usar `LEFT JOIN` ou qual o princípio SOLID aplicado) para que ele possa transmitir o conhecimento aos alunos.
4. **Foco em Segurança:** Nunca introduza vulnerabilidades de SQL Injection. Continue utilizando parâmetros preparados `[?]` no SQLite.

---

Se você me compreendeu, responda apenas: "Contexto Connect Senac MVP assimilado com sucesso!