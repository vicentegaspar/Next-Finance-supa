'use client'

import { useState } from 'react'
import { signup } from '@/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'

export function RegisterForm() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  async function onSubmit(formData: FormData) {
    const password = formData.get('password') as string
    const confirm = formData.get('confirmPassword') as string
    
    if (password !== confirm) {
      setError('As senhas não coincidem.')
      return
    }
    
    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.')
      return
    }

    setLoading(true)
    setError('')
    setSuccessMsg('')
    
    const res = await signup(formData)
    
    if (res?.error) {
      if (res.error.includes('Conta criada!')) {
        setSuccessMsg(res.error)
      } else {
        setError(res.error)
      }
      setLoading(false)
    }
  }

  return (
    <form action={onSubmit} className="space-y-4">
      {error && (
        <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md border border-destructive/20 font-medium">
          {error}
        </div>
      )}
      {successMsg && (
        <div className="bg-chart-2/15 text-chart-2 text-sm p-3 rounded-md border border-chart-2/20 font-medium">
          {successMsg}
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="register-email">Email profissional ou pessoal</Label>
        <Input id="register-email" name="email" type="email" placeholder="nome@exemplo.com" required className="bg-background" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="register-password">Senha</Label>
          <Input id="register-password" name="password" type="password" required className="bg-background" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm-password">Confirmar Senha</Label>
          <Input id="confirm-password" name="confirmPassword" type="password" required className="bg-background" />
        </div>
      </div>
      <Button type="submit" className="w-full font-semibold border-primary/30 hover:bg-primary/90 mt-2" disabled={loading}>
        {loading ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
        Criar minha conta
      </Button>
      <p className="text-center text-xs text-muted-foreground mt-4 pb-2">
        Ao registrar, um Workspace em seu nome será criado automaticamente nas nuvens do Clarix.
      </p>
    </form>
  )
}
