import { Suspense } from 'react'
import { getProfile } from '@/actions/profile'
import { ProfileForm } from '@/components/profile/ProfileForm'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Meu Perfil | Clarix',
  description: 'Gerencie suas informações de conta no Clarix.',
}

export default async function ProfilePage() {
  const profile = await getProfile()

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-700 max-w-5xl mx-auto w-full px-4 pt-4 pb-12">
      <div className="flex flex-col gap-1 mb-8">
        <h1 className="text-4xl font-heading font-black text-primary tracking-tight">Meu Perfil</h1>
        <p className="text-muted-foreground">Personalize sua identidade e configurações fundamentais do sistema.</p>
      </div>

      <Suspense fallback={<div className="p-12 text-center text-muted-foreground animate-pulse">Carregando dados do servidor...</div>}>
        {profile ? (
           <ProfileForm initialData={profile} />
        ) : (
           <div className="p-12 text-center text-destructive bg-destructive/10 rounded-xl border border-destructive/20">
              Não foi possível carregar seu perfil. Tente novamente mais tarde.
           </div>
        )}
      </Suspense>
    </div>
  )
}
