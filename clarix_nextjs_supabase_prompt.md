# Prompt para Replicação do Clarix: Plataforma de Gestão Financeira Pessoal (PFM)

Você é um desenvolvedor Full-Stack sênior especialista em **Next.js (App Router)**, **React**, **TypeScript**, **Tailwind CSS** e **Supabase**. O objetivo deste projeto é recriar e evoluir uma aplicação de Gestão Financeira Pessoal (PFM) chamada **Clarix**, mudando a stack atual (SvelteKit) para uma arquitetura moderna, robusta e escalável utilizando Next.js e Supabase.

A aplicação se destaca pela alta fidelidade na experiência do usuário (UX/UI), tema escuro ("Ametista") e foco forte em multi-tenancy (permitindo o gerenciamento de múltiplos contextos financeiros, como Pessoal, Familiar e Empresarial, na mesma conta principal).

Abaixo estão todos os detalhes, requisitos, arquitetura e features para que você possa planejar e desenvolver esta aplicação do zero.

---

## 1. Visão Geral da Arquitetura e Stack Tecnológica

### Frontend
*   **Framework:** Next.js (versão mais recente, App Router).
*   **Linguagem:** TypeScript (Strict mode ativado).
*   **Estilização:** Tailwind CSS v4 (Tema personalizado "Ametista", interface predominantemente Dark Mode com tons de roxo/ametista).
*   **Componentes de UI:** Shadcn/ui (ou Radix UI puro), visando alta acessibilidade e customização.
*   **Ícones:** Lucide React (equivalente ao Lucide Svelte utilizado anteriormente).
*   **Gráficos:** Recharts ou Chart.js integrado ao React.
*   **Gerenciamento de Estado:** React Context + Hooks nativos (usando Zustand caso necessário para estados globais complexos que fujam da edge do App Router).
*   **Data Fetching:** Server Components do Next.js + Server Actions para mutações.

### Backend & Banco de Dados (BaaS)
*   **Plataforma:** Supabase.
*   **Banco de Dados:** PostgreSQL (com schema e relacionamentos complexos).
*   **Autenticação:** Supabase Auth (Email/Senha, OAuth, etc.).
*   **Segurança e Acesso:** Row Level Security (RLS) habilitado em 100% das tabelas para garantir o isolamento de dados no esquema Multi-Tenancy. O usuário só pode ver dados do *Tenant* (contexto) em que está operando.

---

## 2. Modelagem de Dados e Relacionamentos Essenciais

O coração do sistema é o recurso de **Multi-Tenancy**. Um usuário (User) pode pertencer e alternar entre vários Contextos Financeiros (Workspaces/Tenants). 

Principais Entidades no Supabase:
1.  **Users** (Autenticação baseada em Supabase Auth).
2.  **Workspaces (Contextos):** Ex: Pessoal, Empresa, Família. Todo o restante do sistema pertence a um Workspace.
3.  **Workspace_Users:** Permite que mais de um usuário colabore em um contexto (ex: cônjuges no contexto Familiar).
4.  **Accounts (Contas Bancárias):** Corrente, Poupança, Carteira, etc. Relacionado a um Workspace.
5.  **Categories:** Categorização hierárquica (Categorias pai x Categorias filhas). Ex: Alimentação -> Supermercado.
6.  **Transactions:** (Livro razão) Receitas, despesas, transferências. Ligadas a Contas, Categorias, Workspaces e Data.
7.  **Credit_Cards:** Gerenciamento visual, fatura atual, limite usado.
8.  **Investments:** Controle de portfólio, ativos (Ações, FIIs, Cripto), saldo, cotação estimada.
9.  **Debts (Dívidas/Empréstimos):** Controle de parcelamentos de veículos, imóveis, empréstimos pessoais.
10. **Goals (Metas/Cofrinhos):** Objetivos de economia com valores alvo e valores atuais.

---

## 3. Funcionalidades Detalhadas (Features)

Espera-se que a aplicação tenha as seguintes páginas e módulos:

### 3.1. Autenticação e Onboarding
*   Login e Registro utilizando Supabase Auth.
*   Criação do primeiro "Workspace" (Contexto Financeiro) durante o onboarding.

