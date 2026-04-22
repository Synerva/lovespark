import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Target, Sparkle, Lock } from '@phosphor-icons/react'
import type { AppView } from '../App'
import type { User, RISScore, Subscription } from '@/lib/types'

interface GrowthMindsetAssessmentProps {
  onNavigate: (view: AppView) => void
  onComplete?: () => void
}

const questions = [
  {
    id: 'change-belief',
    question: 'How do you view your ability to change and grow in relationships?',
    options: [
      { value: 'fixed', label: 'People don\'t really change much', weight: 1 },
      { value: 'limited', label: 'Some change is possible, but it\'s difficult', weight: 2 },
      { value: 'capable', label: 'I believe I can grow with effort', weight: 3 },
      { value: 'evolving', label: 'I\'m constantly evolving and becoming better', weight: 4 },
    ]
  },
  {
    id: 'challenge-view',
    question: 'How do you typically view challenges or conflicts in your relationship?',
    options: [
      { value: 'threat', label: 'As threats to the relationship', weight: 1 },
      { value: 'negative', label: 'As negative occurrences I wish didn\'t happen', weight: 2 },
      { value: 'neutral', label: 'As neutral occurrences that happen', weight: 3 },
      { value: 'growth', label: 'As essential opportunities for growth', weight: 4 },
    ]
  },
  {
    id: 'feedback-response',
    question: 'When your partner gives you constructive feedback, how do you typically respond?',
    options: [
      { value: 'defensive', label: 'I feel defensive and want to justify myself', weight: 1 },
      { value: 'difficult', label: 'It\'s hard, but I try to listen', weight: 2 },
      { value: 'open', label: 'I\'m open to it and reflect on the feedback', weight: 3 },
      { value: 'grateful', label: 'I\'m grateful for the insight and opportunity to grow', weight: 4 },
    ]
  },
  {
    id: 'effort-attitude',
    question: 'How do you approach putting effort into improving your relationship?',
    options: [
      { value: 'natural', label: 'It should feel natural, not require effort', weight: 1 },
      { value: 'occasional', label: 'I put in effort occasionally when needed', weight: 2 },
      { value: 'intentional', label: 'I intentionally invest effort regularly', weight: 3 },
      { value: 'consistent', label: 'Consistently, with regular effort', weight: 4 },
    ]
  },
  {
    id: 'mistake-handling',
    question: 'When you make a mistake that hurts your partner, how do you typically handle it?',
    options: [
      { value: 'shame', label: 'I feel shame and want to avoid the topic', weight: 1 },
      { value: 'defensive', label: 'I explain why I did it or minimize it', weight: 2 },
      { value: 'apologize', label: 'I apologize and try to do better', weight: 3 },
      { value: 'learn', label: 'Own it fully and use it as a learning moment', weight: 4 },
    ]
  },
  {
    id: 'vulnerability',
    question: 'How comfortable are you with being vulnerable in your relationship?',
    options: [
      { value: 'avoid', label: 'I avoid it as much as possible', weight: 1 },
      { value: 'selective', label: 'Selective, only in safe moments', weight: 2 },
      { value: 'working', label: 'I\'m working on being more vulnerable', weight: 3 },
      { value: 'open', label: 'I embrace vulnerability as connection', weight: 4 },
    ]
  },
  {
    id: 'learning-approach',
    question: 'How do you approach learning about relationships and personal development?',
    options: [
      { value: 'rare', label: 'I rarely seek out information or resources', weight: 1 },
      { value: 'reactive', label: 'Only when there\'s a problem', weight: 2 },
      { value: 'interested', label: 'I\'m interested and occasionally read or learn', weight: 3 },
      { value: 'proactive', label: 'I proactively seek growth opportunities', weight: 4 },
    ]
  },
  {
    id: 'partner-growth',
    question: 'How do you feel about your partner\'s growth and change?',
    options: [
      { value: 'threatened', label: 'Sometimes it feels threatening', weight: 1 },
      { value: 'cautious', label: 'I\'m cautious about it', weight: 2 },
      { value: 'supportive', label: 'I support it when they bring it up', weight: 3 },
      { value: 'encouraging', label: 'Enthusiastically encouraging', weight: 4 },
    ]
  },
]

