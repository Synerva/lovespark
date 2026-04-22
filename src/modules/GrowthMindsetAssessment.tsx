import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Target, Sparkle, CheckCircle } from '@phosphor-icons/react'
import { toast } from 'sonner'
import type { AppView } from '../App'

interface GrowthMindsetAssessmentProps {
  onNavigate: (view: AppView) => void
  onComplete?: () => void
}

const questions = [
  {
    id: 'personal-growth-commitment',
    question: 'How committed are you to your own personal growth and development?',
    options: [
      { value: 'minimal', label: 'I rarely think about personal growth', weight: 1 },
      { value: 'occasional', label: 'I occasionally work on self-improvement', weight: 2 },
      { value: 'regular', label: 'I regularly invest in personal development', weight: 3 },
      { value: 'core-priority', label: 'Personal growth is a core priority in my life', weight: 4 },
    ]
  },
  {
    id: 'relationship-investment',
    question: 'How much time and energy do you actively invest in improving your relationship?',
    options: [
      { value: 'reactive', label: 'Only when problems arise', weight: 1 },
      { value: 'sporadic', label: 'Occasionally, when I think about it', weight: 2 },
      { value: 'consistent', label: 'Consistently, with regular effort', weight: 3 },
      { value: 'proactive', label: 'Proactively and intentionally, as a lifestyle', weight: 4 },
    ]
  },
  {
    id: 'feedback-openness',
    question: 'How do you respond to feedback or criticism from your partner?',
    options: [
      { value: 'defensive', label: 'I tend to get defensive and shut down', weight: 1 },
      { value: 'resistant', label: 'I listen but often resist making changes', weight: 2 },
      { value: 'receptive', label: 'I\'m usually receptive and willing to reflect', weight: 3 },
      { value: 'welcoming', label: 'I welcome feedback as an opportunity to grow', weight: 4 },
    ]
  },
  {
    id: 'challenge-perspective',
    question: 'How do you view challenges or conflicts in your relationship?',
    options: [
      { value: 'threatening', label: 'As threats to the relationship', weight: 1 },
      { value: 'frustrating', label: 'As frustrating obstacles to overcome', weight: 2 },
      { value: 'learning', label: 'As learning opportunities, though difficult', weight: 3 },
      { value: 'growth', label: 'As valuable growth opportunities we can face together', weight: 4 },
    ]
  },
  {
    id: 'change-capacity',
    question: 'How capable do you feel of changing relationship patterns or behaviors?',
    options: [
      { value: 'stuck', label: 'I feel stuck in my patterns', weight: 1 },
      { value: 'difficult', label: 'Change is very difficult for me', weight: 2 },
      { value: 'capable', label: 'I believe I can change with effort', weight: 3 },
      { value: 'confident', label: 'I\'m confident in my ability to grow and adapt', weight: 4 },
    ]
  },
  {
    id: 'learning-initiative',
    question: 'How often do you seek out resources (books, articles, tools) about relationships?',
    options: [
      { value: 'never', label: 'Never or very rarely', weight: 1 },
      { value: 'crisis-only', label: 'Only during relationship crises', weight: 2 },
      { value: 'occasionally', label: 'Occasionally, a few times a year', weight: 3 },
      { value: 'regularly', label: 'Regularly, I\'m always learning', weight: 4 },
    ]
  },
  {
    id: 'partner-support',
    question: 'How supportive are you of your partner\'s personal growth and goals?',
    options: [
      { value: 'threatened', label: 'I sometimes feel threatened by their growth', weight: 1 },
      { value: 'passive', label: 'I\'m supportive but not actively involved', weight: 2 },
      { value: 'encouraging', label: 'I actively encourage and celebrate their growth', weight: 3 },
      { value: 'champion', label: 'I champion their growth and help facilitate it', weight: 4 },
    ]
  },
  {
    id: 'vulnerability-willingness',
    question: 'How willing are you to be vulnerable and share your growth edges with your partner?',
    options: [
      { value: 'guarded', label: 'I keep my struggles private', weight: 1 },
      { value: 'selective', label: 'I share some things but stay guarded', weight: 2 },
      { value: 'open', label: 'I\'m generally open about my growth areas', weight: 3 },
      { value: 'fully-vulnerable', label: 'I\'m fully vulnerable about my journey', weight: 4 },
    ]
  },
  {
    id: 'progress-reflection',
    question: 'How often do you reflect on your relationship progress and set new goals?',
    options: [
      { value: 'never', label: 'I don\'t really reflect or set goals', weight: 1 },
      { value: 'rarely', label: 'Rarely, maybe once a year', weight: 2 },
      { value: 'quarterly', label: 'A few times a year, regularly', weight: 3 },
      { value: 'ongoing', label: 'It\'s an ongoing practice for me', weight: 4 },
    ]
  },
  {
    id: 'expert-help',
    question: 'How do you view seeking professional help (therapy, coaching) for relationship growth?',
    options: [
      { value: 'last-resort', label: 'Only as a last resort for crisis', weight: 1 },
      { value: 'reluctant', label: 'I\'m reluctant but would if necessary', weight: 2 },
      { value: 'open', label: 'I\'m open to it and see the value', weight: 3 },
      { value: 'proactive', label: 'I proactively seek expert guidance for growth', weight: 4 },
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
    if (score >= 85) return { label: 'Exceptional Growth Mindset', color: 'text-success', bgColor: 'bg-success/10' }
    if (score >= 70) return { label: 'Strong Growth Orientation', color: 'text-elevate', bgColor: 'bg-elevate/10' }
    if (score >= 55) return { label: 'Developing Growth Mindset', color: 'text-warning', bgColor: 'bg-warning/10' }
    return { label: 'Fixed Mindset Patterns', color: 'text-destructive', bgColor: 'bg-destructive/10' }
  }

  const getInsights = (score: number) => {
    if (score >= 85) {
      return [
        'You have an exceptional commitment to personal and relationship growth',
        'Your openness to feedback and change creates a strong foundation for continuous improvement',
        'You actively invest in learning and development, both individually and as a couple',
        'Continue to maintain this growth-oriented approach while ensuring balance and self-compassion',
      ]
    }
    if (score >= 70) {
      return [
        'You demonstrate a strong orientation toward personal and relationship growth',
        'You\'re generally receptive to feedback and willing to make positive changes',
        'Consider increasing your proactive investment in relationship development',
        'Explore additional resources and tools to deepen your growth practice',
      ]
    }
    if (score >= 55) {
      return [
        'You\'re developing a growth mindset but may struggle with consistency',
        'You recognize the value of growth but may face barriers to fully committing',
        'Focus on building regular habits around reflection and learning',
        'Work on increasing your openness to feedback and vulnerability',
      ]
    }
    return [
      'You may be operating with more fixed mindset patterns',
      'Growth and change may feel challenging or threatening',
      'Consider exploring what barriers prevent you from embracing relationship development',
      'Small steps toward openness and learning can create significant positive shifts',
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
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-elevate/20 rounded-lg">
              <Target size={32} weight="duotone" className="text-elevate" />
            </div>
            <div>
              <h1 className="text-2xl font-bold" style={{ fontFamily: 'Sora, sans-serif' }}>
                Growth Mindset Assessment
              </h1>
              <p className="text-sm text-muted-foreground">
                Question {currentQuestionIndex + 1} of {questions.length}
              </p>
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="p-8 mb-6 border-elevate/20">
              <h2 className="text-xl font-semibold mb-6" style={{ fontFamily: 'Sora, sans-serif' }}>
                {currentQuestion.question}
              </h2>

              <div className="space-y-3">
                {currentQuestion.options.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleAnswer(option.weight)}
                    className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                      answers[currentQuestion.id] === option.weight
                        ? 'border-elevate bg-elevate/10'
                        : 'border-border hover:border-elevate/50 hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        answers[currentQuestion.id] === option.weight
                          ? 'border-elevate bg-elevate'
                          : 'border-border'
                      }`}>
                        {answers[currentQuestion.id] === option.weight && (
                          <div className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </div>
                      <span className="text-sm">{option.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </Card>

            <div className="flex gap-3">
              {currentQuestionIndex > 0 && (
                <Button onClick={handleBack} variant="outline" className="flex-1">
                  Back
                </Button>
              )}
              <Button
                onClick={handleNext}
                disabled={!hasAnsweredCurrent}
                className="flex-1"
              >
                {currentQuestionIndex === questions.length - 1 ? 'Complete' : 'Next'}
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
