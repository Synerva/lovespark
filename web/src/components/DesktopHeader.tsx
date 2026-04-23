import { Button } from '@/components/ui/button'
import { List } from '@phosphor-icons/react'
import { useIsMobile } from '@/hooks/use-mobile'

interface DesktopHeaderProps {
  onMenuClick: () => void
}

export function DesktopHeader({ onMenuClick }: DesktopHeaderProps) {
  const isMobile = useIsMobile()

  if (isMobile) return null

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-card border-b border-border z-30 flex items-center px-6">
      <Button
        variant="ghost"
        size="icon"
        onClick={onMenuClick}
        className="h-10 w-10"
      >
        <List size={24} />
      </Button>
      <div className="flex-1 flex justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-primary">LoveSpark</h1>
        </div>
      </div>
      <div className="w-10" />
    </header>
  )
}
