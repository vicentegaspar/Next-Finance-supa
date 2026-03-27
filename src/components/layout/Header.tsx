import Link from 'next/link'
import { Search, Bell, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Sidebar } from './Sidebar'
import { WorkspaceSwitcher } from './WorkspaceSwitcher'
import { signout } from '@/actions/auth'
import { getProfile } from '@/actions/profile'

export async function Header() {
  const profile = await getProfile()
  const initials = profile?.name 
    ? profile.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
    : (profile?.email?.charAt(0) || 'U').toUpperCase()
  return (
    <header className="h-16 border-b border-border bg-card/80 backdrop-blur-md flex items-center justify-between px-4 md:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        {/* Mobile Menu */}
        <Sheet>
          <SheetTrigger render={<Button variant="ghost" size="icon" className="md:hidden" />}>
            <Menu className="size-5" />
            <span className="sr-only">Toggle Menu</span>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64 border-r-sidebar-border">
            <SheetTitle className="sr-only">Menu lateral</SheetTitle>
            <SheetDescription className="sr-only">Navegação principal</SheetDescription>
            <Sidebar />
          </SheetContent>
        </Sheet>
        
        {/* Workspace Selector */}
        <div className="hidden sm:flex items-center gap-2">
          <WorkspaceSwitcher />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden md:flex relative w-64">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar transações..."
            className="w-full bg-background pl-9 h-9 border-border"
          />
        </div>
        
        {/* Mobile workspace switcher fallback */}
        <div className="sm:hidden flex items-center mr-1">
          <WorkspaceSwitcher />
        </div>

        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <Bell className="size-5" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="ghost" className="relative h-8 w-8 rounded-full border border-border" />}>
            <Avatar className="h-8 w-8">
              <AvatarImage src={profile?.avatar_url || ''} alt="User Avatar" />
              <AvatarFallback className="bg-primary/20 text-primary font-bold">{initials}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">Minha Conta</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    Configurações Globais
                  </p>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem render={<Link href="/profile" className="w-full flex items-center gap-2" />}>
                Perfil
              </DropdownMenuItem>
              <DropdownMenuItem>Assinatura</DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem render={<form action={signout} className="w-full" />}>
              <button type="submit" className="w-full text-left text-destructive font-medium cursor-pointer">
                Sair do Clarix
              </button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
