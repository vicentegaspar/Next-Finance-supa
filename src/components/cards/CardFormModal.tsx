'use client'

import { useState } from 'react'
import { CreditCard, Plus } from 'lucide-react'
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
import { createCreditCard } from '@/actions/cards'

export function CardFormModal({ onCreated }: { onCreated: () => void }) {
  const activeWorkspace = useWorkspaceStore((state) => state.activeWorkspace)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function onSubmit(formData: FormData) {
    if (!activeWorkspace) return
    setLoading(true)
    formData.append('workspace_id', activeWorkspace.id)
    
    const res = await createCreditCard(formData)
    setLoading(false)

    if (res.success) {
      setOpen(false)
      onCreated()
    } else {
      alert('Erro ao criar cartão: ' + res.error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="gap-2 shadow-sm font-semibold" />}>
        <Plus className="size-4" />
        <span className="hidden sm:inline">Adicionar Cartão</span>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form action={onSubmit}>
          <DialogHeader>
            <DialogTitle>Novo Cartão de Crédito</DialogTitle>
            <DialogDescription>
              Lance o limite e datas do seu cartão unificado.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Instituição / Nome</Label>
              <Input id="name" name="name" placeholder="Ex: Nubank Ultravioleta" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="total_limit">Limite Total (R$)</Label>
                <Input id="total_limit" name="total_limit" placeholder="5000,00" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="used_limit">Já Utilizado (R$)</Label>
                <Input id="used_limit" name="used_limit" placeholder="0,00" defaultValue="0" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="closing_day">Dia do Fechamento</Label>
                <Input id="closing_day" name="closing_day" type="number" min="1" max="31" placeholder="Ex: 5" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="due_day">Dia do Vencimento</Label>
                <Input id="due_day" name="due_day" type="number" min="1" max="31" placeholder="Ex: 12" required />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Criar Cartão'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
