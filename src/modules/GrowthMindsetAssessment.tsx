import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Target, Sparkle, CheckCircle } from '@phosphor-icons/react'
import { toast } from 'sonner'
import type { AppView } from '../App'

interface GrowthMindsetAssessmentProps {
  onNavigate: (view: AppView) => void
  onComplete?: () => void
}

const questions = [
  {
    id: 'challenges-view',
    question: 'How do you typically view challenges or conflicts in your relationship?',
    options: [
      { value: 'threat', label: 'As threats to the relationship', weight: 1 },
      { value: 'negative', label: 'As negative but unavoidable situations', weight: 2 },
      { value: 'neutral', label: 'As neutral occurrences that happen', weight: 3 },
      { value: 'growth', label: 'As essential opportunities for growth', weight: 4 },
    ]
  },
  {
    id: 'feedback-response',
    question: 'How do you respond when your partner gives you feedback?',
    options: [
      { value: 'defensive', label: 'I become defensive and feel attacked', weight: 1 },
      { value: 'difficult', label: 'It\'s hard, but I try to listen', weight: 2 },
      { value: 'open', label: 'I\'m open to it and reflect on the feedback', weight: 3 },
      { value: 'grateful', label: 'I\'m grateful for the insight and opportunity to grow', weight: 4 },
    ]
  },
  {
    id: 'change-effort',
    question: 'How often do you put effort into changing behaviors that harm the relationship?',
    options: [
      { value: 'rarely', label: 'Rarely, change feels impossible', weight: 1 },
      { value: 'reactive', label: 'Only when it becomes a major issue', weight: 2 },
      { value: 'sometimes', label: 'Sometimes, when I\'m motivated', weight: 3 },
      { value: 'consistent', label: 'Consistently, with regular effort', weight: 4 },
    ]
  },
  {
    id: 'vulnerability',
    question: 'How do you feel about being vulnerable with your partner?',
    options: [
      { value: 'avoid', label: 'I avoid it, it feels unsafe', weight: 1 },
      { value: 'selective', label: 'Selective, only in safe moments', weight: 2 },
      { value: 'comfortable', label: 'Generally comfortable with it', weight: 3 },
      { value: 'open', label: 'I embrace vulnerability as connection', weight: 4 },
    ]
  },
  {
    id: 'mistakes-handling',
    question: 'When you make a mistake that impacts your partner, how do you handle it?',
    options: [
      { value: 'blame', label: 'Deflect or blame circumstances', weight: 1 },
      { value: 'shame', label: 'Feel shame and withdraw', weight: 2 },
      { value: 'apologize', label: 'Apologize and try to move on', weight: 3 },
      { value: 'learn', label: 'Own it fully and use it as a learning moment', weight: 4 },
    ]
  },
  {
    id: 'partner-growth',
    question: 'How do you feel when your partner is growing or changing?',
    options: [
      { value: 'threatened', label: 'Threatened or insecure', weight: 1 },
      { value: 'uncertain', label: 'Uncertain about what it means', weight: 2 },
      { value: 'supportive', label: 'Supportive but cautious', weight: 3 },
      { value: 'encouraging', label: 'Enthusiastically encouraging', weight: 4 },
    ]
  },
  {
    id: 'relationship-improvement',
    question: 'When it comes to improving your relationship skills, you believe:',
    options: [
      { value: 'fixed', label: 'People don\'t really change much', weight: 1 },
      { value: 'limited', label: 'Small changes are possible but limited', weight: 2 },
      { value: 'capable', label: 'Growth is possible with effort', weight: 3 },
      { value: 'unlimited', label: 'There\'s always room for growth and transformation', weight: 4 },
    ]
  },
  {
    id: 'setback-response',
    question: 'After a setback or argument, how do you typically respond?',
    options: [
      { value: 'defeated', label: 'Feel defeated and hopeless', weight: 1 },
      { value: 'frustrated', label: 'Get frustrated and need time away', weight: 2 },
      { value: 'process', label: 'Process it and try to understand', weight: 3 },
      { value: 'analyze', label: 'Analyze what went wrong to improve next time', weight: 4 },
    ]
  },
  {
    id: 'relationship-investment',
    question: 'How do you view investing time and energy into relationship growth?',
    options: [
      { value: 'unnecessary', label: 'Unnecessary, things should be natural', weight: 1 },
      { value: 'occasional', label: 'Occasionally helpful', weight: 2 },
      { value: 'important', label: 'Important for maintaining health', weight: 3 },
      { value: 'essential', label: 'Essential and rewarding practice', weight: 4 },
    ]
  },
  {
    id: 'awareness-patterns',
    question: 'How aware are you of your own relationship patterns and behaviors?',
    options: [
      { value: 'unaware', label: 'Not very aware, I react instinctively', weight: 1 },
      { value: 'somewhat', label: 'Somewhat aware when pointed out', weight: 2 },
      { value: 'aware', label: 'Generally aware and reflective', weight: 3 },
      { value: 'deeply', label: 'Deeply aware and actively working on them', weight: 4 },
    ]
  },
]

