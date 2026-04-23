import { useIsMobile } from '@/hooks/use-mobile'
import { Logo } from './Logo'

export function MobileHeader() {
  const isMobile = useIsMobile()

  if (!isMobile) return null

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-card border-b border-border z-30 flex items-center justify-center px-4">
      <Logo size={40} showText={false} />
    </header>
  )
}
