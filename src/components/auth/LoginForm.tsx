'use client'

import { useState } from 'react'
import { login } from '@/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'

export function LoginForm() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function onSubmit(formData: FormData) {
    setLoading(true)
    setError('')
    const res = await login(formData)
    
    // Server action returns object on error, otherwise Next `redirect` cancels execution flow.
    if (res?.error) {
      setError(res.error)
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
      <div className="space-y-2">
        <Label htmlFor="login-email">Email</Label>
        <Input id="login-email" name="email" type="email" placeholder="nome@exemplo.com" required className="bg-background" />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="login-password">Senha</Label>
          <a href="#" className="text-xs font-medium text-primary hover:underline">Esqueceu a senha?</a>
        </div>
        <Input id="login-password" name="password" type="password" required className="bg-background" />
      </div>
      <Button type="submit" className="w-full font-semibold mt-2" disabled={loading}>
        {loading ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
        Entrar na conta
      </Button>
    </form>
  )
}