export function GrowthMindsetAssessment({ onNavigate, onComplete }: GrowthMindsetAssessmentProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [isComplete, setIsComplete] = useState(false)
  const [assessmentResults, setAssessmentResults] = useKV<Record<string, any>>('lovespark-assessment-results', {})

  const currentQuestion = questions[currentQuestionIndex]
  const progress = (Object.keys(answers).length / questions.length) * 100
  const hasAnsweredCurrent = answers[currentQuestion.id] !== undefined

  const handleAnswer = (weight: number) => {
    setAnswers({ ...answers, [currentQuestion.id]: weight })
  }

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else {
      handleComplete()
    }
  }

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const handleComplete = async () => {
    const totalScore = Object.values(answers).reduce((sum, weight) => sum + weight, 0)
    const maxScore = questions.length * 4
    const percentageScore = Math.round((totalScore / maxScore) * 100)

    const result = {
      score: percentageScore,
      totalScore,
      maxScore,
      answers,
      completedAt: new Date().toISOString(),
    }

    await setAssessmentResults((current) => ({
      ...current,
      growthMindsetAssessment: result,
    }))

    setIsComplete(true)
    toast.success('Assessment completed!')
    
    if (onComplete) {
      onComplete()
    }
  }

  const getScoreLevel = (score: number) => {
    if (score >= 85) return { label: 'Strong Growth Mindset', color: 'text-success', bgColor: 'bg-success/10' }
    if (score >= 70) return { label: 'Developing Growth Mindset', color: 'text-elevate', bgColor: 'bg-elevate/10' }
    if (score >= 55) return { label: 'Emerging Growth Mindset', color: 'text-warning', bgColor: 'bg-warning/10' }
    return { label: 'Fixed Mindset Tendencies', color: 'text-destructive', bgColor: 'bg-destructive/10' }
  }

  const getInsights = (score: number) => {
    if (score >= 85) {
      return [
        'You demonstrate a strong growth mindset in your relationship',
        'You embrace challenges as opportunities for development',
        'You\'re open to feedback and actively work on personal growth',
        'Continue this mindset while staying curious about new areas to explore',
      ]
    }
    if (score >= 70) {
      return [
        'You have a developing growth mindset with room to strengthen it',
        'You generally view challenges positively and are open to feedback',
        'Focus on consistency in applying growth-oriented thinking',
        'Practice vulnerability and embrace mistakes as learning opportunities',
      ]
    }
    if (score >= 55) {
      return [
        'You\'re beginning to develop a growth mindset but face some resistance',
        'Some areas still feel threatening rather than growth-promoting',
        'Start small: identify one area where you can experiment with growth thinking',
        'Build awareness of when you shift into fixed mindset patterns',
      ]
    }
    return [
      'You may be operating primarily from a fixed mindset, which can limit relationship growth',
      'Challenges and feedback may feel threatening rather than helpful',
      'Consider that relationship skills can be developed with practice',
      'Start by getting curious about one behavior pattern you\'d like to understand better',
    ]
  }

  if (isComplete) {
    const result = assessmentResults?.growthMindsetAssessment
    const scoreLevel = getScoreLevel(result.score)
    const insights = getInsights(result.score)

    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-3xl mx-auto">
          <Button variant="ghost" onClick={() => onNavigate('elevate')} className="mb-6">
            <ArrowLeft className="mr-2" /> Back to ELEVATE
          </Button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <Card className="p-8 bg-gradient-to-br from-elevate/10 via-background to-background border-elevate/40">
              <div className="text-center space-y-4">
                <div className="inline-flex p-4 bg-elevate/20 rounded-full">
                  <CheckCircle size={48} weight="duotone" className="text-elevate" />
                </div>
                <h1 className="text-3xl font-bold" style={{ fontFamily: 'Sora, sans-serif' }}>
                  Assessment Complete!
                </h1>
                <p className="text-muted-foreground">
                  Here are your Growth Mindset results
                </p>
              </div>

              <div className="mt-8 space-y-6">
                <div className="text-center">
                  <div className="text-6xl font-bold text-elevate mb-2">
                    {result.score}%
                  </div>
                  <Badge className={`${scoreLevel.bgColor} ${scoreLevel.color} border-0`}>
                    {scoreLevel.label}
                  </Badge>
                </div>

                <Card className="p-6 bg-muted/30">
                  <div className="flex items-start gap-3 mb-4">
                    <Sparkle size={24} weight="duotone" className="text-elevate flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold mb-2" style={{ fontFamily: 'Sora, sans-serif' }}>
                        Key Insights
                      </h3>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        {insights.map((insight, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-elevate mt-1">•</span>
                            <span>{insight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Card>

                <div className="flex gap-3">
                  <Button onClick={() => {
                    setCurrentQuestionIndex(0)
                    setAnswers({})
                    setIsComplete(false)
                  }} variant="outline" className="flex-1">
                    Retake Assessment
                  </Button>
                  <Button onClick={() => onNavigate('elevate')} className="flex-1">
                    Back to ELEVATE
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-3xl mx-auto">
        <Button variant="ghost" onClick={() => onNavigate('elevate')} className="mb-6">
          <ArrowLeft className="mr-2" /> Back to ELEVATE
        </Button>

        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-2xl font-bold" style={{ fontFamily: 'Sora, sans-serif' }}>
              Growth Mindset Assessment
            </h1>
            <span className="text-sm text-muted-foreground">
              {currentQuestionIndex + 1} of {questions.length}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="p-8">
              <h2 className="text-xl font-semibold mb-6" style={{ fontFamily: 'Sora, sans-serif' }}>
                {currentQuestion.question}
              </h2>

              <div className="space-y-3">
                {currentQuestion.options.map((option) => (
                  <Button
                    key={option.value}
                    variant={answers[currentQuestion.id] === option.weight ? "default" : "outline"}
                    className="w-full justify-start text-left h-auto py-4 px-6"
                    onClick={() => handleAnswer(option.weight)}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  variant="ghost"
                  onClick={handleBack}
                  disabled={currentQuestionIndex === 0}
                  className="flex-1"
                >
                  Previous
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={!hasAnsweredCurrent}
                  className="flex-1"
                >
                  {currentQuestionIndex === questions.length - 1 ? 'Complete' : 'Next'}
                </Button>
              </div>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
