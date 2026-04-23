import { motion } from 'framer-motion'
import { Lightbulb, Warning, Sparkle, TrendUp } from '@phosphor-icons/react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Insight } from '@/lib/types'
import { cn } from '@/lib/utils'

interface InsightCardProps {
  insight: Insight
  onRead?: (id: string) => void
  index?: number
}

const insightConfig = {
  pattern: {
    icon: Sparkle,
    color: 'text-info',
    bgColor: 'bg-info/10',
    borderColor: 'ring-info/20',
    gradientBg: 'bg-gradient-to-br from-info/15 via-info/5 to-transparent',
  },
  suggestion: {
    icon: Lightbulb,
    color: 'text-warning',
    bgColor: 'bg-warning/10',
    borderColor: 'ring-warning/20',
    gradientBg: 'bg-gradient-to-br from-warning/15 via-warning/5 to-transparent',
  },
  warning: {
    icon: Warning,
    color: 'text-destructive',
    bgColor: 'bg-destructive/10',
    borderColor: 'ring-destructive/20',
    gradientBg: 'bg-gradient-to-br from-destructive/15 via-destructive/5 to-transparent',
  },
  celebration: {
    icon: TrendUp,
    color: 'text-success',
    bgColor: 'bg-success/10',
    borderColor: 'ring-success/20',
    gradientBg: 'bg-gradient-to-br from-success/15 via-success/5 to-transparent',
  },
}

export function InsightCard({ insight, onRead, index = 0 }: InsightCardProps) {
  const config = insightConfig[insight.type]
  const Icon = config.icon

  const handleClick = () => {
    if (!insight.read && onRead) {
      onRead(insight.id)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        delay: index * 0.1,
        type: 'spring',
        stiffness: 300,
        damping: 20,
        mass: 0.8
      }}
      whileHover={{ 
        scale: 1.05,
        transition: { 
          type: 'spring', 
          stiffness: 400, 
          damping: 15 
        }
      }}
      whileTap={{ 
        scale: 0.98,
        transition: { 
          type: 'spring', 
          stiffness: 500, 
          damping: 20 
        }
      }}
    >
      <Card
        className={cn(
          'cursor-pointer relative overflow-hidden group shadow-md',
          config.gradientBg,
          !insight.read && `ring-2 ${config.borderColor}`
        )}
        onClick={handleClick}
      >
        <div className={cn(
          'absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500',
          config.gradientBg.replace('from-', 'from-').replace('/15', '/25').replace('to-transparent', 'to-card'),
          'group-hover:animate-gradient-pulse'
        )} />
        <CardHeader className="pb-3 relative">
          <div className="flex items-start gap-3">
            <div className={cn('p-2 rounded-lg', config.bgColor)}>
              <Icon size={20} weight="duotone" className={config.color} />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-sm font-semibold" style={{ fontFamily: 'Sora, sans-serif' }}>
                  {insight.title}
                </h4>
                {!insight.read && (
                  <Badge variant="secondary" className="ml-2">
                    New
                  </Badge>
                )}
              </div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide">
                {insight.pillar}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="relative">
          <p className="text-sm text-foreground/90 leading-relaxed mb-3">
            {insight.content}
          </p>
          {insight.actionable && (
            <div className="pt-3 border-t border-border">
              <p className="text-xs font-medium text-accent">
                → {insight.actionable}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
