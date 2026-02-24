import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { CheckCircle, ArrowLeft, Sparkle, Lightbulb } from '@phosphor-icons/react'
import { RISScoreRing } from '@/components/RISScoreRing'
import { InsightCard } from '@/components/InsightCard'
import type { RISScore, Insight, CheckIn as CheckInType } from '@/lib/types'
import { updateScoreFromCheckIn } from '@/lib/ris-calculator'
import { generateCheckInInsights, generateFollowUpQuestions } from '@/lib/ai-service'
import { motion, AnimatePresence } from 'framer-motion'

interface CheckInProps {
  onComplete: () => void
}

const checkInQuestions = [
  { 
    id: 'emotional-awareness', 
    question: 'How deeply did you connect with your emotional landscape this week?', 
    min: 'Surface level', 
    max: 'Profoundly connected',
    pillar: 'understand' as const
  },
  { 
    id: 'emotional-expression', 
    question: 'How freely did you express what truly matters to you?', 
    min: 'Held back', 
    max: 'Authentically open',
    pillar: 'understand' as const
  },
  { 
    id: 'pattern-recognition', 
    question: 'How clearly did you see your relationship patterns unfolding?', 
    min: 'Unclear patterns', 
    max: 'Crystal clear',
    pillar: 'understand' as const
  },
  { 
    id: 'self-compassion', 
    question: 'How kind were you to yourself during challenging moments?', 
    min: 'Self-critical', 
    max: 'Deeply compassionate',
    pillar: 'understand' as const
  },
  { 
    id: 'curiosity-mindset', 
    question: 'How curious were you about understanding your partner\'s perspective?', 
    min: 'Fixed viewpoint', 
    max: 'Genuinely curious',
    pillar: 'align' as const
  },
  { 
    id: 'communication-clarity', 
    question: 'How clearly did you communicate your needs and desires?', 
    min: 'Vague signals', 
    max: 'Beautifully clear',
    pillar: 'align' as const
  },
  { 
    id: 'active-listening', 
    question: 'How present were you when your partner shared their world with you?', 
    min: 'Distracted', 
    max: 'Fully present',
    pillar: 'align' as const
  },
  { 
    id: 'shared-joy', 
    question: 'How often did you create moments of genuine connection and joy?', 
    min: 'Rarely', 
    max: 'Frequently',
    pillar: 'align' as const
  },
  { 
    id: 'intentional-growth', 
    question: 'How intentionally did you invest in your relationship\'s evolution?', 
    min: 'On autopilot', 
    max: 'Highly intentional',
    pillar: 'elevate' as const
  },
  { 
    id: 'positive-momentum', 
    question: 'How much forward momentum did you create together this week?', 
    min: 'Stagnant', 
    max: 'Thriving progress',
    pillar: 'elevate' as const
  },
  { 
    id: 'appreciation-expression', 
    question: 'How often did you celebrate what\'s working in your relationship?', 
    min: 'Overlooked wins', 
    max: 'Celebrated often',
    pillar: 'elevate' as const
  },
  { 
    id: 'future-visioning', 
    question: 'How aligned are you feeling about your shared future vision?', 
    min: 'Uncertain path', 
    max: 'Clear direction',
    pillar: 'elevate' as const
  },
]

type CheckInStage = 'questions' | 'processing' | 'results'

interface QuestionItem {
  id: string
  question: string
  min: string
  max: string
  pillar: 'understand' | 'align' | 'elevate'
  isFollowUp?: boolean
}

