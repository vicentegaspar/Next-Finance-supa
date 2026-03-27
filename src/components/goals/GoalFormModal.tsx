'use client'

import { useState } from 'react'
import { Target } from 'lucide-react'
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
import { createGoal } from '@/actions/goals'

export function GoalFormModal({ onCreated }: { onCreated: () => void }) {
  const activeWorkspace = useWorkspaceStore((state) => state.activeWorkspace)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function onSubmit(formData: FormData) {
    if (!activeWorkspace) return
    setLoading(true)
    formData.append('workspace_id', activeWorkspace.id)
    
    const res = await createGoal(formData)
    setLoading(false)

    if (res.success) {
      setOpen(false)
      onCreated()
    } else {
      alert('Erro ao criar a meta: ' + res.error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="gap-2 shadow-sm font-semibold" />}>
        <Target className="size-4" />
        <span className="hidden sm:inline">Nova Meta</span>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form action={onSubmit}>
          <DialogHeader>
            <DialogTitle>Nova Meta de Economia</DialogTitle>
            <DialogDescription>
              Crie um novo cofrinho ou objetivo financeiro.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome / Título</Label>
              <Input id="name" name="name" placeholder="Ex: Viagem para o Japão" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="target_amount">Objetivo (R$)</Label>
                <Input id="target_amount" name="target_amount" placeholder="0,00" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="current_amount">Já guardado (R$)</Label>
                <Input id="current_amount" name="current_amount" placeholder="0,00" defaultValue="0" />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="target_date">Data Alvo (Opcional)</Label>
              <Input id="target_date" name="target_date" type="date" />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar Meta'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
