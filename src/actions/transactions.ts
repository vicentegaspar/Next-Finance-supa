'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getTransactions(workspaceId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('date', { ascending: false })

  if (error) {
    console.error('Error fetching transactions:', error)
    return []
  }

  return data
}

export async function createTransaction(formData: FormData) {
  const supabase = await createClient()

  const workspace_id = formData.get('workspace_id') as string
  const description = formData.get('description') as string
  const amountStr = formData.get('amount') as string
  const type = formData.get('type') as string
  const date = formData.get('date') as string
  const status = formData.get('status') as string || 'completed'

  // Replace comma with dot if user typed "100,50"
  let amount = parseFloat(amountStr.replace(',', '.'))
  if (isNaN(amount)) amount = 0.0

  const { error } = await supabase
    .from('transactions')
    .insert({
      workspace_id,
      description,
      amount,
      type,
      date,
      status
    })

  if (error) {
    console.error('Error creating transaction:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/transactions')
  return { success: true }
}
