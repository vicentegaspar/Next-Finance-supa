'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getCreditCards(workspaceId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('credit_cards')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching credit cards:', error)
    return []
  }

  return data
}

export async function createCreditCard(formData: FormData) {
  const supabase = await createClient()

  const workspace_id = formData.get('workspace_id') as string
  const name = formData.get('name') as string
  const totalStr = formData.get('total_limit') as string
  const usedStr = formData.get('used_limit') as string
  const closing_day = parseInt(formData.get('closing_day') as string, 10)
  const due_day = parseInt(formData.get('due_day') as string, 10)

  let total_limit = parseFloat(totalStr.replace(',', '.'))
  if (isNaN(total_limit)) total_limit = 0.0

  let used_limit = parseFloat(usedStr?.replace(',', '.') || '0')
  if (isNaN(used_limit)) used_limit = 0.0

  const { error } = await supabase
    .from('credit_cards')
    .insert({
      workspace_id,
      name,
      total_limit,
      used_limit,
      closing_day,
      due_day
    })

  if (error) {
    console.error('Error creating credit card:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/cards')
  return { success: true }
}
