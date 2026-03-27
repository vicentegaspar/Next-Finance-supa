'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  Landmark, 
  CreditCard, 
  TrendingUp, 
  Target, 
  Calendar,
  Wallet 
} from 'lucide-react'
import { cn } from '@/lib/utils'

const routes = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/transactions', label: 'Transações', icon: ArrowLeftRight },
  { href: '/accounts', label: 'Contas', icon: Landmark },
  { href: '/cards', label: 'Cartões', icon: CreditCard },
  { href: '/investments', label: 'Investimentos', icon: TrendingUp },
  { href: '/debts', label: 'Dívidas', icon: Wallet },
  { href: '/goals', label: 'Metas', icon: Target },
  { href: '/calendar', label: 'Calendário', icon: Calendar },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex flex-col h-full bg-sidebar border-r border-sidebar-border text-sidebar-foreground w-64 md:w-full">
      <div className="p-6 flex items-center gap-3">
        <div className="size-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold font-heading shadow-md">
          C
        </div>
        <span className="text-2xl font-bold font-heading text-primary">Clarix</span>
      </div>
      
      <div className="flex-1 px-4 space-y-1.5 overflow-y-auto">
        {routes.map((route) => {
          const isActive = pathname === route.href || pathname.startsWith(`${route.href}/`)
          return (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors text-sm font-medium",
                isActive 
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm" 
                  : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-muted-foreground"
              )}
            >
              <route.icon className="size-5" />
              {route.label}
            </Link>
          )
        })}
      </div>
      
      <div className="p-4 border-t border-sidebar-border whitespace-nowrap text-xs text-muted-foreground text-center">
        &copy; 2026 Clarix PFM
      </div>
    </div>
  )
}
