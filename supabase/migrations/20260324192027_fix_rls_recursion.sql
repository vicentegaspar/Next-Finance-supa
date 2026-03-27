-- Fix for infinite recursion in workspace_users SELECT policy
DROP POLICY IF EXISTS "Users can view workspace members" ON workspace_users;

-- Safe policy that only checks the individual's membership rather than recursing over the table
CREATE POLICY "Users can view workspace members" ON workspace_users FOR SELECT USING ( user_id = auth.uid() );
