import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Card } from '@/components/ui/card'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Target, Sparkle, Lock } from '@phosphor-icons/react'
import type { User, RISScore, Subscription } from '@/lib/types'
import type { AppView } from '@/App'

interface GrowthMindsetAssessmentProps {
  onNavigate: (view: AppView) => void
  onComplete?: () => void
}

const questions = [
  {
    id: 'personal-development',
    question: 'How do you approach learning about relationships and personal development?',
    options: [
      { value: 'avoidant', label: 'I don\'t really engage with it', weight: 1 },
      { value: 'occasional', label: 'I\'m interested and read/listen occasionally', weight: 2 },
      { value: 'interested', label: 'I actively seek out resources and insights', weight: 3 },
      { value: 'regular', label: 'I regularly invest in personal development', weight: 4 },
    ]
  },
  {
    id: 'relationship-investment',
    question: 'How much time and energy do you actively invest in improving your relationship?',
    options: [
      { value: 'minimal', label: 'Very little, if any', weight: 1 },
      { value: 'reactive', label: 'Only when problems arise', weight: 2 },
      { value: 'periodic', label: 'Periodically, when I remember', weight: 3 },
      { value: 'consistent', label: 'Consistently, with regular effort', weight: 4 },
    ]
  },
  {
    id: 'feedback-response',
    question: 'How do you respond to feedback or criticism from your partner?',
    options: [
      { value: 'defensive', label: 'I become defensive or dismissive', weight: 1 },
      { value: 'difficult', label: 'It\'s hard, but I try to listen', weight: 2 },
      { value: 'receptive', label: 'I\'m usually receptive and willing to reflect', weight: 3 },
      { value: 'grateful', label: 'I\'m grateful for the insight and opportunity to grow', weight: 4 },
    ]
  },
  {
    id: 'challenge-view',
    question: 'How do you view challenges or conflicts in your relationship?',
    options: [
      { value: 'threatening', label: 'As threats to the relationship', weight: 1 },
      { value: 'negative', label: 'As negative experiences to avoid', weight: 2 },
      { value: 'learning', label: 'As learning opportunities, though difficult', weight: 3 },
      { value: 'growth', label: 'As essential opportunities for growth', weight: 4 },
    ]
  },
  {
    id: 'vulnerability',
    question: 'How comfortable are you with vulnerability in your relationship?',
    options: [
      { value: 'closed', label: 'Very uncomfortable, I keep walls up', weight: 1 },
      { value: 'selective', label: 'Selective, only in safe moments', weight: 2 },
      { value: 'growing', label: 'Getting more comfortable with practice', weight: 3 },
      { value: 'open', label: 'I embrace vulnerability as connection', weight: 4 },
    ]
  },
  {
    id: 'mistake-response',
    question: 'When you make a mistake in your relationship, your typical response is:',
    options: [
      { value: 'blame', label: 'Defend or shift blame', weight: 1 },
      { value: 'shame', label: 'Feel ashamed and withdraw', weight: 2 },
      { value: 'acknowledge', label: 'Acknowledge it and try to do better', weight: 3 },
      { value: 'learn', label: 'Own it fully and use it as a learning moment', weight: 4 },
    ]
  },
  {
    id: 'partner-growth',
    question: 'How do you feel about your partner\'s personal growth and changes?',
    options: [
      { value: 'threatened', label: 'Threatened or uncomfortable', weight: 1 },
      { value: 'uncertain', label: 'Uncertain, worried about growing apart', weight: 2 },
      { value: 'supportive', label: 'Supportive, with some concerns', weight: 3 },
      { value: 'encouraging', label: 'Enthusiastically encouraging', weight: 4 },
    ]
  },
  {
    id: 'fixed-patterns',
    question: 'When you notice unhelpful patterns in your relationship, you:',
    options: [
      { value: 'accept', label: 'Accept them as "just how things are"', weight: 1 },
      { value: 'aware', label: 'Notice them but feel stuck', weight: 2 },
      { value: 'experiment', label: 'Experiment with changing them', weight: 3 },
      { value: 'actively-shift', label: 'Actively work to shift them together', weight: 4 },
    ]
  },
]