export function CheckIn({ onComplete }: CheckInProps) {
  const [stage, setStage] = useState<CheckInStage>('questions')
  const [currentQ, setCurrentQ] = useState(0)
  const [responses, setResponses] = useState<Record<string, number>>({})
  const [risScore, setRisScore] = useKV<RISScore>('lovespark-ris-score', {
    overall: 52,
    understand: 51,
    align: 53,
    elevate: 50,
    lastUpdated: new Date().toISOString(),
  })
  const [insights, setInsights] = useKV<Insight[]>('lovespark-insights', [])
  const [checkIns, setCheckIns] = useKV<CheckInType[]>('lovespark-check-ins', [])
  const [newInsights, setNewInsights] = useState<Insight[]>([])
  const [updatedScore, setUpdatedScore] = useState<RISScore | null>(null)
  const [allQuestions, setAllQuestions] = useState<QuestionItem[]>(checkInQuestions)
  const [isLoadingFollowUps, setIsLoadingFollowUps] = useState(false)

  useEffect(() => {
    const loadFollowUpQuestions = async () => {
      if ((checkIns || []).length >= 1 && currentQ === Math.floor(checkInQuestions.length / 2) && !isLoadingFollowUps) {
        setIsLoadingFollowUps(true)
        try {
          const followUpQuestions = await generateFollowUpQuestions(
            checkInQuestions,
            (checkIns || []).slice(-3),
            responses
          )
          
          if (followUpQuestions.length > 0) {
            setAllQuestions([...checkInQuestions, ...followUpQuestions])
          }
        } catch (error) {
          console.error('Failed to load follow-up questions:', error)
        } finally {
          setIsLoadingFollowUps(false)
        }
      }
    }

    loadFollowUpQuestions()
  }, [currentQ, checkIns, responses, isLoadingFollowUps])

  const handleResponse = (value: number) => {
    setResponses({ ...responses, [allQuestions[currentQ].id]: value })
  }

  const handleNext = async () => {
    if (currentQ < allQuestions.length - 1) {
      setCurrentQ(currentQ + 1)
    } else {
      setStage('processing')
      
      const previousScore = risScore || {
        overall: 52,
        understand: 51,
        align: 53,
        elevate: 50,
        lastUpdated: new Date().toISOString(),
      }
      
      const checkInResponses = Object.entries(responses).map(([questionId, value]) => ({
        questionId,
        value,
        timestamp: new Date().toISOString(),
      }))
      
      const newScore = updateScoreFromCheckIn(previousScore, checkInResponses)
      
      const generatedInsights = await generateCheckInInsights(
        responses,
        previousScore,
        newScore
      )
      
      const checkInRecord: CheckInType = {
        id: `checkin-${Date.now()}`,
        userId: 'current-user',
        responses: checkInResponses,
        risScoreBefore: previousScore,
        risScoreAfter: newScore,
        insightsGenerated: generatedInsights.map((i: Insight) => i.id),
        completedAt: new Date().toISOString(),
        weekNumber: ((checkIns || []).length) + 1,
      }
      
      setUpdatedScore(newScore)
      setNewInsights(generatedInsights)
      setRisScore(newScore)
      setInsights((current) => [...generatedInsights, ...(current || [])])
      setCheckIns((current) => [...(current || []), checkInRecord])
      
      setTimeout(() => {
        setStage('results')
      }, 2000)
    }
  }

  const handleBack = () => {
    if (currentQ > 0) {
      setCurrentQ(currentQ - 1)
    }
  }

  const handleFinish = () => {
    onComplete()
  }

  if (stage === 'processing') {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="inline-block mb-6"
          >
            <Sparkle size={48} weight="duotone" className="text-accent" />
          </motion.div>
          <h2 className="text-2xl font-semibold mb-3" style={{ fontFamily: 'Sora, sans-serif' }}>
            Analyzing Your Week
          </h2>
          <p className="text-muted-foreground">
            Our AI is processing your responses and updating your RIS score...
          </p>
        </motion.div>
      </div>
    )
  }

  if (stage === 'results' && updatedScore) {
    return (
      <div className="min-h-screen bg-background p-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto py-8 space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Sora, sans-serif' }}>
              Check-In Complete! 
            </h1>
            <p className="text-muted-foreground">
              Here's how your Relationship Intelligence Score has evolved
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="flex justify-center"
          >
            <RISScoreRing
              score={updatedScore.overall}
              delta={updatedScore.delta}
              animate
              size={240}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="bg-gradient-to-br from-accent/5 to-secondary/5">
              <CardContent className="p-6">
                <div className="grid grid-cols-3 gap-6 text-center">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">UNDERSTAND</div>
                    <div className="text-2xl font-semibold" style={{ fontFamily: 'Sora, sans-serif' }}>
                      {updatedScore.understand}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">ALIGN</div>
                    <div className="text-2xl font-semibold" style={{ fontFamily: 'Sora, sans-serif' }}>
                      {updatedScore.align}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">ELEVATE</div>
                    <div className="text-2xl font-semibold" style={{ fontFamily: 'Sora, sans-serif' }}>
                      {updatedScore.elevate}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {newInsights.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <h2 className="text-2xl font-semibold mb-4" style={{ fontFamily: 'Sora, sans-serif' }}>
                New Insights for You
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {newInsights.map((insight, index) => (
                  <InsightCard key={insight.id} insight={insight} index={index} />
                ))}
              </div>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="flex justify-center pt-4"
          >
            <Button onClick={handleFinish} size="lg" className="min-w-[200px]">
              Return to Dashboard
            </Button>
          </motion.div>
        </div>
      </div>
    )
  }

  const question = allQuestions[currentQ]
  const currentValue = responses[question.id] ?? 50
  const progress = ((currentQ + 1) / allQuestions.length) * 100

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        <div className="mb-8 flex items-center justify-between">
          <Button variant="ghost" onClick={onComplete} size="sm">
            <ArrowLeft className="mr-2" /> Exit
          </Button>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Question {currentQ + 1} of {allQuestions.length}
            </span>
          </div>
        </div>

        <div className="mb-6">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-accent to-secondary"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentQ}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardContent className="p-8">
                <div className="flex items-center gap-2 mb-3">
                  <div className="text-xs uppercase tracking-wide text-accent font-medium">
                    {question.pillar}
                  </div>
                  {question.isFollowUp && (
                    <div className="flex items-center gap-1 text-xs bg-secondary/20 text-secondary px-2 py-0.5 rounded-full">
                      <Lightbulb size={12} weight="fill" />
                      <span>Personalized</span>
                    </div>
                  )}
                </div>
                <h2 className="text-2xl font-semibold mb-8" style={{ fontFamily: 'Sora, sans-serif' }}>
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
                    <span className="text-left max-w-[30%]">{question.min}</span>
                    <span className="font-semibold text-foreground text-lg">{currentValue}</span>
                    <span className="text-right max-w-[30%]">{question.max}</span>
                  </div>

                  <div className="flex gap-3 pt-4">
                    {currentQ > 0 && (
                      <Button
                        onClick={handleBack}
                        variant="outline"
                        size="lg"
                        className="flex-1"
                      >
                        Back
                      </Button>
                    )}
                    <Button
                      onClick={handleNext}
                      className="flex-1"
                      size="lg"
                    >
                      {currentQ < allQuestions.length - 1 ? 'Next Question' : 'Complete Check-In'}
                      <CheckCircle className="ml-2" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
