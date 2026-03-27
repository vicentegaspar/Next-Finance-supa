'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { updateProfile } from '@/actions/profile'
import { Loader2, User, Mail, Phone, Camera, Save, CheckCircle2 } from 'lucide-react'

interface ProfileFormProps {
  initialData: {
    name: string | null
    email: string | null
    phone: string | null
    avatar_url: string | null
  }
}

export function ProfileForm({ initialData }: ProfileFormProps) {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setSuccess(false)
    setError(null)
    
    const res = await updateProfile(formData)
    setLoading(false)

    if (res.success) {
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } else {
      setError(res.error || 'Erro ao atualizar perfil')
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Sidebar / Avatar Card */}
      <Card className="lg:col-span-1 border-border/50 bg-card/60 backdrop-blur-sm shadow-xl h-fit">
        <CardHeader className="text-center">
          <div className="relative mx-auto size-32 mb-4 group">
            <Avatar className="size-32 border-4 border-primary/20 shadow-inner">
              <AvatarImage src={initialData.avatar_url || ''} />
              <AvatarFallback className="bg-primary/10 text-primary text-4xl font-bold">
                {initialData.name?.charAt(0) || initialData.email?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
               <Camera className="size-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold font-heading">{initialData.name || 'Usuário'}</CardTitle>
          <CardDescription className="text-sm truncate">{initialData.email}</CardDescription>
        </CardHeader>
        <CardContent className="text-center pb-8">
           <p className="text-xs text-muted-foreground italic">Configurações de Identidade Visual</p>
        </CardContent>
      </Card>

      {/* Main Form Card */}
      <Card className="lg:col-span-2 border-border/50 shadow-xl bg-card overflow-hidden">
        <CardHeader className="border-b border-border/10 bg-muted/20">
          <CardTitle className="flex items-center gap-2">
            <User className="size-5 text-primary" />
            Dados Cadastrais
          </CardTitle>
          <CardDescription>Mantenha suas informações atualizadas para melhorar a experiência no Clarix.</CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <form action={handleSubmit} className="space-y-6">
            <div className="grid gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email" className="text-muted-foreground flex items-center gap-1.5">
                  <Mail className="size-3.5" /> E-mail (Somente leitura)
                </Label>
                <Input id="email" value={initialData.email || ''} disabled className="bg-muted/50 opacity-60" />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="name" className="flex items-center gap-1.5">
                   <User className="size-3.5" /> Nome Completo
                </Label>
                <Input id="name" name="name" defaultValue={initialData.name || ''} placeholder="Ex: Vicente Neto" required />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="phone" className="flex items-center gap-1.5">
                    <Phone className="size-3.5" /> Telefone de Contato
                  </Label>
                  <Input id="phone" name="phone" defaultValue={initialData.phone || ''} placeholder="(00) 00000-0000" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="avatar_url" className="flex items-center gap-1.5">
                    <Camera className="size-3.5" /> URL do Avatar
                  </Label>
                  <Input id="avatar_url" name="avatar_url" defaultValue={initialData.avatar_url || ''} placeholder="https://..." />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-border/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              {success && (
                <div className="flex items-center gap-2 text-chart-2 text-sm font-medium animate-in slide-in-from-left-2 grow">
                   <CheckCircle2 className="size-4" />
                   Perfil atualizado com sucesso!
                </div>
              )}
              {error && (
                <div className="text-destructive text-sm font-medium">{error}</div>
              )}
              <Button type="submit" disabled={loading} className="w-full sm:w-auto gap-2 shadow-lg shadow-primary/20">
                {loading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Save className="size-4" />
                )}
                Salvar Alterações
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
