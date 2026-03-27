'use server'

import { createClient } from '@/lib/supabase/server'

export async function getCalendarData(workspaceId: string) {
  const supabase = await createClient()

  // 1. Fetch Transactions (only pending ones)
  const { data: transactions } = await supabase
    .from('transactions')
    .select('id, description, amount, date, type, status')
    .eq('workspace_id', workspaceId)
    .eq('status', 'pending')

  // 2. Fetch Credit Cards (for due dates)
  const { data: cards } = await supabase
    .from('credit_cards')
    .select('id, name, due_day, used_limit')
    .eq('workspace_id', workspaceId)

  // 3. Fetch Goals (for target dates)
  const { data: goals } = await supabase
    .from('goals')
    .select('id, name, target_date, target_amount, current_amount')
    .eq('workspace_id', workspaceId)
    .not('target_date', 'is', null)

  // 4. Fetch Debts (for due dates)
  const { data: debts } = await supabase
    .from('debts')
    .select('id, name, due_date, principal_amount, paid_amount, type')
    .eq('workspace_id', workspaceId)
    .not('due_date', 'is', null)

  return {
    transactions: transactions || [],
    cards: cards || [],
    goals: goals || [],
    debts: debts || [],
  }
}
