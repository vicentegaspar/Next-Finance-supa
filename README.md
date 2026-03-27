# Clarix PFM 💎 -- Gestão Financeira Pessoal com Next.js & Supabase

**Clarix** é uma plataforma robusta de finanças pessoais desenvolvida para oferecer controle total sobre patrimônio, fluxo de caixa e planejamento financeiro. Utilizando uma arquitetura de multi-tenancy (Workspaces), o Clarix permite que usuários separem suas finanças pessoais de finanças empresariais ou familiares em um ambiente seguro e performático.

---

## 🚀 Funcionalidades Atuais

### 📊 Dashboard Inteligente (Ametista UI)
- **Fluxo de Caixa:** Gráficos de área (AreaCharts) com gradientes modernos para visualização de entrada e saída.
- **Distribuição de Gastos:** PieCharts dinâmicos para análise por categorias de despesa.
- **Cards de Status:** Visão consolidada de Saldo Atual, Receitas e Despesas com efeitos de vidro (Glassmorphism).

### 🏢 Arquitetura Multi-Tenancy
- **Workspaces Ilimitados:** Troque de contexto (Ex: Pessoal vs. Business) instantaneamente através do Sidebar.
- **Isolamento de Dados:** Segurança via RLS (Row Level Security) do PostgreSQL no nível do banco de dados.

### 💰 Gestão de Ativos & Passivos
- **Transações:** Filtros avançados, busca textual e formulários rápidos para receitas/despesas.
- **Contas Bancárias:** Gerencie saldos em múltiplos bancos e carteiras.
- **Metas (Cofrinhos):** Acompanhe o progresso de sonhos financeiros com barras de conclusão.
- **Investimentos:** Portfólio completo com Preço Médio e Saldo Posicionado (Renda Fixa, Variável, Cripto).
- **Cartões de Crédito:** Controle de limites, faturas parciais e datas de fechamento/vencimento.
- **Dívidas & Empréstimos:** Gestão de obrigações (a pagar) e direitos (a receber).

### 🗓️ Inteligência de Tempo
- **Calendário Financeiro:** Visão mensal unificada de vencimentos de cartões, contas pendentes e metas.
- **Perfil do Usuário:** Editor de perfil com suporte a avatares e iniciais dinâmicas.

---

## 🛠️ Tecnologias Utilizadas

- **Framework:** [Next.js 16.2.1](https://nextjs.org/) (Turbopack + App Router)
- **Linguagem:** TypeScript
- **Backend/DB:** [Supabase](https://supabase.com/) (PostgreSQL + Auth + RLS)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Componentes UI:** [Shadcn/ui](https://ui.shadcn.com/) (Migrado para **Base UI** para compatibilidade total com React 19)
- **Gráficos:** [Recharts](https://recharts.org/)
- **Iconografia:** [Lucide React](https://lucide.dev/)

---

## ⚙️ Como Instalar e Rodar Localmente

### Pré-requisitos
- Node.js 20+ instalado.
- [Supabase CLI](https://supabase.com/docs/guides/cli) instalado (para banco de dados local).
- Docker rodando (para as instâncias do Supabase).

### Passo a Passo

1. **Clonar o Repositório:**
   ```bash
   git clone https://github.com/seu-usuario/clarix-pfm.git
   cd clarix-pfm
   ```

2. **Instalar Dependências:**
   ```bash
   npm install
   ```

3. **Configurar Variáveis de Ambiente:**
   Crie um arquivo `.env.local` com base no `.env.example`:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key_local
   SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key
   ```

4. **Inicializar o Banco de Dados (Local):**
   Certifique-se de que o Docker está aberto e execute:
   ```bash
   supabase start
   ```
   *As migrações serão aplicadas automaticamente. Se precisar aplicar manualmente:*
   ```bash
   supabase migration up
   ```

5. **Rodar o Servidor de Desenvolvimento:**
   ```bash
   npm run dev
   ```
   Acesse: [http://localhost:3000](http://localhost:3000)

---

## 🔮 Roadmap - Funcionalidades Futuras

- [ ] **Sincronização Bancária (Open Finance):** Conexão automática com bancos brasileiros (Pluggy/Belvo).
- [ ] **Transações Recorrentes:** Automação de assinaturas e contas fixas (Netflix, Aluguel).
- [ ] **Notificações Push / Email:** Alertas automáticos para contas que vencem amanhã.
- [ ] **Workspaces Compartilhados:** Convite de usuários para gerir finanças em conjunto (Casal/Equipe).
- [ ] **Gerador de Relatórios em PDF:** Exportação de balancetes mensais e anuais formatados.
- [ ] **Dashboard de Investimentos Avançado:** Integração com APIs de cotação em tempo real (Yahoo Finance/AlphaVantage).

---

Desenvolvido com 💜 para transformar sua vida financeira.
