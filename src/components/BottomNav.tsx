import { House, ChatCircle, CalendarCheck, User } from '@phosphor-icons/react'
import type { AppView } from '../App'
import { cn } from '@/lib/utils'

interface BottomNavProps {
  currentView: AppView
  onNavigate: (view: AppView) => void
}

export function BottomNav({ currentView, onNavigate }: BottomNavProps) {
  const navItems: { view: AppView; icon: typeof House; label: string }[] = [
    { view: 'dashboard', icon: House, label: 'Home' },
    { view: 'ai-coach', icon: ChatCircle, label: 'Coach' },
    { view: 'check-in', icon: CalendarCheck, label: 'Check-In' },
    { view: 'profile', icon: User, label: 'Profile' },
  ]

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 md:hidden">
        <div className="flex items-center justify-around px-2 py-3">
          {navItems.map(({ view, icon: Icon, label }) => {
            const isActive = currentView === view
            return (
              <button
                key={view}
                onClick={() => onNavigate(view)}
                className={cn(
                  'flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all',
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Icon size={24} weight={isActive ? 'fill' : 'regular'} />
                <span className="text-xs font-medium">{label}</span>
              </button>
            )
          })}
        </div>
      </nav>

      <nav className="hidden md:block fixed left-0 top-0 bottom-0 w-64 bg-card border-r border-border z-40">
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-border">
            <h1 className="text-2xl font-bold text-primary">LoveSpark</h1>
            <p className="text-xs text-muted-foreground mt-1">Relationship Intelligence</p>
          </div>
          
          <div className="flex-1 py-6 px-3 space-y-1">
            {navItems.map(({ view, icon: Icon, label }) => {
              const isActive = currentView === view
              return (
                <button
                  key={view}
                  onClick={() => onNavigate(view)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-left',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <Icon size={22} weight={isActive ? 'fill' : 'regular'} />
                  <span className="font-medium">{label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </nav>
    </>
  )
}
