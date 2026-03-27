'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getDebts(workspaceId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('debts')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('due_date', { ascending: true })

  if (error) {
    console.error('Error fetching debts:', error)
    return []
  }

  return data
}

export async function createDebt(formData: FormData) {
  const supabase = await createClient()

  const workspace_id = formData.get('workspace_id') as string
  const name = formData.get('name') as string
  const type = formData.get('type') as string // 'payable', 'receivable'
  const principalStr = formData.get('principal_amount') as string
  const paidStr = formData.get('paid_amount') as string
  const interestStr = formData.get('interest_rate') as string
  const due_date = formData.get('due_date') as string

  let principal_amount = parseFloat(principalStr.replace(',', '.'))
  if (isNaN(principal_amount)) principal_amount = 0.0

  let paid_amount = parseFloat(paidStr?.replace(',', '.') || '0')
  if (isNaN(paid_amount)) paid_amount = 0.0
  
  let interest_rate: number | null = parseFloat(interestStr?.replace(',', '.') || '0')
  if (isNaN(interest_rate)) interest_rate = null // or 0

  const { error } = await supabase
    .from('debts')
    .insert({
      workspace_id,
      name,
      type,
      principal_amount,
      paid_amount,
      interest_rate,
      due_date: due_date || null
    })

  if (error) {
    console.error('Error creating debt:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/debts')
  return { success: true }
}
