import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Brain, UsersThree, TrendUp } from '@phosphor-icons/react'
import type { UserStage } from '@/lib/types'
import { cn } from '@/lib/utils'

interface StageIndicatorProps {
  currentStage: UserStage
  description?: string
}

export function StageIndicator({ currentStage, description }: StageIndicatorProps) {
  const stages: { id: UserStage; label: string; icon: any; color: string }[] = [
    { id: 'understand', label: 'UNDERSTAND', icon: Brain, color: 'understand' },
    { id: 'align', label: 'ALIGN', icon: UsersThree, color: 'align' },
    { id: 'elevate', label: 'ELEVATE', icon: TrendUp, color: 'elevate' }
  ]

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="text-lg">Your Growth Stage</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          {stages.map((stage, index) => {
            const Icon = stage.icon
            const isActive = stage.id === currentStage
            const isPast = stages.findIndex(s => s.id === currentStage) > index

            return (
              <div key={stage.id} className="flex items-center gap-2 flex-1">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.15 }}
                  className="flex flex-col items-center gap-2 flex-1"
                >
                  <div
                    className={cn(
                      'flex items-center justify-center rounded-full p-3 transition-all duration-300',
                      isActive
                        ? `bg-${stage.color}/20 ring-2 ring-${stage.color}`
                        : isPast
                        ? `bg-${stage.color}/10`
                        : 'bg-muted'
                    )}
                  >
                    <Icon
                      size={24}
                      weight={isActive ? 'fill' : 'regular'}
                      className={cn(
                        'transition-colors',
                        isActive ? `text-${stage.color}` : isPast ? `text-${stage.color}/70` : 'text-muted-foreground'
                      )}
                    />
                  </div>
                  <p
                    className={cn(
                      'text-xs font-medium text-center transition-colors',
                      isActive ? `text-${stage.color}` : 'text-muted-foreground'
                    )}
                  >
                    {stage.label}
                  </p>
                </motion.div>
                {index < stages.length - 1 && (
                  <div className="h-0.5 flex-1 bg-border" />
                )}
              </div>
            )
          })}
        </div>

        {description && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-sm text-muted-foreground text-center p-3 bg-muted/50 rounded-lg"
          >
            {description}
          </motion.p>
        )}
      </CardContent>
    </Card>
  )
}
