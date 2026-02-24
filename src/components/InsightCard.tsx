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
    color: 'text-accent',
    bgColor: 'bg-accent/10',
  },
  suggestion: {
    icon: Lightbulb,
    color: 'text-secondary',
    bgColor: 'bg-secondary/10',
  },
  warning: {
    icon: Warning,
    color: 'text-destructive',
    bgColor: 'bg-destructive/10',
  },
  celebration: {
    icon: TrendUp,
    color: 'text-secondary',
    bgColor: 'bg-secondary/10',
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
    >
      <Card
        className={cn(
          'cursor-pointer transition-all hover:shadow-lg',
          !insight.read && 'ring-2 ring-accent/20'
        )}
        onClick={handleClick}
      >
        <CardHeader className="pb-3">
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
        <CardContent>
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
