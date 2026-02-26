import { motion } from 'framer-motion'
import { Brain, UsersThree, TrendUp } from '@phosphor-icons/react'
import type { PillarType } from '@/lib/types'
import { cn } from '@/lib/utils'

interface PillarProgressBarProps {
  pillar: PillarType
  score: number
  animate?: boolean
  showIcon?: boolean
}

const pillarConfig = {
  understand: {
    label: 'UNDERSTAND',
    icon: Brain,
    color: 'oklch(0.65 0.22 280)',
    bgColor: 'bg-understand/10',
    textColor: 'text-understand',
  },
  align: {
    label: 'ALIGN',
    icon: UsersThree,
    color: 'oklch(0.62 0.24 340)',
    bgColor: 'bg-align/10',
    textColor: 'text-align',
  },
  elevate: {
    label: 'ELEVATE',
    icon: TrendUp,
    color: 'oklch(0.68 0.20 140)',
    bgColor: 'bg-elevate/10',
    textColor: 'text-elevate',
  },
}

export function PillarProgressBar({
  pillar,
  score,
  animate = true,
  showIcon = true,
}: PillarProgressBarProps) {
  const config = pillarConfig[pillar]
  const Icon = config.icon

  return (
    <div className="flex items-center gap-4">
      {showIcon && (
        <div className={cn('p-2 rounded-lg', config.bgColor)}>
          <Icon size={24} weight="duotone" style={{ color: config.color }} />
        </div>
      )}
      
      <div className="flex-1">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium" style={{ fontFamily: 'Sora, sans-serif' }}>
            {config.label}
          </span>
          <span className="text-sm font-semibold" style={{ color: config.color }}>
            {score}
          </span>
        </div>
        
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: config.color }}
            initial={animate ? { width: 0 } : { width: `${score}%` }}
            animate={{ width: `${score}%` }}
            transition={{
              duration: 0.8,
              ease: [0.16, 1, 0.3, 1],
            }}
          />
        </div>
      </div>
    </div>
  )
}
