'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    if (error.message.includes('Invalid login credentials')) {
      return { error: 'E-mail ou senha incorretos.' }
    }
    return { error: error.message }
  }

  // Redirect is caught by Next.js and stops execution properly
  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })

  // Handle specific Supabase Auth errors gracefully for the frontend
  if (error) {
    if (error.message.includes('User already registered')) {
      return { error: 'Este e-mail já está sendo utilizado por outra conta.' }
    }
    return { error: error.message }
  }

  if (data?.session) {
    revalidatePath('/', 'layout')
    redirect('/dashboard')
  } else {
    // Fallback when Supabase strictly enforces email verification
    return { error: 'Conta criada! Verifique seu e-mail para confirmar.' }
  }
}

export async function signout() {
  const supabase = await createClient()
  await supabase.auth.signOut()

  revalidatePath('/', 'layout')
  redirect('/login')
}
