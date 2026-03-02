import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/Logo'
import { List, X } from '@phosphor-icons/react'
import type { AppView } from '@/App'
import { cn } from '@/lib/utils'

interface PublicHeaderProps {
  currentView: AppView
  onNavigate: (view: AppView) => void
}

export function PublicHeader({ currentView, onNavigate }: PublicHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems = [
    { label: 'Home', view: 'landing' as AppView },
    { label: 'About', view: 'about' as AppView },
    { label: 'Blog', view: 'blog' as AppView },
    { label: 'Coaching', view: 'coaching' as AppView },
    { label: 'Contact', view: 'contact' as AppView },
  ]

  const handleNavClick = (view: AppView) => {
    onNavigate(view)
    setMobileMenuOpen(false)
  }

  return (
    <header className="border-b border-border/40 bg-background/80 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <button 
            onClick={() => handleNavClick('landing')} 
            className="hover:opacity-80 transition-opacity"
          >
            <Logo />
          </button>

          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <button
                key={item.view}
                onClick={() => handleNavClick(item.view)}
                className={cn(
                  "text-sm font-medium transition-colors",
                  currentView === item.view
                    ? "text-foreground"
                    : "text-foreground/70 hover:text-foreground"
                )}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={() => handleNavClick('login')}
              className="text-sm hidden sm:inline-flex"
            >
              Log In
            </Button>
            <Button
              onClick={() => handleNavClick('register')}
              className="text-sm bg-gradient-to-r from-primary via-secondary to-align hover:opacity-90 transition-opacity hidden sm:inline-flex"
            >
              Get Started
            </Button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-muted/50 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X size={24} className="text-foreground" weight="bold" />
              ) : (
                <List size={24} className="text-foreground" weight="bold" />
              )}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border/40 bg-background/95 backdrop-blur-md">
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-2">
            {navItems.map((item) => (
              <button
                key={item.view}
                onClick={() => handleNavClick(item.view)}
                className={cn(
                  "text-left px-4 py-3 rounded-lg font-medium transition-all",
                  currentView === item.view
                    ? "bg-gradient-to-r from-primary/10 via-secondary/10 to-align/10 text-foreground"
                    : "text-foreground/70 hover:bg-muted/50 hover:text-foreground"
                )}
              >
                {item.label}
              </button>
            ))}
            <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-border/40">
              <Button
                variant="ghost"
                onClick={() => handleNavClick('login')}
                className="w-full justify-start"
              >
                Log In
              </Button>
              <Button
                onClick={() => handleNavClick('register')}
                className="w-full bg-gradient-to-r from-primary via-secondary to-align hover:opacity-90 transition-opacity"
              >
                Get Started
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