export function GrowthMindsetAssessment({ onNavigate, onComplete }: GrowthMindsetAssessmentProps) {
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
      category = 'Strong Growth Mindset'
      description = 'You demonstrate a powerful growth orientation. You embrace challenges, seek feedback, and view change as essential to thriving relationships.'
      insight = 'Your mindset is a major relationship asset. Continue modeling this for your partner and creating a culture of growth together.'
      premiumInsight = 'Your assessment reveals exceptional psychological flexibility and meta-awareness. You\'ve internalized that relationships are dynamic systems requiring continuous adaptation. To optimize further, focus on creating shared growth rituals with your partner - couples who co-learn show 45% higher satisfaction. Consider implementing quarterly "relationship reviews" where you celebrate growth and set intentions together.'
    } else if (percentageScore >= 70) {
      category = 'Emerging Growth Mindset'
      description = 'You have strong growth orientation with some protective patterns. You\'re building the foundation of a growth mindset and making meaningful progress.'
      insight = 'You\'re on a powerful trajectory. Notice when you slip into fixed thinking and gently redirect yourself toward possibility.'
      premiumInsight = 'Your pattern shows strong growth orientation with some protective patterns remaining. The key leverage point is catching yourself in moments of threat response - when feedback feels like criticism or change feels destabilizing. These moments are neural pathway opportunities. Practice the "yet" reframe: "I can\'t do this yet" versus "I can\'t do this." This single word activates different brain networks. Focus on building evidence of past growth to strengthen your belief in future capacity.'
    } else if (percentageScore >= 50) {
      category = 'Mixed Mindset'
      description = 'You alternate between growth and fixed mindset depending on context and stress. There\'s significant opportunity to develop more consistent growth orientation.'
      insight = 'Start small: identify one area where you can experiment with a growth perspective this week.'
      premiumInsight = 'Your assessment indicates context-dependent mindset - you access growth thinking in some situations but default to fixed patterns under stress. This is actually a common and workable pattern. The intervention: stress inoculation. When you\'re calm, visualize challenging relationship scenarios and mentally rehearse growth-oriented responses. This pre-loads the neural pathways so they\'re more accessible under pressure. Also, examine where your fixed beliefs originated - often they\'re protective mechanisms from past relationships.'
    } else {
      category = 'Fixed Mindset Pattern'
      description = 'You may be operating primarily from a fixed mindset, which can limit relationship growth and create defensiveness around feedback.'
      insight = 'This pattern is changeable - ironically, adopting a growth mindset about mindset itself is the first step. Consider working with a coach.'
      premiumInsight = 'Your pattern indicates deep-seated beliefs that change is threatening or unlikely. This isn\'t a character flaw - it\'s often a protective mechanism from experiences where change felt unsafe or where efforts weren\'t rewarded. The most effective intervention is gradual exposure to micro-wins: start with tiny, achievable changes that build evidence of your capacity. Focus first on behaviors, not beliefs - the beliefs will follow. Consider: what would need to be true for you to believe change is possible? Address those core safety needs first.'
    }

    const scoreDelta = Math.round((avgScore - 2) * 1.5)
    const currentRisScore = risScore || { understand: 51, align: 53, elevate: 50, overall: 52, lastUpdated: new Date().toISOString() }
    const newElevateScore = Math.max(0, Math.min(100, currentRisScore.elevate + scoreDelta))
    const newOverallScore = Math.round((currentRisScore.understand * 0.35) + (currentRisScore.align * 0.35) + (newElevateScore * 0.30))

    setRisScore((current) => ({
      ...(current || currentRisScore),
      elevate: newElevateScore,
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