export function GrowthMindsetAssessment({ onNavigate, onComplete }: GrowthMindsetAssessmentProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [showResults, setShowResults] = useState(false)
  const [user] = useKV<User | undefined>('lovespark-user', undefined)
  const [subscription] = useKV<Subscription | undefined>('lovespark-subscription', undefined)
  const [risScore, setRisScore] = useKV<RISScore>('lovespark-ris-score', {
    overall: 0,
    understand: 0,
    align: 0,
    elevate: 0,
    lastUpdated: new Date().toISOString(),
  })
  const [responses, setResponses] = useState<Record<string, { value: string; weight: number }>>({})
  const [result, setResult] = useState<{
    score: number
    category: string
    description: string
    insight: string
    premiumInsight: string
  } | null>(null)

  const isPremium = subscription?.planName === 'PREMIUM'
  const progress = ((currentQuestion + 1) / questions.length) * 100

  const handleAnswer = (questionId: string, value: string, weight: number) => {
    setResponses((prev) => ({ ...prev, [questionId]: { value, weight } }))
    
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1)
    } else {
      calculateResults()
    }
  }

  const calculateResults = () => {
    const totalWeight = Object.values(responses).reduce((sum, r) => sum + r.weight, 0)
    const responseCount = Object.keys(responses).length + 1
    const avgScore = totalWeight / responseCount
    const percentageScore = (avgScore / 4) * 100
    
    let category = ''
    let description = ''
    let insight = ''
    let premiumInsight = ''

    if (percentageScore >= 85) {
      category = 'Growth-Oriented Mindset'
      description = 'You have a highly developed growth mindset in your relationship. You actively seek opportunities to learn, grow, and evolve together.'
      insight = 'Your commitment to growth is a powerful asset. Continue to model this mindset and invite your partner to grow alongside you.'
      premiumInsight = 'Your pattern shows exceptional openness to growth. The key opportunity is to balance your enthusiasm for growth with acceptance of where you and your partner are in the present moment. Consider: How can you honor the growth journey while also celebrating what already works?'
    } else if (percentageScore >= 65) {
      category = 'Developing Growth Mindset'
      description = 'You have a solid foundation of growth mindset and are actively working to strengthen it. You recognize the value of growth but may face obstacles.'
      insight = 'You\'re on a positive trajectory. Focus on one specific area where you can lean more into growth orientation.'
      premiumInsight = 'Your pattern shows strong growth orientation with some protective habits still active. Notice when you shift into "fixed" thinking - it\'s often a sign of feeling unsafe or uncertain. Creating more emotional safety in those moments will unlock your natural growth orientation.'
    } else if (percentageScore >= 45) {
      category = 'Emerging Growth Mindset'
      description = 'You\'re beginning to develop a growth mindset but may still default to fixed patterns under stress or conflict.'
      insight = 'Start small: identify one area where you can experiment with a more growth-oriented approach this week.'
      premiumInsight = 'Your pattern suggests you intellectually understand growth mindset but emotionally revert to protection under pressure. This is normal. The work is building new neural pathways through repeated practice in low-stakes moments first. What would it look like to practice growth thinking in calm, safe moments?'
    } else {
      category = 'Fixed Mindset Dominant'
      description = 'You may be operating primarily from a fixed mindset, which can create barriers to relationship growth and change.'
      insight = 'Growth mindset is a learnable skill. Begin by noticing one pattern you\'d like to shift and approach it with curiosity.'
      premiumInsight = 'Your pattern indicates deep-seated beliefs that change is threatening or unlikely. This often stems from past experiences where growth felt unsafe or was punished. The invitation is to start very small: can you be curious about one small thing this week? Not to change it, just to be curious about it.'
    }

    const assessmentResult = {
      score: Math.round(percentageScore),
      category,
      description,
      insight,
      premiumInsight
    }

    setResult(assessmentResult)
    setShowResults(true)

    const currentRisScore = risScore || { understand: 51, align: 53, elevate: 50, overall: 51, lastUpdated: new Date().toISOString() }
    const newElevateScore = Math.round((currentRisScore.elevate + percentageScore) / 2)
    const newOverall = Math.round((currentRisScore.understand + currentRisScore.align + newElevateScore) / 3)
    
    setRisScore({
      understand: currentRisScore.understand,
      align: currentRisScore.align,
      overall: newOverall,
      elevate: newElevateScore,
      lastUpdated: new Date().toISOString()
    })
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
            <Card className="p-8 bg-gradient-to-br from-elevate/10 via-background to-background border-elevate/30">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-elevate/20 mb-4">
                  <Target size={40} weight="duotone" className="text-elevate" />
                </div>
                <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Sora, sans-serif' }}>
                  Assessment Complete
                </h1>
                <p className="text-muted-foreground">Your Growth Mindset Profile</p>
              </div>

              <div className="space-y-6">
                <div className="text-center p-6 bg-elevate/10 rounded-xl">
                  <div className="text-5xl font-bold text-elevate mb-2">{result.score}</div>
                  <div className="text-lg font-semibold" style={{ fontFamily: 'Sora, sans-serif' }}>
                    {result.category}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Sparkle size={18} className="text-elevate" weight="fill" />
                      Your Pattern
                    </h3>
                    <p className="text-sm text-muted-foreground">{result.description}</p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Sparkle size={18} className="text-elevate" weight="fill" />
                      Key Insight
                    </h3>
                    <p className="text-sm text-muted-foreground">{result.insight}</p>
                  </div>

                  <div className="relative">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Sparkle size={18} className="text-elevate" weight="fill" />
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
                    onClick={() => onNavigate('elevate')} 
                    variant="outline"
                    className="flex-1"
                  >
                    Back to ELEVATE
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
        <Button variant="ghost" onClick={() => onNavigate('elevate')} className="mb-6">
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
                    className="w-full p-4 text-left rounded-lg border-2 border-border hover:border-elevate hover:bg-elevate/5 transition-all"
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
