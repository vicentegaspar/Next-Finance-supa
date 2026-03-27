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
import { createDebt } from '@/actions/debts'

export function DebtFormModal({ onCreated }: { onCreated: () => void }) {
  const activeWorkspace = useWorkspaceStore((state) => state.activeWorkspace)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function onSubmit(formData: FormData) {
    if (!activeWorkspace) return
    setLoading(true)
    formData.append('workspace_id', activeWorkspace.id)
    
    const res = await createDebt(formData)
    setLoading(false)

    if (res.success) {
      setOpen(false)
      onCreated()
    } else {
      alert('Erro ao registrar dívida/empréstimo: ' + res.error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="gap-2 shadow-sm font-semibold" />}>
        <Plus className="size-4" />
        <span className="hidden sm:inline">Adicionar Registro</span>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form action={onSubmit}>
          <DialogHeader>
            <DialogTitle>Nova Dívida ou Empréstimo</DialogTitle>
            <DialogDescription>
              Registre dinheiro que você deve a alguém (ou que te devem).
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="type">Tipo</Label>
              <select id="type" name="type" className="flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50" required>
                <option value="payable" className="bg-background">A Pagar (Eu devo)</option>
                <option value="receivable" className="bg-background">A Receber (Me devem)</option>
              </select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="name">Nome / Descrição</Label>
              <Input id="name" name="name" placeholder="Ex: Empréstimo do Carro, João da Silva" required />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="principal_amount">Valor Total (R$)</Label>
                <Input id="principal_amount" name="principal_amount" placeholder="0,00" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="paid_amount">Já Pago/Recebido (R$)</Label>
                <Input id="paid_amount" name="paid_amount" placeholder="0,00" defaultValue="0" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="interest_rate">Taxa de Juros (%) - Opcional</Label>
                <Input id="interest_rate" name="interest_rate" type="number" step="0.01" placeholder="Ex: 5.5" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="due_date">Data de Vencimento Final</Label>
                <Input id="due_date" name="due_date" type="date" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar Registro'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
