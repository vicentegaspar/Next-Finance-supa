'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useWorkspaceStore } from '@/components/providers/workspace-store-provider'
import { getCalendarData } from '@/actions/calendar'
import { Loader2, Calendar as CalendarIcon, ArrowDownToDot, ArrowUpFromDot, Target, CreditCard, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { format, isSameDay, parseISO, startOfMonth, endOfMonth } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function CalendarView() {
  const activeWorkspace = useWorkspaceStore((state) => state.activeWorkspace)
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())

  const fetchData = useCallback(async () => {
    if (!activeWorkspace) return
    try {
      setLoading(true)
      const res = await getCalendarData(activeWorkspace.id)
      setData(res)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [activeWorkspace])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Process all events into a single list
  const allEvents = useMemo(() => {
    if (!data) return []
    const events: any[] = []

    // 1. Transactions
    data.transactions.forEach((t: any) => {
      events.push({
        id: t.id,
        date: parseISO(t.date),
        title: t.description,
        amount: Number(t.amount),
        type: 'transaction',
        transactionType: t.type,
      })
    })

    // 2. Debts
    data.debts.forEach((d: any) => {
      events.push({
        id: d.id,
        date: parseISO(d.due_date),
        title: d.name,
        amount: Number(d.principal_amount) - Number(d.paid_amount),
        type: 'debt',
        debtType: d.type,
      })
    })

    // 3. Goals
    data.goals.forEach((g: any) => {
      events.push({
        id: g.id,
        date: parseISO(g.target_date),
        title: g.name,
        amount: Number(g.target_amount) - Number(g.current_amount),
        type: 'goal',
      })
    })

    // 4. Credit Cards (Monthly recurring)
    // For simplicity, we show the due date for the CURRENT month
    const today = new Date()
    data.cards.forEach((c: any) => {
      const dueDate = new Date(today.getFullYear(), today.getMonth(), c.due_day)
      events.push({
        id: c.id,
        date: dueDate,
        title: `Vencimento: ${c.name}`,
        amount: Number(c.used_limit),
        type: 'card',
      })
    })

    return events
  }, [data])

  const selectedEvents = useMemo(() => {
    if (!selectedDate) return []
    return allEvents.filter(e => isSameDay(e.date, selectedDate))
  }, [allEvents, selectedDate])

  if (!activeWorkspace) return null

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
  }

  const getEventIcon = (event: any) => {
    switch(event.type) {
      case 'transaction': 
        return event.transactionType === 'income' ? <ArrowUpFromDot className="size-4 text-chart-2" /> : <ArrowDownToDot className="size-4 text-destructive" />;
      case 'debt': 
        return event.debtType === 'payable' ? <AlertCircle className="size-4 text-destructive" /> : <ArrowUpFromDot className="size-4 text-chart-2" />;
      case 'goal': return <Target className="size-4 text-primary" />;
      case 'card': return <CreditCard className="size-4 text-orange-400" />;
      default: return <CalendarIcon className="size-4" />;
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full p-6 overflow-hidden">
      {/* Calendar Area */}
      <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-4 overflow-hidden">
        <Card className="border-border/50 shadow-sm grow flex flex-col min-h-0 bg-card/60 backdrop-blur-sm">
          <CardHeader className="pb-2 border-b border-border/10">
            <CardTitle className="flex items-center gap-2 text-xl font-heading">
              <CalendarIcon className="size-5 text-primary" />
              Agenda Financeira
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex items-center justify-center grow">
            {loading ? (
              <div className="flex flex-col items-center gap-3 text-muted-foreground animate-pulse">
                <Loader2 className="size-8 animate-spin text-primary" />
                <span>Cruzando calendários...</span>
              </div>
            ) : (
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                locale={ptBR}
                className="scale-110 xl:scale-125 origin-center"
                modifiers={{
                  hasEvent: (date) => allEvents.some(e => isSameDay(e.date, date))
                }}
                modifiersClassNames={{
                  hasEvent: "relative after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:size-1.5 after:rounded-full after:bg-primary font-bold text-primary"
                }}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Events Details Area */}
      <div className="lg:col-span-5 xl:col-span-4 flex flex-col min-h-0">
        <Card className="border-border/50 shadow-lg flex flex-col h-full bg-card shadow-primary/5">
          <CardHeader className="shrink-0 border-b border-border/20 py-4">
             <CardTitle className="text-lg font-heading">
                {selectedDate ? format(selectedDate, "d 'de' MMMM", { locale: ptBR }) : 'Selecione um dia'}
             </CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-y-auto flex-1">
             <div className="p-4 space-y-4">
                {selectedEvents.length === 0 ? (
                  <div className="py-12 text-center text-muted-foreground flex flex-col items-center gap-3">
                     <div className="p-3 bg-muted/30 rounded-full">
                        <CalendarIcon className="size-6 opacity-30" />
                     </div>
                     <p className="text-sm">Nenhum compromisso financeiro para este dia.</p>
                  </div>
                ) : (
                  selectedEvents.map((event, idx) => (
                    <div key={`${event.type}-${event.id}-${idx}`} className="flex items-center justify-between p-3 rounded-xl border border-border/50 bg-muted/10 hover:bg-muted/30 transition-colors group">
                       <div className="flex items-center gap-3">
                          <div className={cn(
                            "p-2 rounded-lg group-hover:scale-110 transition-transform",
                            event.type === 'transaction' && event.transactionType === 'income' ? 'bg-chart-2/10' : 
                            event.type === 'transaction' ? 'bg-destructive/10' :
                            event.type === 'card' ? 'bg-orange-400/10' : 'bg-primary/10'
                          )}>
                             {getEventIcon(event)}
                          </div>
                          <div>
                             <p className="text-sm font-semibold leading-none mb-1">{event.title}</p>
                             <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
                                {event.type === 'transaction' ? 'Transação Pendente' : 
                                 event.type === 'debt' ? 'Dívida / Empréstimo' :
                                 event.type === 'goal' ? 'Meta / Sonho' : 'Fatura de Cartão'}
                             </p>
                          </div>
                       </div>
                       <div className="text-right">
                          <p className={cn(
                            "text-sm font-bold font-heading",
                            event.type === 'transaction' && event.transactionType === 'income' ? 'text-chart-2' : 
                            event.type === 'transaction' ? 'text-destructive' :
                            event.type === 'debt' && event.debtType === 'payable' ? 'text-destructive' :
                            event.type === 'debt' ? 'text-chart-2' : ''
                          )}>
                             {formatCurrency(event.amount)}
                          </p>
                       </div>
                    </div>
                  ))
                )}
             </div>
          </CardContent>
          <div className="p-4 bg-muted/30 border-t border-border/20 text-[10px] text-muted-foreground text-center italic">
             Mostrando compromissos ativos do Workspace.
          </div>
        </Card>
      </div>
    </div>
  )
}
