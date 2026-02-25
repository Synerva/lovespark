import { useState, useRef, useEffect } from 'react'
import { House, ChatCircle, CalendarCheck, User, List, X } from '@phosphor-icons/react'
import type { AppView } from '../App'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useSidebar } from '@/hooks/use-sidebar'
import { useIsMobile } from '@/hooks/use-mobile'

interface DesktopSidebarProps {
  currentView: AppView
  onNavigate: (view: AppView) => void
}

export function DesktopSidebar({ currentView, onNavigate }: DesktopSidebarProps) {
  const { isCollapsed, sidebarWidth, isMobileOpen, setSidebarWidth, toggleSidebar, closeMobileSidebar, minWidth, maxWidth, collapsedWidth } = useSidebar()
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

  const handleNavigation = (view: AppView) => {
    onNavigate(view)
    if (isMobile) {
      closeMobileSidebar()
    }
  }

  return (
    <>
      {isMobile && isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={closeMobileSidebar}
        />
      )}
      <nav
        ref={sidebarRef}
        className={cn(
          'fixed left-0 bg-card border-r border-border transition-all duration-300',
          isMobile ? 'top-16 bottom-0 z-50' : 'top-16 bottom-0 z-40',
          isMobile && !isMobileOpen && '-translate-x-full'
        )}
        style={{ 
          width: isCollapsed ? `${collapsedWidth}px` : `${sidebarWidth}px`,
        }}
      >
        <div className="flex flex-col h-full">
          <div className={cn(
            'p-6 border-b border-border flex items-center',
            isCollapsed ? 'justify-center' : 'justify-between'
          )}>
            {!isCollapsed && (
              <div>
                <h1 className="text-2xl font-bold text-primary">LoveSpark</h1>
                <p className="text-xs text-muted-foreground mt-1">Relationship Intelligence</p>
              </div>
            )}
            {isCollapsed && (
              <div className="text-2xl font-bold text-primary">LS</div>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={isMobile ? closeMobileSidebar : toggleSidebar}
              className={cn(
                'h-8 w-8 flex-shrink-0',
                isCollapsed && !isMobile && 'absolute top-6 left-1/2 -translate-x-1/2'
              )}
            >
              {isMobile ? <X size={20} /> : isCollapsed ? <List size={20} /> : <X size={20} />}
            </Button>
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
                  onClick={() => handleNavigation(view)}
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
        
        {!isCollapsed && !isMobile && (
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
    </>
  )
}