### 3.2. Dashboard (Tela Inicial)
*   Visão macro do saldo líquido, receitas x despesas do mês, e variação de patrimônio.
*   Gráficos dinâmicos de fluxo de caixa e despesas por categoria.
*   Aviso rápido de transações ou faturas vencendo nos próximos dias.
*   Seletor global de Workspace no Header (Top navigation).

### 3.3. Transações (O Livro Razão) `/transactions`
*   Tela de tabela interativa (Data Table) estilo Notion/Excel moderno.
*   **Busca, Filtros e Ordenação:** Filtros avançados por data, tipo, categoria, conta, status (Efetivada/Pendente).
*   Modal rápido ("Quick Add") para inserir nova transação (receita, despesa, transferência).
*   Suporte a tags ou subcategorias na mesma visualização.

### 3.4. Contas Bancárias `/accounts`
*   Listagem em cards de todas as contas vinculadas com seus respectivos saldos.
*   Somatório global por tipo de conta.

### 3.5. Cartões de Crédito `/cards`
*   Visualização de cartões com limite total, limite disponível, fatura atual e próxima fatura.
*   Lógica de "Transação de Cartão de Crédito" para faturas, diferenciando a data da compra da data de pagamento do cartão.
*   Controle visual de parcelamentos (Ex: 1/12).

### 3.6. Investimentos `/investments`
*   Controle de portfólio.
*   Cards separados por tipo de asset (Renda Fixa, Ações, Cripto, etc.).
*   (Futuro) Integração para cotações em tempo real, mas inicialmente suporte para entrada manual do preço médio e posição atual.

### 3.7. Dívidas & Financiamentos `/debts`
*   Acompanhamento visual de evolução da dívida (quanto já foi pago vs quanto falta).
*   Cálculo estimado baseado no valor principal.

### 3.8. Metas e Cofrinhos `/goals`
*   Gamificação da poupança.
*   Barra de progresso bonita indicando o quanto falta para alcançar uma viagem, reserva de emergência, etc.

### 3.9. Calendário Financeiro `/calendar`
*   Visão de calendário unificada (FullCalendar ou variante customizada com Tailwind).
*   Mostra vencimentos exatos de despesas, faturas de cartão de crédito e receitas agendadas nos dias do mês.

---

## 4. Requisitos de Implementação (Instruções para a IA)

Ao começar a gerar o código para este projeto atente-se às seguintes diretrizes:

1.  **Configuração Inicial ("Setup"):** Inicie gerando as queries SQL base do Supabase (Migration) para construir as tabelas com RLS habilitado e políticas de acesso para o Multi-Tenancy.
2.  **Server Components e Actions:** Maximize o uso de Server Components do App Router para carregamento de dados do Supabase (`@supabase/ssr`). Use Server Actions para as mutações de dados (criação, edição e exclusão de transações).
3.  **UI/UX:** A interface do Clarix deve se sentir como um app desktop nativo. Use transições suaves, modais rápidos sem reload e hotkeys se possível (ex: `C` para nova transação).
4.  **Estrutura de Pastas Esperada:**
    ```
    ├── src/
    │   ├── app/
    │   │   ├── (auth)/        # Rotas de login/registro
    │   │   ├── (dashboard)/   # Rotas filhas protegidas (layout.tsx com Sidebar e Header)
    │   │   │   ├── transactions/
    │   │   │   ├── accounts/
    │   │   │   ├── cards/
    │   │   │   ├── calendar/
    │   │   │   ├── ...
    │   ├── components/
    │   │   ├── ui/            # (Shadcn/UI components)
    │   │   ├── layout/        # Sidebar, Header, etc.
    │   │   ├── transactions/  # Tabelas, Modais, Formulários específicos
    │   ├── lib/
    │   │   ├── supabase/      # Instância cliente/servidor do supabase
    │   │   ├── utils.ts       # Funções utilitárias (cn, formatações de moeda e data)
    │   ├── actions/           # Server Actions centralizadas
    │   ├── types/             # Definições de interfaces baseadas no DB
    ```

## 5. Próximos Passos (Prompting)

Responda que você entendeu o escopo. Assim que confirmar:
1. Comece gerando a **Estrutura de Banco de Dados** (Código SQL) que servirá de base no Supabase, contendo as lógicas de RLS para o Multi-Tenancy.
2. O passo seguinte será configurar a estrutura base em um app novo do Next.js.
