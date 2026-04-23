import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, ChatsCircle, Sparkle, Lock, TrendUp } from '@phosphor-icons/react'
import { toast } from 'sonner'
import type { AppView } from '../App'
import type { RISScore, Subscription } from '@/lib/types'
import { getCurrentSubscription } from '@/lib/db/subscriptions'
import { loadLatestRISScore, saveAssessment, saveRelationshipIntelligenceScore } from '@/lib/db/assessments'

interface CommunicationPatternsAssessmentProps {
  onNavigate: (view: AppView) => void
  onComplete?: () => void
}

const questions = [
  {
    id: 'listening-style',
    question: 'When your partner is sharing something important, how do you typically listen?',
    options: [
      { value: 'waiting-turn', label: 'I wait for my turn to speak and plan my response', weight: 2 },
      { value: 'interrupting', label: 'I interrupt with my thoughts or solutions', weight: 1 },
      { value: 'active-listening', label: 'I focus fully and ask clarifying questions', weight: 4 },
      { value: 'distracted', label: 'I listen but get distracted easily', weight: 1 },
    ]
  },
  {
    id: 'expression-clarity',
    question: 'How clearly do you express your needs and feelings?',
    options: [
      { value: 'indirect', label: 'I hint at them indirectly', weight: 1 },
      { value: 'sometimes-clear', label: 'Sometimes clear, sometimes vague', weight: 2 },
      { value: 'mostly-direct', label: 'Usually direct but struggle with difficult topics', weight: 3 },
      { value: 'very-direct', label: 'Very direct and specific about my needs', weight: 4 },
    ]
  },
  {
    id: 'defensiveness',
    question: 'How defensive do you become during disagreements?',
    options: [
      { value: 'very-defensive', label: 'Very defensive - I justify and explain', weight: 1 },
      { value: 'somewhat', label: 'Somewhat defensive initially, then open up', weight: 2 },
      { value: 'occasionally', label: 'Occasionally defensive on sensitive topics', weight: 3 },
      { value: 'rarely', label: 'Rarely defensive - I stay curious', weight: 4 },
    ]
  },
  {
    id: 'validation',
    question: 'Do you validate your partner\'s feelings even when you disagree?',
    options: [
      { value: 'rarely', label: 'Rarely - I focus on facts and logic', weight: 1 },
      { value: 'sometimes', label: 'Sometimes, but inconsistently', weight: 2 },
      { value: 'usually', label: 'Usually, though it doesn\'t always feel natural', weight: 3 },
      { value: 'consistently', label: 'Consistently - it\'s a priority for me', weight: 4 },
    ]
  },
  {
    id: 'repair-attempts',
    question: 'How do you handle moments of tension or hurt during conversations?',
    options: [
      { value: 'escalate', label: 'Tension tends to escalate', weight: 1 },
      { value: 'withdraw', label: 'I withdraw to protect myself', weight: 2 },
      { value: 'pause-reset', label: 'I pause and try to reset', weight: 4 },
      { value: 'humor-deflect', label: 'I use humor or deflection', weight: 2 },
    ]
  },
  {
    id: 'assumption-checking',
    question: 'How often do you check your assumptions about what your partner means?',
    options: [
      { value: 'rarely', label: 'Rarely - I assume I understand', weight: 1 },
      { value: 'occasionally', label: 'Occasionally, when something seems off', weight: 2 },
      { value: 'frequently', label: 'Frequently - I ask for clarification', weight: 4 },
      { value: 'always', label: 'Always - I never assume', weight: 4 },
    ]
  },
  {
    id: 'difficult-topics',
    question: 'How do you approach bringing up difficult or uncomfortable topics?',
    options: [
      { value: 'avoid', label: 'I avoid them as long as possible', weight: 1 },
      { value: 'reactive', label: 'I bring them up when I\'m upset', weight: 2 },
      { value: 'planned', label: 'I plan and choose good timing', weight: 4 },
      { value: 'indirect', label: 'I hint and hope they notice', weight: 1 },
    ]
  },
  {
    id: 'nonverbal-awareness',
    question: 'How aware are you of nonverbal communication (tone, body language)?',
    options: [
      { value: 'unaware', label: 'Not very aware - I focus on words', weight: 1 },
      { value: 'somewhat', label: 'Somewhat aware but often miss cues', weight: 2 },
      { value: 'aware', label: 'Quite aware and adjust my approach', weight: 3 },
      { value: 'highly-tuned', label: 'Highly tuned to nonverbal signals', weight: 4 },
    ]
  },
  {
    id: 'meta-communication',
    question: 'Do you talk about how you communicate (meta-communication)?',
    options: [
      { value: 'never', label: 'Never - we just communicate', weight: 1 },
      { value: 'rarely', label: 'Rarely, only after major conflicts', weight: 2 },
      { value: 'sometimes', label: 'Sometimes, when patterns emerge', weight: 3 },
      { value: 'regularly', label: 'Regularly - it\'s part of our practice', weight: 4 },
    ]
  },
  {
    id: 'appreciation-expression',
    question: 'How often do you explicitly express appreciation and positive feelings?',
    options: [
      { value: 'rarely', label: 'Rarely - I assume they know', weight: 1 },
      { value: 'occasionally', label: 'Occasionally, for big things', weight: 2 },
      { value: 'regularly', label: 'Regularly, several times a week', weight: 3 },
      { value: 'daily', label: 'Daily - it\'s a habit', weight: 4 },
    ]
  },
]

