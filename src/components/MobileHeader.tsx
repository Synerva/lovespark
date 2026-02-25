import { Button } from '@/components/ui/button'
import { useIsMobile } from '@/hooks/use-mobile'
import { motion } from 'framer-motion'

interface MobileHeaderProps {
  onMenuClick: () => void
  isMenuOpen: boolean
}

export function MobileHeader({ onMenuClick, isMenuOpen }: MobileHeaderProps) {
  const isMobile = useIsMobile()

  if (!isMobile) return null

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-card border-b border-border z-30 flex items-center px-4">
      <Button
        variant="ghost"
        size="icon"
        onClick={onMenuClick}
        className="h-10 w-10"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <motion.line
            x1="3"
            y1="6"
            x2="21"
            y2="6"
            animate={{
              rotate: isMenuOpen ? 45 : 0,
              y: isMenuOpen ? 6 : 0,
            }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            style={{ originX: '12px', originY: '12px' }}
          />
          <motion.line
            x1="3"
            y1="12"
            x2="21"
            y2="12"
            animate={{
              opacity: isMenuOpen ? 0 : 1,
            }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
          />
          <motion.line
            x1="3"
            y1="18"
            x2="21"
            y2="18"
            animate={{
              rotate: isMenuOpen ? -45 : 0,
              y: isMenuOpen ? -6 : 0,
            }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            style={{ originX: '12px', originY: '12px' }}
          />
        </svg>
      </Button>
      <div className="flex-1 flex justify-center">
        <div className="text-center">
          <h1 className="text-xl font-bold text-primary">LoveSpark</h1>
        </div>
      </div>
      <div className="w-10" />
    </header>
  )
}
