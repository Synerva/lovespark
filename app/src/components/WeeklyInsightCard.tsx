import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Lightbulb, Sparkle, Check } from '@phosphor-icons/react'
import type { DashboardWeeklyInsight } from '@/lib/db/insights'

interface WeeklyInsightCardProps {
  insight: DashboardWeeklyInsight
  onMarkRead: () => void
}

export function WeeklyInsightCard({ insight, onMarkRead }: WeeklyInsightCardProps) {
  const [isRead, setIsRead] = useState(insight.read)

  const handleMarkRead = () => {
    setIsRead(true)
    onMarkRead()
  }

  return (
    <Card className="shadow-md border-accent/30 bg-gradient-to-br from-accent/5 to-transparent">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent/20 rounded-lg">
              <Sparkle size={24} weight="fill" className="text-accent" />
            </div>
            <CardTitle className="text-lg">Weekly Insight</CardTitle>
          </div>
          {!isRead && (
            <Badge variant="outline" className="bg-accent/10 border-accent/30">
              New
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <Lightbulb size={18} className="text-accent mt-0.5 flex-shrink-0" weight="fill" />
              <div>
                <p className="text-sm font-medium text-foreground/80">{insight.title}</p>
                <p className="text-sm text-muted-foreground">{insight.content}</p>
              </div>
            </div>
          </div>

          {insight.reflectionQuestion && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground/80">Reflection Question</p>
              <p className="text-sm italic text-muted-foreground border-l-2 border-accent pl-3">
                {insight.reflectionQuestion}
              </p>
            </div>
          )}

          {insight.whyThis && (
            <div className="space-y-2 p-3 bg-muted/50 rounded-lg">
              <div className="flex items-start gap-2">
                <Check size={18} className="text-success mt-0.5 flex-shrink-0" weight="bold" />
                <div>
                  <p className="text-sm font-medium text-foreground/80">Why This</p>
                  <p className="text-sm text-muted-foreground">{insight.whyThis}</p>
                </div>
              </div>
            </div>
          )}

          {typeof insight.confidence === 'number' && (
            <p className="text-xs text-muted-foreground">
              Confidence: {Math.round(insight.confidence <= 1 ? insight.confidence * 100 : insight.confidence)}%
            </p>
          )}
        </motion.div>

        {!isRead && (
          <Button
            onClick={handleMarkRead}
            variant="ghost"
            className="w-full text-accent hover:text-accent"
            size="sm"
          >
            <Check size={16} className="mr-2" weight="bold" />
            Mark as Read
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
