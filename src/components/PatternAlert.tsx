import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Warning, X, Calendar } from '@phosphor-icons/react'
import type { RecurringPattern } from '@/lib/types'
import type { AppView } from '../App'

interface PatternAlertProps {
  pattern: RecurringPattern
  onAcknowledge: () => void
  onNavigate: (view: AppView) => void
  aiExplanation?: string
}

export function PatternAlert({ pattern, onAcknowledge, onNavigate, aiExplanation }: PatternAlertProps) {
  const [isDismissed, setIsDismissed] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  if (isDismissed || pattern.acknowledged) {
    return null
  }

  const handleDismiss = () => {
    setIsDismissed(true)
    onAcknowledge()
  }

  const getPillarColor = (pillar: string) => {
    switch (pillar) {
      case 'understand': return 'text-understand bg-understand/10 border-understand/30'
      case 'align': return 'text-align bg-align/10 border-align/30'
      case 'elevate': return 'text-elevate bg-elevate/10 border-elevate/30'
      default: return 'text-warning bg-warning/10 border-warning/30'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      <Card className="shadow-lg border-warning/30 bg-gradient-to-br from-warning/5 to-transparent">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-warning/20 rounded-lg">
                <Warning size={24} weight="fill" className="text-warning" />
              </div>
              <div>
                <CardTitle className="text-lg">Recurring Pattern Detected</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Noticed {pattern.frequency} times in your conversations
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="h-8 w-8 p-0"
            >
              <X size={18} />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={getPillarColor(pattern.pillar)}>
              {pattern.pillar.toUpperCase()}
            </Badge>
            <Badge variant="outline" className="bg-background">
              <Calendar size={12} className="mr-1" />
              First seen {new Date(pattern.firstDetected).toLocaleDateString()}
            </Badge>
          </div>

          <Alert className="border-warning/30 bg-warning/5">
            <AlertDescription className="text-sm">
              <span className="font-semibold">"{pattern.pattern}"</span> keeps coming up in your reflections.
            </AlertDescription>
          </Alert>

          {showDetails && aiExplanation && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="p-4 bg-muted/50 rounded-lg space-y-2"
            >
              <p className="text-sm font-medium">AI Analysis</p>
              <p className="text-sm text-muted-foreground">{aiExplanation}</p>
            </motion.div>
          )}

          <div className="flex gap-2">
            {aiExplanation && !showDetails && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDetails(true)}
                className="flex-1"
              >
                View AI Analysis
              </Button>
            )}
            <Button
              variant="default"
              size="sm"
              onClick={() => onNavigate('coaching')}
              className="flex-1"
            >
              Explore Coaching
            </Button>
          </div>

          <button
            onClick={handleDismiss}
            className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Dismiss for now
          </button>
        </CardContent>
      </Card>
    </motion.div>
  )
}
