'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getInvestments(workspaceId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('investments')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching investments:', error)
    return []
  }

  return data
}

export async function createInvestment(formData: FormData) {
  const supabase = await createClient()

  const workspace_id = formData.get('workspace_id') as string
  const name = formData.get('name') as string
  const type = formData.get('type') as string
  const broker = formData.get('broker') as string
  const avgStr = formData.get('average_price') as string
  const posStr = formData.get('current_position') as string

  let average_price = parseFloat(avgStr.replace(',', '.'))
  if (isNaN(average_price)) average_price = 0.0

  let current_position = parseFloat(posStr?.replace(',', '.') || '0')
  if (isNaN(current_position)) current_position = 0.0

  const { error } = await supabase
    .from('investments')
    .insert({
      workspace_id,
      name,
      type,
      broker,
      average_price,
      current_position
    })

  if (error) {
    console.error('Error creating investment:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/investments')
  return { success: true }
}
