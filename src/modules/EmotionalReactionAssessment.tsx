import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, ArrowRight, Brain, Sparkle, Lock } from '@phosphor-icons/react'
import type { AppView } from '../App'
import type { User, RISScore, AssessmentResponse, Subscription } from '@/lib/types'

interface EmotionalReactionAssessmentProps {
  onNavigate: (view: AppView) => void
  onComplete?: () => void
}

const questions = [
  {
    id: 'stress-1',
    question: 'When you feel stressed in your relationship, what is your first instinct?',
    options: [
      { value: 'withdraw', label: 'Pull back and need space', weight: 1 },
      { value: 'communicate', label: 'Talk through it immediately', weight: 4 },
      { value: 'distract', label: 'Distract myself with other activities', weight: 2 },
      { value: 'analyze', label: 'Mentally analyze what went wrong', weight: 3 },
    ]
  },
  {
    id: 'conflict-1',
    question: 'During a disagreement, how do you typically respond?',
    options: [
      { value: 'defensive', label: 'I become defensive and justify my position', weight: 1 },
      { value: 'curious', label: 'I ask questions to understand their perspective', weight: 4 },
      { value: 'shutdown', label: 'I shut down and stop responding', weight: 1 },
      { value: 'solution', label: 'I immediately try to solve the problem', weight: 3 },
    ]
  },
  {
    id: 'criticism-1',
    question: 'When your partner expresses criticism or concern, you tend to:',
    options: [
      { value: 'hurt', label: 'Feel hurt and take it personally', weight: 2 },
      { value: 'reflect', label: 'Pause and reflect on their feedback', weight: 4 },
      { value: 'counter', label: 'Point out their flaws in return', weight: 1 },
      { value: 'validate', label: 'Acknowledge their feelings first', weight: 4 },
    ]
  },
  {
    id: 'emotional-intensity',
    question: 'When emotions run high in a conversation, how do you handle it?',
    options: [
      { value: 'escalate', label: 'My emotions intensify to match theirs', weight: 1 },
      { value: 'calm', label: 'I consciously slow down and breathe', weight: 4 },
      { value: 'numb', label: 'I emotionally disconnect', weight: 2 },
      { value: 'logic', label: 'I shift into logic mode', weight: 3 },
    ]
  },
  {
    id: 'trigger-awareness',
    question: 'How aware are you of what triggers your emotional reactions?',
    options: [
      { value: 'unaware', label: 'I rarely notice until after the fact', weight: 1 },
      { value: 'somewhat', label: 'I recognize some triggers sometimes', weight: 2 },
      { value: 'aware', label: 'I can usually identify them in the moment', weight: 3 },
      { value: 'highly-aware', label: 'I anticipate and manage my triggers actively', weight: 4 },
    ]
  },
  {
    id: 'recovery-time',
    question: 'After a tense moment, how quickly do you recover emotionally?',
    options: [
      { value: 'hours-days', label: 'It takes hours or even days', weight: 1 },
      { value: 'hour', label: 'Usually within an hour', weight: 2 },
      { value: 'minutes', label: 'Within 15-30 minutes', weight: 3 },
      { value: 'immediate', label: 'I can reset almost immediately', weight: 4 },
    ]
  },
  {
    id: 'self-soothing',
    question: 'What helps you self-regulate when you\'re emotionally activated?',
    options: [
      { value: 'nothing', label: 'Nothing really works, I just wait it out', weight: 1 },
      { value: 'external', label: 'I need someone else to help me calm down', weight: 2 },
      { value: 'strategies', label: 'I use specific strategies (breathing, walking, etc.)', weight: 4 },
      { value: 'awareness', label: 'Simply naming the emotion helps me', weight: 3 },
    ]
  },
  {
    id: 'repair-attempts',
    question: 'After conflict, how do you typically approach repair?',
    options: [
      { value: 'avoid', label: 'I avoid bringing it up again', weight: 1 },
      { value: 'wait', label: 'I wait for them to initiate repair', weight: 2 },
      { value: 'initiate', label: 'I actively reach out to reconnect', weight: 4 },
      { value: 'analyze', label: 'I want to analyze what happened together', weight: 3 },
    ]
  },
]

