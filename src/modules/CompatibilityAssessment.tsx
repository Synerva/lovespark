import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Scales, Sparkle, Lock, TrendUp } from '@phosphor-icons/react'
import { toast } from 'sonner'
import type { AppView } from '../App'
import type { User, RISScore, Subscription } from '@/lib/types'

interface CompatibilityAssessmentProps {
  onNavigate: (view: AppView) => void
  onComplete?: () => void
}

const questions = [
  {
    id: 'values-alignment',
    question: 'How aligned are you with your partner on core life values (family, career, lifestyle)?',
    options: [
      { value: 'very-different', label: 'We have significantly different values', weight: 1 },
      { value: 'some-differences', label: 'We differ on a few important things', weight: 2 },
      { value: 'mostly-aligned', label: 'We\'re mostly aligned with minor differences', weight: 3 },
      { value: 'highly-aligned', label: 'Our core values are deeply aligned', weight: 4 },
    ]
  },
  {
    id: 'future-vision',
    question: 'Do you share a similar vision for your future together?',
    options: [
      { value: 'unclear', label: 'We haven\'t really discussed it', weight: 1 },
      { value: 'different', label: 'Our visions don\'t match well', weight: 1 },
      { value: 'somewhat', label: 'Somewhat aligned but needs work', weight: 2 },
      { value: 'aligned', label: 'Yes, we\'re working toward shared goals', weight: 4 },
    ]
  },
  {
    id: 'conflict-style-match',
    question: 'How compatible are your conflict resolution styles?',
    options: [
      { value: 'clash', label: 'Our styles often clash and escalate tensions', weight: 1 },
      { value: 'struggle', label: 'We struggle but are learning to adapt', weight: 2 },
      { value: 'complement', label: 'Our styles complement each other well', weight: 4 },
      { value: 'identical', label: 'We have very similar conflict approaches', weight: 3 },
    ]
  },
  {
    id: 'emotional-needs',
    question: 'How well do you understand each other\'s emotional needs?',
    options: [
      { value: 'unclear', label: 'We\'re often confused about each other\'s needs', weight: 1 },
      { value: 'learning', label: 'We\'re learning but still miss the mark sometimes', weight: 2 },
      { value: 'good', label: 'We understand each other pretty well', weight: 3 },
      { value: 'deeply', label: 'We deeply understand and meet each other\'s needs', weight: 4 },
    ]
  },
  {
    id: 'lifestyle-compatibility',
    question: 'How compatible are your daily lifestyle preferences (social needs, routines, pace)?',
    options: [
      { value: 'opposite', label: 'We have opposite preferences that cause friction', weight: 1 },
      { value: 'compromise', label: 'Different, but we compromise regularly', weight: 3 },
      { value: 'similar', label: 'Our preferences align naturally', weight: 4 },
      { value: 'flexible', label: 'We adapt easily to each other\'s needs', weight: 4 },
    ]
  },
  {
    id: 'intimacy-alignment',
    question: 'How aligned are your expectations around physical and emotional intimacy?',
    options: [
      { value: 'mismatched', label: 'Often mismatched and a source of tension', weight: 1 },
      { value: 'working-on', label: 'Not fully aligned but actively working on it', weight: 2 },
      { value: 'mostly-aligned', label: 'Mostly aligned with occasional adjustments', weight: 3 },
      { value: 'highly-aligned', label: 'Very aligned and fulfilling for both', weight: 4 },
    ]
  },
  {
    id: 'growth-mindset',
    question: 'Do you both have a growth mindset about the relationship?',
    options: [
      { value: 'one-sided', label: 'Only one of us is invested in growth', weight: 1 },
      { value: 'inconsistent', label: 'We try but aren\'t consistent', weight: 2 },
      { value: 'committed', label: 'We\'re both committed to improving', weight: 4 },
      { value: 'proactive', label: 'We proactively seek growth opportunities together', weight: 4 },
    ]
  },
  {
    id: 'autonomy-balance',
    question: 'How well do you balance independence and togetherness?',
    options: [
      { value: 'imbalanced', label: 'We struggle with this balance frequently', weight: 1 },
      { value: 'negotiating', label: 'We\'re negotiating and learning', weight: 2 },
      { value: 'balanced', label: 'We\'ve found a healthy balance', weight: 4 },
      { value: 'natural', label: 'It feels natural and effortless', weight: 4 },
    ]
  },
  {
    id: 'financial-alignment',
    question: 'How aligned are your approaches to money and financial decisions?',
    options: [
      { value: 'conflict', label: 'Major source of conflict', weight: 1 },
      { value: 'different', label: 'Different approaches but manageable', weight: 2 },
      { value: 'aligned', label: 'Generally aligned with clear agreements', weight: 3 },
      { value: 'seamless', label: 'Seamlessly aligned and collaborative', weight: 4 },
    ]
  },
  {
    id: 'support-reciprocity',
    question: 'Is there balance in how you support each other through challenges?',
    options: [
      { value: 'one-sided', label: 'Feels one-sided most of the time', weight: 1 },
      { value: 'uneven', label: 'Sometimes uneven but improving', weight: 2 },
      { value: 'reciprocal', label: 'Generally reciprocal and fair', weight: 3 },
      { value: 'deeply-balanced', label: 'Deeply balanced and mutually supportive', weight: 4 },
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
  'building-foundation': {
    category: 'Building Foundation',
    title: 'Foundation Builder',
    description: 'You\'re in the early stages of building compatibility. Focus on clarifying values, expectations, and communication patterns.',
    color: 'text-warning'
  },
  'developing-alignment': {
    category: 'Developing Alignment',
    title: 'Alignment Developer',
    description: 'You\'re making progress on compatibility. Continue working on understanding differences and finding common ground.',
    color: 'text-info'
  },
  'strong-compatibility': {
    category: 'Strong Compatibility',
    title: 'Compatible Partners',
    description: 'You have strong compatibility across key dimensions. Focus on maintaining alignment as you grow together.',
    color: 'text-success'
  },
  'exceptional-alignment': {
    category: 'Exceptional Alignment',
    title: 'Exceptionally Aligned',
    description: 'You demonstrate exceptional compatibility and alignment. Your partnership has a solid foundation for long-term success.',
    color: 'text-align'
  }
}

export function CompatibilityAssessment({ onNavigate, onComplete }: CompatibilityAssessmentProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [isComplete, setIsComplete] = useState(false)
  const [result, setResult] = useState<CategoryResult | null>(null)
  const [score, setScore] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  
  const [user] = useKV<User | null>('lovespark-user', null)
  const [risScore, setRisScore] = useKV<RISScore>('lovespark-ris-score', {
    overall: 0,
    understand: 0,
    align: 0,
    elevate: 0,
    lastUpdated: new Date().toISOString(),
  })
  const [subscription] = useKV<Subscription | null>('lovespark-subscription', null)
  const [assessmentResults, setAssessmentResults] = useKV<Record<string, any>>('lovespark-assessment-results', {})

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
      categoryKey = 'building-foundation'
    } else if (calculatedScore < 70) {
      categoryKey = 'developing-alignment'
    } else if (calculatedScore < 85) {
      categoryKey = 'strong-compatibility'
    } else {
      categoryKey = 'exceptional-alignment'
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
    
    setRisScore({
      overall: newOverallScore,
      understand: understandScore,
      align: newAlignScore,
      elevate: elevateScore,
      delta: newOverallScore - (risScore?.overall || 0),
      lastUpdated: new Date().toISOString(),
    })
    
    setAssessmentResults({
      ...assessmentResults,
      compatibilityAssessment: {
        score: calculatedScore,
        category: categoryKey,
        categoryData: categories[categoryKey],
        completedAt: new Date().toISOString(),
        answers: finalAnswers
      }
    })
    
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
            Analyzing Compatibility
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
                  <Scales size={48} weight="duotone" className="text-align" />
                </motion.div>
                
                <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: 'Sora, sans-serif' }}>
                  {result.title}
                </h1>
                
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Badge variant="secondary" className="text-lg px-4 py-1">
                    Compatibility Score: {score}%
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
                Your Compatibility Profile
              </h2>
              
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Overall Compatibility</span>
                    <span className="text-sm text-muted-foreground">{score}%</span>
                  </div>
                  <Progress value={score} className="h-2" />
                </div>

                {isPremium ? (
                  <>
                    <div className="pt-4 border-t border-border space-y-3">
                      <h3 className="font-semibold text-sm">Key Insights</h3>
                      
                      <div className="space-y-2 text-sm">
                        {score >= 70 && (
                          <p className="text-muted-foreground">
                            ✓ Your strong value alignment creates a solid foundation for long-term partnership
                          </p>
                        )}
                        {score >= 60 && (
                          <p className="text-muted-foreground">
                            ✓ You demonstrate good compatibility in managing differences and finding common ground
                          </p>
                        )}
                        {score < 60 && (
                          <p className="text-muted-foreground">
                            • Focus on clarifying expectations and building mutual understanding
                          </p>
                        )}
                        {score < 50 && (
                          <p className="text-muted-foreground">
                            • Consider working with a relationship coach to develop alignment strategies
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-border space-y-3">
                      <h3 className="font-semibold text-sm">Growth Opportunities</h3>
                      
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <p>• Deepen your understanding of each other's core values and future vision</p>
                        <p>• Practice explicit communication about needs and expectations</p>
                        <p>• Create regular check-in rituals to maintain alignment as you grow</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <Card className="p-6 bg-muted/30 border-dashed relative overflow-hidden">
                    <div className="absolute inset-0 backdrop-blur-sm bg-background/60" />
                    <div className="relative text-center">
                      <Lock size={32} className="text-muted-foreground mx-auto mb-3" />
                      <h3 className="font-semibold mb-2">Unlock Detailed Insights</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Get personalized compatibility insights, growth opportunities, and actionable recommendations
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
              <Scales size={24} weight="duotone" className="text-align" />
            </div>
            <div>
              <h1 className="text-2xl font-bold" style={{ fontFamily: 'Sora, sans-serif' }}>
                Compatibility Assessment
              </h1>
              <p className="text-sm text-muted-foreground">
                Evaluate alignment across key relationship dimensions
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
