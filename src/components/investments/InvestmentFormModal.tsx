'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useWorkspaceStore } from '@/components/providers/workspace-store-provider'
import { createInvestment } from '@/actions/investments'

export function InvestmentFormModal({ onCreated }: { onCreated: () => void }) {
  const activeWorkspace = useWorkspaceStore((state) => state.activeWorkspace)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function onSubmit(formData: FormData) {
    if (!activeWorkspace) return
    setLoading(true)
    formData.append('workspace_id', activeWorkspace.id)
    
    const res = await createInvestment(formData)
    setLoading(false)

    if (res.success) {
      setOpen(false)
      onCreated()
    } else {
      alert('Erro ao registrar investimento: ' + res.error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="gap-2 shadow-sm font-semibold" />}>
        <Plus className="size-4" />
        <span className="hidden sm:inline">Adicionar Ativo</span>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form action={onSubmit}>
          <DialogHeader>
            <DialogTitle>Novo Investimento</DialogTitle>
            <DialogDescription>
              Lance o seu mais novo ativo na carteira deste Workspace.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
               <div className="grid gap-2">
                 <Label htmlFor="type">Tipo</Label>
                 <select id="type" name="type" className="flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50" required>
                   <option value="fixed_income" className="bg-background">Renda Fixa</option>
                   <option value="variable_income" className="bg-background">Renda Variável</option>
                   <option value="funds" className="bg-background">Fundos</option>
                   <option value="crypto" className="bg-background">Criptomoedas</option>
                   <option value="real_estate" className="bg-background">Imóveis</option>
                 </select>
               </div>
               <div className="grid gap-2">
                 <Label htmlFor="broker">Corretora/Banco</Label>
                 <Input id="broker" name="broker" placeholder="Ex: XP, NuInvest" required />
               </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="name">Nome do Ativo</Label>
              <Input id="name" name="name" placeholder="Ex: Tesouro Selic 2029" required />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="average_price">Preço Médio (R$)</Label>
                <Input id="average_price" name="average_price" placeholder="0,00" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="current_position">Saldo Posicionado (R$)</Label>
                <Input id="current_position" name="current_position" placeholder="0,00" defaultValue="0" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar Ativo'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
