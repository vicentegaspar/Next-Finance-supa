'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getGoals(workspaceId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('target_date', { ascending: true })

  if (error) {
    console.error('Error fetching goals:', error)
    return []
  }

  return data
}

export async function createGoal(formData: FormData) {
  const supabase = await createClient()

  const workspace_id = formData.get('workspace_id') as string
  const name = formData.get('name') as string
  const targetStr = formData.get('target_amount') as string
  const currentStr = formData.get('current_amount') as string
  const target_date = formData.get('target_date') as string

  let target_amount = parseFloat(targetStr.replace(',', '.'))
  if (isNaN(target_amount)) target_amount = 0.0

  let current_amount = parseFloat(currentStr?.replace(',', '.') || '0')
  if (isNaN(current_amount)) current_amount = 0.0

  const { error } = await supabase
    .from('goals')
    .insert({
      workspace_id,
      name,
      target_amount,
      current_amount,
      target_date: target_date || null,
    })

  if (error) {
    console.error('Error creating goal:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/goals')
  return { success: true }
}
