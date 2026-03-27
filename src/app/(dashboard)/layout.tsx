import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { WorkspaceProvider } from '@/components/providers/workspace-provider'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <WorkspaceProvider>
      <div className="min-h-screen bg-background text-foreground flex">
        {/* Desktop Sidebar */}
        <aside className="hidden md:block w-64 fixed inset-y-0 left-0 z-20">
          <Sidebar />
        </aside>
        
        {/* Main Content Area */}
        <main className="flex-1 flex flex-col md:pl-64 min-w-0">
          <Header />
          
          {/* Page Content */}
          <div className="p-4 md:p-6 lg:p-8 flex-1 overflow-x-hidden">
            {children}
          </div>
        </main>
      </div>
    </WorkspaceProvider>
  )
}
