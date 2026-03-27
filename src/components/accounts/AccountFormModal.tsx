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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useWorkspaceStore } from '@/components/providers/workspace-store-provider'
import { createAccount } from '@/actions/accounts'

export function AccountFormModal({ onCreated }: { onCreated: () => void }) {
  const activeWorkspace = useWorkspaceStore((state) => state.activeWorkspace)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function onSubmit(formData: FormData) {
    if (!activeWorkspace) return
    setLoading(true)
    formData.append('workspace_id', activeWorkspace.id)
    
    const res = await createAccount(formData)
    setLoading(false)

    if (res.success) {
      setOpen(false)
      onCreated()
    } else {
      alert('Erro ao criar conta: ' + res.error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="gap-2 shadow-sm font-semibold" />}>
        <Plus className="size-4" />
        <span className="hidden sm:inline">Nova Conta ou Carteira</span>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form action={onSubmit}>
          <DialogHeader>
            <DialogTitle>Nova Conta Bancária</DialogTitle>
            <DialogDescription>
              Adicione uma conta corrente, poupança ou carteira de dinheiro.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome da Conta / Banco</Label>
              <Input id="name" name="name" placeholder="Ex: Nubank, Carteira..." required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="type">Tipo</Label>
                <Select name="type" defaultValue="checking">
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="checking">Conta Corrente</SelectItem>
                    <SelectItem value="savings">Poupança</SelectItem>
                    <SelectItem value="investment">Investimentos</SelectItem>
                    <SelectItem value="wallet">Carteira (Dinheiro físico)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="balance">Saldo Atual Inicial (R$)</Label>
                <Input id="balance" name="balance" placeholder="0,00" required />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar Conta'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
