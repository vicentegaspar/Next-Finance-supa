import { Coins } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LoginForm } from '@/components/auth/LoginForm'
import { RegisterForm } from '@/components/auth/RegisterForm'

export default function LoginPage() {
  return (
    <Card className="w-full shadow-xl border-primary/20 bg-card/60 backdrop-blur-md">
      <CardHeader className="space-y-1 sm:text-center text-left pb-4">
        <div className="flex items-center gap-2 justify-start sm:justify-center mb-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary shadow-sm text-primary-foreground">
            <Coins className="size-5" />
          </div>
          <CardTitle className="text-2xl font-bold font-heading text-primary tracking-tight">Clarix</CardTitle>
        </div>
        <CardDescription>
          Acesse seu Painel Financeiro Multi-Tenant ou crie sua conta com facilidade.
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-6">
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6 bg-background/50">
            <TabsTrigger value="login">Entrar</TabsTrigger>
            <TabsTrigger value="register">Cadastrar</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login" className="mt-0">
            <LoginForm />
          </TabsContent>
          
          <TabsContent value="register" className="mt-0">
            <RegisterForm />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
