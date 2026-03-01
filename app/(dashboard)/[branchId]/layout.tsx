'use client'

import { useState, useCallback, useEffect } from 'react'
import { DastaSidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/layout/Topbar'
import { CommandPalette } from '@/components/ui/CommandPalette'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [commandOpen, setCommandOpen] = useState(false)

  const toggleSidebar = useCallback(() => setSidebarOpen(p => !p), [])
  const closeSidebar = useCallback(() => setSidebarOpen(false), [])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setCommandOpen(true)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <DastaSidebar open={sidebarOpen} onClose={closeSidebar} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar onMenuClick={toggleSidebar} onSearchClick={() => setCommandOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
    </div>
  )
}
