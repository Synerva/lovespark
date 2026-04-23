import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendUp, TrendDown, Minus } from '@phosphor-icons/react'
import type { ScoreHistory } from '@/lib/types'

interface ScoreEvolutionProps {
  history: ScoreHistory[]
  growthMessage?: string
}

export function ScoreEvolution({ history, growthMessage }: ScoreEvolutionProps) {
  if (history.length === 0) {
    return null
  }

  const recentScores = history.slice(-4)
  const hasProgression = recentScores.length >= 2

  const getTrend = () => {
    if (recentScores.length < 2) return 'stable'
    const latest = recentScores[recentScores.length - 1].score
    const previous = recentScores[recentScores.length - 2].score
    const diff = latest - previous
    if (diff > 1) return 'up'
    if (diff < -1) return 'down'
    return 'stable'
  }

  const trend = getTrend()

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          Score Evolution
          {trend === 'up' && <TrendUp size={20} className="text-success" weight="bold" />}
          {trend === 'down' && <TrendDown size={20} className="text-warning" weight="bold" />}
          {trend === 'stable' && <Minus size={20} className="text-muted-foreground" weight="bold" />}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {hasProgression ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-3 text-2xl font-semibold">
              {recentScores.map((score, index) => (
                <motion.div
                  key={score.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <span 
                    className={index === recentScores.length - 1 ? 'text-primary' : 'text-muted-foreground'}
                    style={{ fontFamily: 'Sora, sans-serif' }}
                  >
                    {score.score}
                  </span>
                  {index < recentScores.length - 1 && (
                    <span className="text-muted-foreground">→</span>
                  )}
                </motion.div>
              ))}
            </div>

            {trend === 'stable' && growthMessage && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-sm text-muted-foreground text-center p-3 bg-muted/50 rounded-lg"
              >
                {growthMessage}
              </motion.div>
            )}

            <div className="grid grid-cols-3 gap-2 text-xs text-center">
              <div>
                <p className="text-muted-foreground">Understand</p>
                <p className="font-semibold text-understand">
                  {recentScores[recentScores.length - 1].understand}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Align</p>
                <p className="font-semibold text-align">
                  {recentScores[recentScores.length - 1].align}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Elevate</p>
                <p className="font-semibold text-elevate">
                  {recentScores[recentScores.length - 1].elevate}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center">
            Complete more check-ins to see your progress
          </p>
        )}
      </CardContent>
    </Card>
  )
}