export function EmotionalReactionAssessment({ onNavigate, onComplete }: EmotionalReactionAssessmentProps) {
  const [user] = useKV<User>('lovespark-user', null as any)
  const [subscription] = useKV<Subscription | null>('lovespark-subscription', null)
  const [risScore, setRisScore] = useKV<RISScore>('lovespark-ris-score', {
    overall: 52,
    understand: 51,
    align: 53,
    elevate: 50,
    lastUpdated: new Date().toISOString(),
  })
  
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [responses, setResponses] = useState<Record<string, { value: string; weight: number }>>({})
  const [showResults, setShowResults] = useState(false)
  const [result, setResult] = useState<{
    category: string
    score: number
    description: string
    insight: string
    premiumInsight: string
  } | null>(null)

  const isPremium = subscription && subscription.status === 'active' && subscription.planName !== 'FREE'
  const progress = ((currentQuestion + 1) / questions.length) * 100

  const handleAnswer = (questionId: string, value: string, weight: number) => {
    setResponses((prev) => ({ ...prev, [questionId]: { value, weight } }))
    
    if (currentQuestion < questions.length - 1) {
      setTimeout(() => setCurrentQuestion((prev) => prev + 1), 300)
    } else {
      calculateResults()
    }
  }

  const calculateResults = () => {
    const totalWeight = Object.values(responses).reduce((sum, r) => sum + r.weight, 0)
    const avgScore = totalWeight / Object.keys(responses).length
    const percentageScore = (avgScore / 4) * 100

    let category = ''
    let description = ''
    let insight = ''
    let premiumInsight = ''

    if (percentageScore >= 85) {
      category = 'Emotionally Regulated'
      description = 'You demonstrate strong emotional awareness and regulation skills. You can recognize your triggers, manage your reactions, and recover quickly from conflict.'
      insight = 'Your emotional regulation is a core strength. Continue practicing mindful awareness during heated moments to maintain this capacity.'
      premiumInsight = 'Advanced pattern analysis shows you have developed sophisticated meta-cognitive awareness. Your ability to observe your own emotional states creates a buffer between stimulus and response. To further optimize, focus on teaching these skills to your partner and creating shared emotional regulation rituals. Research suggests couples who co-regulate show 40% higher relationship satisfaction.'
    } else if (percentageScore >= 70) {
      category = 'Self-Aware Responder'
      description = 'You have good emotional awareness and are developing regulation skills. You can usually identify your patterns and work toward healthier responses.'
      insight = 'You\'re building strong foundations. Focus on extending the pause between trigger and reaction by just a few more seconds.'
      premiumInsight = 'Your assessment reveals a transitional pattern: you\'re moving from reactive to responsive. The key leverage point is in the moment of choice - when you feel activation, you\'re beginning to create space. To accelerate growth, implement a "name it to tame it" practice: verbally label the emotion you\'re feeling before responding. This simple intervention activates your prefrontal cortex and reduces amygdala activation by up to 30%.'
    } else if (percentageScore >= 50) {
      category = 'Developing Awareness'
      description = 'You\'re beginning to notice your emotional patterns. There\'s opportunity to build stronger self-regulation skills and increase awareness of your triggers.'
      insight = 'Start by simply noticing when you feel activated - awareness is the first step toward regulation.'
      premiumInsight = 'Your pattern suggests you\'re in the early stages of emotional intelligence development. The most effective intervention at this stage is psychoeducation about the nervous system. When you understand that emotional reactions are physiological responses, not character flaws, you can approach them with curiosity rather than judgment. Recommended focus: learn your personal window of tolerance and identify your early warning signs of dysregulation. Practice the 5-4-3-2-1 grounding technique when activated.'
    } else {
      category = 'Reactive Responder'
      description = 'You tend to react quickly to emotional triggers. Building awareness of your patterns and learning regulation techniques would significantly benefit your relationship quality.'
      insight = 'This is a growth opportunity. Consider working with a coach to develop personalized regulation strategies.'
      premiumInsight = 'Your assessment indicates a reactive pattern that likely stems from nervous system sensitivity or early attachment experiences. This isn\'t a character flaw - it\'s a learned response that can be unlearned. Priority intervention: somatic regulation practices (breathwork, movement, progressive muscle relaxation) to build capacity before working on cognitive strategies. Research shows that attempting cognitive reframing while in a dysregulated state is ineffective. You need bottom-up (body) regulation first, then top-down (cognitive) strategies.'
    }

    const scoreDelta = Math.round((avgScore - 2) * 1.5)
    const currentRisScore = risScore || { understand: 51, align: 53, elevate: 50, overall: 52, lastUpdated: new Date().toISOString() }
    const newUnderstandScore = Math.max(0, Math.min(100, currentRisScore.understand + scoreDelta))
    const newOverallScore = Math.round((newUnderstandScore * 0.35) + (currentRisScore.align * 0.35) + (currentRisScore.elevate * 0.30))

    setRisScore((current) => ({
      ...(current || currentRisScore),
      understand: newUnderstandScore,
      overall: newOverallScore,
      lastUpdated: new Date().toISOString()
    }))

    setResult({ category, score: Math.round(percentageScore), description, insight, premiumInsight })
    setShowResults(true)
  }

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1)
    }
  }

  if (showResults && result) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="p-8 bg-gradient-to-br from-understand/10 via-background to-background border-understand/30">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-understand/20 mb-4">
                  <Brain size={40} weight="duotone" className="text-understand" />
                </div>
                <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Sora, sans-serif' }}>
                  Assessment Complete
                </h1>
                <p className="text-muted-foreground">Your Emotional Reaction Style</p>
              </div>

              <div className="space-y-6">
                <div className="text-center p-6 bg-understand/10 rounded-xl">
                  <div className="text-5xl font-bold text-understand mb-2">{result.score}</div>
                  <div className="text-lg font-semibold" style={{ fontFamily: 'Sora, sans-serif' }}>
                    {result.category}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Sparkle size={18} className="text-understand" weight="fill" />
                      Your Pattern
                    </h3>
                    <p className="text-sm text-muted-foreground">{result.description}</p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Sparkle size={18} className="text-understand" weight="fill" />
                      Key Insight
                    </h3>
                    <p className="text-sm text-muted-foreground">{result.insight}</p>
                  </div>

                  <div className="relative">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Sparkle size={18} className="text-gold" weight="fill" />
                      Deep Pattern Analysis
                      {!isPremium && (
                        <Badge variant="secondary" className="ml-2">
                          <Lock size={12} className="mr-1" />
                          Premium
                        </Badge>
                      )}
                    </h3>
                    {isPremium ? (
                      <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-sm text-muted-foreground"
                      >
                        {result.premiumInsight}
                      </motion.p>
                    ) : (
                      <div className="relative">
                        <p className="text-sm text-muted-foreground blur-sm select-none">
                          {result.premiumInsight}
                        </p>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Button onClick={() => onNavigate('pricing')} size="sm">
                            Unlock Premium Analysis
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button 
                    onClick={() => onNavigate('understand')} 
                    variant="outline"
                    className="flex-1"
                  >
                    Back to UNDERSTAND
                  </Button>
                  <Button 
                    onClick={() => {
                      if (onComplete) onComplete()
                      onNavigate('dashboard')
                    }}
                    className="flex-1"
                  >
                    Go to Dashboard
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    )
  }

  const currentQ = questions[currentQuestion]

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-3xl mx-auto">
        <Button variant="ghost" onClick={() => onNavigate('understand')} className="mb-6">
          <ArrowLeft className="mr-2" /> Back
        </Button>

        <Card className="p-8">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">
                Question {currentQuestion + 1} of {questions.length}
              </span>
              <span className="text-sm font-medium">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-xl font-semibold mb-6" style={{ fontFamily: 'Sora, sans-serif' }}>
                {currentQ.question}
              </h2>

              <div className="space-y-3">
                {currentQ.options.map((option) => (
                  <motion.button
                    key={option.value}
                    onClick={() => handleAnswer(currentQ.id, option.value, option.weight)}
                    className="w-full p-4 text-left rounded-lg border-2 border-border hover:border-understand hover:bg-understand/5 transition-all"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {option.label}
                  </motion.button>
                ))}
              </div>

              {currentQuestion > 0 && (
                <Button
                  variant="ghost"
                  onClick={handleBack}
                  className="mt-6"
                >
                  <ArrowLeft className="mr-2" size={16} />
                  Previous Question
                </Button>
              )}
            </motion.div>
          </AnimatePresence>
        </Card>
      </div>
    </div>
  )
}
