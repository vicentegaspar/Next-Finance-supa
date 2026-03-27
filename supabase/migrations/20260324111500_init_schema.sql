-- ==========================================
-- Supabase Schema: Clarix PFM (Next.js)
-- ==========================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE workspaces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) DEFAULT 'personal', -- personal, business, family
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;

CREATE TABLE workspace_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id UUID NOT NULL, 
    role VARCHAR(50) DEFAULT 'member', -- owner, admin, member
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(workspace_id, user_id)
);
ALTER TABLE workspace_users ENABLE ROW LEVEL SECURITY;

CREATE TABLE accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, 
    balance DECIMAL(15, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;

CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, 
    parent_id UUID REFERENCES categories(id) ON DELETE SET NULL, 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    account_id UUID REFERENCES accounts(id) ON DELETE RESTRICT,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    amount DECIMAL(15, 2) NOT NULL,
    type VARCHAR(50) NOT NULL, 
    description TEXT,
    date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'completed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE TABLE credit_cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    total_limit DECIMAL(15, 2) NOT NULL,
    used_limit DECIMAL(15, 2) DEFAULT 0.00,
    closing_day INT NOT NULL,
    due_day INT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE credit_cards ENABLE ROW LEVEL SECURITY;

CREATE TABLE investments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    broker VARCHAR(255),
    average_price DECIMAL(15, 6) DEFAULT 0.00,
    current_position DECIMAL(15, 6) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;

CREATE TABLE debts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    principal_amount DECIMAL(15, 2) NOT NULL,
    paid_amount DECIMAL(15, 2) DEFAULT 0.00,
    interest_rate DECIMAL(5, 2),
    due_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE debts ENABLE ROW LEVEL SECURITY;

CREATE TABLE goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    target_amount DECIMAL(15, 2) NOT NULL,
    current_amount DECIMAL(15, 2) DEFAULT 0.00,
    target_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

-- ====================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================

CREATE POLICY "Users can view their workspaces" ON workspaces FOR SELECT USING ( EXISTS ( SELECT 1 FROM workspace_users wu WHERE wu.workspace_id = workspaces.id AND wu.user_id = auth.uid() ) );
CREATE POLICY "Users can view workspace members" ON workspace_users FOR SELECT USING ( workspace_id IN ( SELECT workspace_id FROM workspace_users WHERE user_id = auth.uid() ) );
CREATE POLICY "Users can access workspace accounts" ON accounts FOR ALL USING ( workspace_id IN ( SELECT workspace_id FROM workspace_users WHERE user_id = auth.uid() ) );
CREATE POLICY "Users can access workspace categories" ON categories FOR ALL USING ( workspace_id IN ( SELECT workspace_id FROM workspace_users WHERE user_id = auth.uid() ) );
CREATE POLICY "Users can access workspace transactions" ON transactions FOR ALL USING ( workspace_id IN ( SELECT workspace_id FROM workspace_users WHERE user_id = auth.uid() ) );
CREATE POLICY "Users can access workspace credit cards" ON credit_cards FOR ALL USING ( workspace_id IN ( SELECT workspace_id FROM workspace_users WHERE user_id = auth.uid() ) );
CREATE POLICY "Users can access workspace investments" ON investments FOR ALL USING ( workspace_id IN ( SELECT workspace_id FROM workspace_users WHERE user_id = auth.uid() ) );
CREATE POLICY "Users can access workspace debts" ON debts FOR ALL USING ( workspace_id IN ( SELECT workspace_id FROM workspace_users WHERE user_id = auth.uid() ) );
CREATE POLICY "Users can access workspace goals" ON goals FOR ALL USING ( workspace_id IN ( SELECT workspace_id FROM workspace_users WHERE user_id = auth.uid() ) );

-- ====================
-- TRIGGERS E FUNÇÕES
-- ====================

CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
DECLARE
  new_workspace_id UUID;
BEGIN
  -- 1. Cria o workspace padrao
  INSERT INTO public.workspaces (name, type)
  VALUES ('Pessoal', 'personal')
  RETURNING id INTO new_workspace_id;

  -- 2. Conecta o novo usuario ao workspace como 'owner'
  INSERT INTO public.workspace_users (workspace_id, user_id, role)
  VALUES (new_workspace_id, NEW.id, 'owner');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Remove o trigger se já existir para não dar redundância
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
