import { Suspense } from 'react'
import { CalendarView } from '@/components/calendar/CalendarView'

export default function CalendarPage() {
  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] animate-in fade-in duration-500 w-full overflow-hidden">
      <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Sincronizando compromissos...</div>}>
        <CalendarView />
      </Suspense>
    </div>
  )
}
