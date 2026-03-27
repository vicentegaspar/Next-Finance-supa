'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getAccounts(workspaceId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('accounts')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching accounts:', error)
    return []
  }

  return data
}

export async function createAccount(formData: FormData) {
  const supabase = await createClient()

  const workspace_id = formData.get('workspace_id') as string
  const name = formData.get('name') as string
  const type = formData.get('type') as string
  const balanceStr = formData.get('balance') as string

  let balance = parseFloat(balanceStr.replace(',', '.'))
  if (isNaN(balance)) balance = 0.0

  const { error } = await supabase
    .from('accounts')
    .insert({
      workspace_id,
      name,
      type,
      balance,
    })

  if (error) {
    console.error('Error creating account:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/accounts')
  return { success: true }
}
