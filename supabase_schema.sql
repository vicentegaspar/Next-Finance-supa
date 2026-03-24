-- ==========================================
-- Supabase Schema: Clarix PFM (Next.js Rebuild)
-- Multi-Tenancy & Core Entities
-- ==========================================

-- 1. Enable RLS on all queries by default
-- It is best practice to enable Row Level Security on every table that we create.
-- Users will only be able to see/modify their own workspace data.

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- TABLES
-- ==========================================

-- WORKSPACES
CREATE TABLE workspaces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) DEFAULT 'personal', -- personal, business, family
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;

-- WORKSPACE_USERS (Many-to-Many relationship between Auth Users and Workspaces)
CREATE TABLE workspace_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id UUID NOT NULL, -- References auth.users from Supabase
    role VARCHAR(50) DEFAULT 'member', -- owner, admin, member
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(workspace_id, user_id)
);
ALTER TABLE workspace_users ENABLE ROW LEVEL SECURITY;

-- ACCOUNTS (Bank Accounts, Wallets)
CREATE TABLE accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- checking, savings, investment, wallet
    balance DECIMAL(15, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;

-- CATEGORIES
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- income, expense
    parent_id UUID REFERENCES categories(id) ON DELETE SET NULL, -- for subcategories
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- TRANSACTIONS
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    account_id UUID REFERENCES accounts(id) ON DELETE RESTRICT,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    amount DECIMAL(15, 2) NOT NULL,
    type VARCHAR(50) NOT NULL, -- income, expense, transfer
    description TEXT,
    date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'completed', -- pending, completed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- Workspaces Policies
-- Users can view workspaces they are a member of
CREATE POLICY "Users can view their workspaces" ON workspaces
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM workspace_users wu 
            WHERE wu.workspace_id = workspaces.id 
            AND wu.user_id = auth.uid()
        )
    );

-- Workspace Users Policies
-- Users can view other members in their workspaces
CREATE POLICY "Users can view workspace members" ON workspace_users
    FOR SELECT USING (
        workspace_id IN (
            SELECT workspace_id FROM workspace_users WHERE user_id = auth.uid()
        )
    );

-- Accounts Policies
CREATE POLICY "Users can access workspace accounts" ON accounts
    FOR ALL USING (
        workspace_id IN (
            SELECT workspace_id FROM workspace_users WHERE user_id = auth.uid()
        )
    );

-- Categories Policies
CREATE POLICY "Users can access workspace categories" ON categories
    FOR ALL USING (
        workspace_id IN (
            SELECT workspace_id FROM workspace_users WHERE user_id = auth.uid()
        )
    );

-- Transactions Policies
CREATE POLICY "Users can access workspace transactions" ON transactions
    FOR ALL USING (
        workspace_id IN (
            SELECT workspace_id FROM workspace_users WHERE user_id = auth.uid()
        )
    );

-- ==========================================
-- TRIGGERS
-- ==========================================
-- We can add a trigger to automatically create a "Personal" workspace 
-- when a new auth user signs up. This requires a function bound to auth.users.
