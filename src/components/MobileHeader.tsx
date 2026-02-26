import { useIsMobile } from '@/hooks/use-mobile'

export function MobileHeader() {
  const isMobile = useIsMobile()

  if (!isMobile) return null

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-card border-b border-border z-30 flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-xl font-bold text-primary">LoveSpark</h1>
      </div>
    </header>
  )
}
