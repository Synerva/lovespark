import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { CheckCircle } from '@phosphor-icons/react'
import type { MicroAction, MicroActionCompletion } from '@/lib/types'
import { ProgressService } from '@/lib/progress-service'

interface MicroActionTrackerProps {
  userId: string
  weekNumber: number
}

export function MicroActionTracker({ userId, weekNumber }: MicroActionTrackerProps) {
  const [completions, setCompletions] = useKV<MicroActionCompletion[]>(
    `lovespark-micro-actions-${weekNumber}`,
    []
  )

  const isCompleted = (actionId: string) => {
    return (completions || []).some(
      c => c.microActionId === actionId && c.weekNumber === weekNumber
    )
  }

  const handleToggle = (action: MicroAction) => {
    const completed = isCompleted(action.id)

    if (completed) {
      setCompletions(current =>
        (current || []).filter(c => !(c.microActionId === action.id && c.weekNumber === weekNumber))
      )
    } else {
      setCompletions(current => [
        ...(current || []),
        {
          id: `${userId}-${action.id}-${weekNumber}-${Date.now()}`,
          userId,
          microActionId: action.id,
          weekNumber,
          completedAt: new Date().toISOString()
        }
      ])
    }
  }

  const completedCount = ProgressService.MICRO_ACTIONS.filter(a => isCompleted(a.id)).length
  const totalCount = ProgressService.MICRO_ACTIONS.length

  return (
    <Card className="shadow-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Weekly Micro-Actions</CardTitle>
          {completedCount > 0 && (
            <Badge variant="outline" className="bg-success/10 border-success/30 text-success">
              <CheckCircle size={14} className="mr-1" weight="fill" />
              {completedCount}/{totalCount}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {ProgressService.MICRO_ACTIONS.map(action => {
          const completed = isCompleted(action.id)
          
          return (
            <div
              key={action.id}
              className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors cursor-pointer"
              onClick={() => handleToggle(action)}
            >
              <Checkbox
                id={action.id}
                checked={completed}
                onCheckedChange={() => handleToggle(action)}
                className="mt-1"
              />
              <label
                htmlFor={action.id}
                className="flex-1 cursor-pointer"
              >
                <p className={`text-sm font-medium ${completed ? 'line-through text-muted-foreground' : ''}`}>
                  {action.label}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {action.description}
                </p>
              </label>
            </div>
          )
        })}

        {completedCount === totalCount && (
          <div className="text-center p-4 bg-success/10 rounded-lg border border-success/20 mt-4">
            <CheckCircle size={32} weight="fill" className="text-success mx-auto mb-2" />
            <p className="text-sm font-medium text-success">
              All micro-actions completed this week!
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Keep building these habits for lasting growth
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