type CategoryResult = {
  category: string
  title: string
  description: string
  color: string
}

const categories: Record<string, CategoryResult> = {
  'developing-skills': {
    category: 'Developing Skills',
    title: 'Communication Builder',
    description: 'You\'re developing your communication skills. Focus on active listening, clear expression, and reducing defensiveness.',
    color: 'text-warning'
  },
  'competent-communicator': {
    category: 'Competent Communicator',
    title: 'Competent Communicator',
    description: 'You have solid communication fundamentals. Continue working on consistency and addressing difficult topics proactively.',
    color: 'text-info'
  },
  'skilled-communicator': {
    category: 'Skilled Communicator',
    title: 'Skilled Communicator',
    description: 'You demonstrate strong communication patterns. Focus on deepening emotional attunement and meta-communication practices.',
    color: 'text-success'
  },
  'exceptional-communicator': {
    category: 'Exceptional Communicator',
    title: 'Exceptional Communicator',
    description: 'You exhibit exceptional communication patterns with high emotional intelligence and proactive relationship maintenance.',
    color: 'text-align'
  }
}

export function CommunicationPatternsAssessment({ onNavigate, onComplete }: CommunicationPatternsAssessmentProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [isComplete, setIsComplete] = useState(false)
  const [result, setResult] = useState<CategoryResult | null>(null)
  const [score, setScore] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  
  const [risScore, setRisScore] = useState<RISScore>({
    overall: 0,
    understand: 0,
    align: 0,
    elevate: 0,
    lastUpdated: new Date().toISOString(),
  })
  const [subscription, setSubscription] = useState<Subscription | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [currentSubscription, latestRis] = await Promise.all([
          getCurrentSubscription(),
          loadLatestRISScore(),
        ])
        setSubscription(currentSubscription)
        if (latestRis) {
          setRisScore(latestRis)
        }
      } catch (error) {
        console.error('Failed loading communication patterns assessment state:', error)
      }
    }

    void loadData()
  }, [])

  const isPremium = subscription?.status === 'active' && 
    (subscription?.planId === 'premium' || subscription?.planId === 'premium_coaching')

  const progress = ((currentStep + 1) / questions.length) * 100

  const handleAnswer = (value: string) => {
    setAnswers({ ...answers, [questions[currentStep].id]: value })
    
    if (currentStep < questions.length - 1) {
      setTimeout(() => setCurrentStep(currentStep + 1), 300)
    } else {
      processResults({ ...answers, [questions[currentStep].id]: value })
    }
  }

  const processResults = async (finalAnswers: Record<string, string>) => {
    setIsProcessing(true)
    
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    let totalWeight = 0
    let maxWeight = 0
    
    questions.forEach(question => {
      const answer = finalAnswers[question.id]
      const option = question.options.find(opt => opt.value === answer)
      if (option) {
        totalWeight += option.weight
      }
      maxWeight += 4
    })
    
    const calculatedScore = Math.round((totalWeight / maxWeight) * 100)
    setScore(calculatedScore)
    
    let categoryKey: string
    if (calculatedScore < 50) {
      categoryKey = 'developing-skills'
    } else if (calculatedScore < 70) {
      categoryKey = 'competent-communicator'
    } else if (calculatedScore < 85) {
      categoryKey = 'skilled-communicator'
    } else {
      categoryKey = 'exceptional-communicator'
    }
    
    setResult(categories[categoryKey])
    
    const alignBoost = Math.min(5, Math.floor(calculatedScore / 20))
    const newAlignScore = Math.min(100, (risScore?.align || 0) + alignBoost)
    const understandScore = risScore?.understand || 0
    const elevateScore = risScore?.elevate || 0
    const newOverallScore = Math.round(
      (understandScore * 0.35) +
      (newAlignScore * 0.35) +
      (elevateScore * 0.30)
    )
    
    const updatedRis: RISScore = {
      overall: newOverallScore,
      understand: understandScore,
      align: newAlignScore,
      elevate: elevateScore,
      delta: newOverallScore - (risScore?.overall || 0),
      lastUpdated: new Date().toISOString(),
    }

    setRisScore(updatedRis)

    console.log('[Assessment][communication_pattern] Submit start')
    console.log('[Assessment][communication_pattern] Payload mapped', {
      type: 'communication_pattern',
      score: calculatedScore,
      answerKeys: Object.keys(finalAnswers),
    })

    try {
      await saveAssessment({
        type: 'communication_pattern',
        status: 'completed',
        version: 'v1',
        answers: finalAnswers,
        scorePayload: {
          score: calculatedScore,
          category: categoryKey,
          categoryData: categories[categoryKey],
          completedAt: new Date().toISOString(),
        },
      })

      await saveRelationshipIntelligenceScore(
        {
          source: 'communication_patterns_assessment',
          answers: finalAnswers,
        },
        updatedRis
      )
      console.log('[Assessment][communication_pattern] Supabase write success')
    } catch (error) {
      console.error('[Assessment][communication_pattern] Supabase write failed', error)
      toast.error(error instanceof Error ? error.message : 'Unable to save assessment to Supabase.')
      setIsProcessing(false)
      return
    }
    
    setIsProcessing(false)
    setIsComplete(true)
    
    toast.success('Assessment complete! Your RIS score has been updated.')
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleRetake = () => {
    setCurrentStep(0)
    setAnswers({})
    setIsComplete(false)
    setResult(null)
    setScore(0)
  }

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="p-12 max-w-md w-full text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="inline-block mb-6"
          >
            <Sparkle size={48} weight="duotone" className="text-align" />
          </motion.div>
          <h2 className="text-2xl font-semibold mb-2" style={{ fontFamily: 'Sora, sans-serif' }}>
            Analyzing Communication Patterns
          </h2>
          <p className="text-muted-foreground">
            Processing your responses and updating your profile...
          </p>
        </Card>
      </div>
    )
  }

  if (isComplete && result) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-3xl mx-auto">
          <Button variant="ghost" onClick={() => onNavigate('align')} className="mb-6">
            <ArrowLeft className="mr-2" /> Back to ALIGN
          </Button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <Card className="p-8 bg-gradient-to-br from-align/20 via-align/10 to-background border-align/30">
              <div className="text-center mb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", duration: 0.6 }}
                  className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-align/20 mb-6"
                >
                  <ChatsCircle size={48} weight="duotone" className="text-align" />
                </motion.div>
                
                <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: 'Sora, sans-serif' }}>
                  {result.title}
                </h1>
                
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Badge variant="secondary" className="text-lg px-4 py-1">
                    Communication Score: {score}%
                  </Badge>
                  {risScore?.delta && risScore.delta > 0 && (
                    <Badge className="bg-success text-success-foreground">
                      <TrendUp size={16} className="mr-1" />
                      +{risScore.delta} RIS
                    </Badge>
                  )}
                </div>
                
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  {result.description}
                </p>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4" style={{ fontFamily: 'Sora, sans-serif' }}>
                Your Communication Pattern Profile
              </h2>
              
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Overall Communication Quality</span>
                    <span className="text-sm text-muted-foreground">{score}%</span>
                  </div>
                  <Progress value={score} className="h-2" />
                </div>

                {isPremium ? (
                  <>
                    <div className="pt-4 border-t border-border space-y-3">
                      <h3 className="font-semibold text-sm">Key Strengths</h3>
                      
                      <div className="space-y-2 text-sm">
                        {score >= 70 && (
                          <p className="text-muted-foreground">
                            ✓ You demonstrate strong active listening and emotional validation skills
                          </p>
                        )}
                        {score >= 60 && (
                          <p className="text-muted-foreground">
                            ✓ You're developing good patterns for expressing needs and managing conflict
                          </p>
                        )}
                        {score < 60 && (
                          <p className="text-muted-foreground">
                            • Focus on reducing defensiveness and increasing emotional validation
                          </p>
                        )}
                        {score < 50 && (
                          <p className="text-muted-foreground">
                            • Practice active listening without planning your response
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-border space-y-3">
                      <h3 className="font-semibold text-sm">Development Opportunities</h3>
                      
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <p>• Practice meta-communication - talk about how you talk</p>
                        <p>• Increase frequency of explicit appreciation and positive expressions</p>
                        <p>• Develop habits for checking assumptions and seeking clarification</p>
                        <p>• Create rituals for addressing difficult topics proactively</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <Card className="p-6 bg-muted/30 border-dashed relative overflow-hidden">
                    <div className="absolute inset-0 backdrop-blur-sm bg-background/60" />
                    <div className="relative text-center">
                      <Lock size={32} className="text-muted-foreground mx-auto mb-3" />
                      <h3 className="font-semibold mb-2">Unlock Detailed Analysis</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Get personalized communication insights, specific strengths, and targeted improvement strategies
                      </p>
                      <Button onClick={() => onNavigate('pricing')} className="bg-align hover:bg-align/90">
                        Upgrade to Premium
                      </Button>
                    </div>
                  </Card>
                )}
              </div>
            </Card>

            <div className="flex gap-3">
              <Button onClick={handleRetake} variant="outline" className="flex-1">
                Retake Assessment
              </Button>
              <Button onClick={() => onNavigate('align')} className="flex-1 bg-align hover:bg-align/90">
                Continue to ALIGN
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <Button variant="ghost" onClick={currentStep === 0 ? () => onNavigate('align') : handleBack}>
            <ArrowLeft className="mr-2" /> {currentStep === 0 ? 'Back to ALIGN' : 'Previous'}
          </Button>
          
          <Badge variant="secondary">
            Question {currentStep + 1} of {questions.length}
          </Badge>
        </div>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-align/20 rounded-lg">
              <ChatsCircle size={24} weight="duotone" className="text-align" />
            </div>
            <div>
              <h1 className="text-2xl font-bold" style={{ fontFamily: 'Sora, sans-serif' }}>
                Communication Patterns Assessment
              </h1>
              <p className="text-sm text-muted-foreground">
                Evaluate your communication effectiveness and habits
              </p>
            </div>
          </div>
          
          <Progress value={progress} className="h-2" />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="p-8">
              <h2 className="text-xl font-semibold mb-6" style={{ fontFamily: 'Sora, sans-serif' }}>
                {questions[currentStep].question}
              </h2>

              <div className="space-y-3">
                {questions[currentStep].options.map((option) => (
                  <Button
                    key={option.value}
                    onClick={() => handleAnswer(option.value)}
                    variant={answers[questions[currentStep].id] === option.value ? "default" : "outline"}
                    className="w-full justify-start text-left h-auto py-4 px-6"
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
