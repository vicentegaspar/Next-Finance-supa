'use server'

import { createClient } from '@/lib/supabase/server'
import { endOfMonth, format, startOfMonth, startOfYear, endOfYear } from 'date-fns'

export async function getReportTransactions(
  workspaceId: string,
  period: 'month' | 'year' | 'all',
  selectedDate: Date
) {
  const supabase = await createClient()

  let query = supabase
    .from('transactions')
    .select(`
      *,
      categories (
        name,
        type
      ),
      accounts (
        name
      )
    `)
    .eq('workspace_id', workspaceId)
    .order('date', { ascending: true })

  if (period === 'month') {
    const start = format(startOfMonth(selectedDate), 'yyyy-MM-dd')
    const end = format(endOfMonth(selectedDate), 'yyyy-MM-dd')
    query = query.gte('date', start).lte('date', end)
  } else if (period === 'year') {
    const start = format(startOfYear(selectedDate), 'yyyy-MM-dd')
    const end = format(endOfYear(selectedDate), 'yyyy-MM-dd')
    query = query.gte('date', start).lte('date', end)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching transactions for report:', error)
    return []
  }

  return data
}
