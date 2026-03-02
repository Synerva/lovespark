import { useState, useRef, useEffect } from 'react'
import { House, ChatCircle, CalendarCheck, User, List, X } from '@phosphor-icons/react'
import type { AppView } from '../App'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useSidebar } from '@/hooks/use-sidebar'
import { useIsMobile } from '@/hooks/use-mobile'
import { Logo } from './Logo'

interface DesktopSidebarProps {
  currentView: AppView
  onNavigate: (view: AppView) => void
}

export function DesktopSidebar({ currentView, onNavigate }: DesktopSidebarProps) {
  const { isCollapsed, sidebarWidth, setSidebarWidth, toggleSidebar, minWidth, maxWidth, collapsedWidth } = useSidebar()
  const [isDragging, setIsDragging] = useState(false)
  const sidebarRef = useRef<HTMLElement>(null)
  const isMobile = useIsMobile()

  const navItems: { view: AppView; icon: typeof House; label: string }[] = [
    { view: 'dashboard', icon: House, label: 'Home' },
    { view: 'ai-coach', icon: ChatCircle, label: 'Coach' },
    { view: 'check-in', icon: CalendarCheck, label: 'Check-In' },
    { view: 'profile', icon: User, label: 'Profile' },
  ]

  useEffect(() => {
    if (!isDragging) return

    document.body.classList.add('no-select')

    const handleMouseMove = (e: MouseEvent) => {
      if (!sidebarRef.current) return
      const newWidth = e.clientX
      if (newWidth >= minWidth && newWidth <= maxWidth) {
        setSidebarWidth(newWidth)
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      document.body.classList.remove('no-select')
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.classList.remove('no-select')
    }
  }, [isDragging, minWidth, maxWidth, setSidebarWidth])

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  if (isMobile) return null

  return (
    <nav
      ref={sidebarRef}
      className="fixed left-0 top-0 bottom-0 bg-card border-r border-border transition-all duration-300 z-40"
      style={{ 
        width: isCollapsed ? `${collapsedWidth}px` : `${sidebarWidth}px`,
      }}
    >
      <div className="flex flex-col h-full">
        <div className={cn(
          'p-6 border-b border-border flex items-center',
          isCollapsed ? 'justify-center flex-col' : 'justify-between'
        )}>
          {!isCollapsed && (
            <>
              <Logo size={48} showText={true} />
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                className="h-8 w-8 flex-shrink-0"
              >
                <X size={20} />
              </Button>
            </>
          )}
          {isCollapsed && (
            <>
              <Logo size={40} showText={false} />
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                className="h-8 w-8 flex-shrink-0 mt-2"
              >
                <List size={20} />
              </Button>
            </>
          )}
        </div>

        <div className={cn(
          'flex-1 py-6 space-y-1',
          isCollapsed ? 'px-2' : 'px-3'
        )}>
          {navItems.map(({ view, icon: Icon, label }) => {
            const isActive = currentView === view
            return (
              <button
                key={view}
                onClick={() => onNavigate(view)}
                className={cn(
                  'w-full flex items-center rounded-lg transition-all text-left',
                  isCollapsed ? 'justify-center p-3' : 'gap-3 px-4 py-3',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
                title={isCollapsed ? label : undefined}
              >
                <Icon size={22} weight={isActive ? 'fill' : 'regular'} />
                {!isCollapsed && <span className="font-medium">{label}</span>}
              </button>
            )
          })}
        </div>
      </div>
      
      {!isCollapsed && (
        <div
          className={cn(
            'absolute top-0 right-0 bottom-0 w-1 cursor-col-resize hover:bg-accent transition-colors group',
            isDragging && 'bg-accent'
          )}
          onMouseDown={handleResizeStart}
        >
          <div className="absolute inset-y-0 -right-1 w-3" />
        </div>
      )}
    </nav>
  )
}
