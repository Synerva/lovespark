import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { CheckCircle, ArrowLeft } from '@phosphor-icons/react'
import type { RISScore } from '@/lib/types'
import { updateScoreFromCheckIn } from '@/lib/ris-calculator'
import { toast } from 'sonner'

interface CheckInProps {
  onComplete: () => void
}

const checkInQuestions = [
  { id: 'emotional-awareness', question: 'How aware were you of your emotions this week?', min: 'Not at all', max: 'Very aware' },
  { id: 'communication-quality', question: 'How would you rate your communication this week?', min: 'Poor', max: 'Excellent' },
  { id: 'habit-consistency', question: 'How consistent were you with your relationship habits?', min: 'Not consistent', max: 'Very consistent' },
]

export function CheckIn({ onComplete }: CheckInProps) {
  const [currentQ, setCurrentQ] = useState(0)
  const [responses, setResponses] = useState<Record<string, number>>({})
  const [risScore, setRisScore] = useKV<RISScore>('lovespark-ris-score', null as any)

  const handleResponse = (value: number) => {
    setResponses({ ...responses, [checkInQuestions[currentQ].id]: value })
  }

  const handleNext = () => {
    if (currentQ < checkInQuestions.length - 1) {
      setCurrentQ(currentQ + 1)
    } else {
      const updatedScore = updateScoreFromCheckIn(risScore, Object.entries(responses).map(([questionId, value]) => ({
        questionId,
        value,
        timestamp: new Date().toISOString(),
      })))
      
      setRisScore(updatedScore)
      toast.success('Check-in complete! Your RIS has been updated.')
      onComplete()
    }
  }

  const question = checkInQuestions[currentQ]
  const currentValue = responses[question.id] ?? 50

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        <div className="mb-8 flex items-center justify-between">
          <Button variant="ghost" onClick={onComplete}>
            <ArrowLeft className="mr-2" /> Exit
          </Button>
          <span className="text-sm text-muted-foreground">
            Question {currentQ + 1} of {checkInQuestions.length}
          </span>
        </div>

        <Card>
          <CardContent className="p-8">
            <h2 className="text-2xl font-semibold mb-8 text-center" style={{ fontFamily: 'Sora, sans-serif' }}>
              {question.question}
            </h2>

            <div className="space-y-6">
              <Slider
                value={[currentValue]}
                onValueChange={([value]) => handleResponse(value)}
                min={0}
                max={100}
                step={1}
                className="my-8"
              />

              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{question.min}</span>
                <span className="font-semibold text-foreground">{currentValue}</span>
                <span>{question.max}</span>
              </div>

              <Button
                onClick={handleNext}
                className="w-full"
                size="lg"
              >
                {currentQ < checkInQuestions.length - 1 ? 'Next Question' : 'Complete Check-In'}
                <CheckCircle className="ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
