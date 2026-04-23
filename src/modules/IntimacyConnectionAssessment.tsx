import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Heart, Sparkle, CheckCircle } from '@phosphor-icons/react'
import { toast } from 'sonner'
import type { AppView } from '../App'
import { saveAssessment } from '@/lib/db/assessments'

interface IntimacyConnectionAssessmentProps {
  onNavigate: (view: AppView) => void
  onComplete?: () => void
}

const questions = [
  {
    id: 'emotional-intimacy',
    question: 'How deep is the emotional intimacy in your relationship?',
    options: [
      { value: 'surface', label: 'We mostly keep things surface-level', weight: 1 },
      { value: 'selective', label: 'We share deeply sometimes, but not consistently', weight: 2 },
      { value: 'regular', label: 'We regularly share emotions and feel understood', weight: 3 },
      { value: 'profound', label: 'We have profound emotional intimacy and connection', weight: 4 },
    ]
  },
  {
    id: 'physical-intimacy',
    question: 'How satisfied are you with the physical intimacy in your relationship?',
    options: [
      { value: 'dissatisfied', label: 'Very dissatisfied, it\'s a significant issue', weight: 1 },
      { value: 'lacking', label: 'Somewhat dissatisfied, needs improvement', weight: 2 },
      { value: 'satisfied', label: 'Generally satisfied with some room for growth', weight: 3 },
      { value: 'thriving', label: 'Very satisfied and fulfilling for both of us', weight: 4 },
    ]
  },
  {
    id: 'vulnerability',
    question: 'How comfortable are you being vulnerable with your partner?',
    options: [
      { value: 'guarded', label: 'I stay guarded and protect myself', weight: 1 },
      { value: 'cautious', label: 'I\'m cautious but occasionally open up', weight: 2 },
      { value: 'mostly-open', label: 'I\'m mostly comfortable being vulnerable', weight: 3 },
      { value: 'fully-open', label: 'I feel completely safe being vulnerable', weight: 4 },
    ]
  },
  {
    id: 'emotional-safety',
    question: 'How emotionally safe do you feel in the relationship?',
    options: [
      { value: 'unsafe', label: 'I often feel emotionally unsafe or judged', weight: 1 },
      { value: 'inconsistent', label: 'Safety feels inconsistent and unpredictable', weight: 2 },
      { value: 'mostly-safe', label: 'I generally feel safe with occasional concerns', weight: 3 },
      { value: 'completely-safe', label: 'I feel completely safe and accepted', weight: 4 },
    ]
  },
  {
    id: 'quality-time',
    question: 'How intentional and meaningful is the quality time you spend together?',
    options: [
      { value: 'rare', label: 'Rare or mostly distracted when together', weight: 1 },
      { value: 'occasional', label: 'Occasional quality moments but inconsistent', weight: 2 },
      { value: 'regular', label: 'Regular intentional time that feels connecting', weight: 3 },
      { value: 'prioritized', label: 'Quality time is prioritized and deeply fulfilling', weight: 4 },
    ]
  },
  {
    id: 'affection-frequency',
    question: 'How often do you express affection (physical touch, words, gestures)?',
    options: [
      { value: 'rarely', label: 'Rarely, affection feels absent', weight: 1 },
      { value: 'sporadic', label: 'Sporadically, not as much as I\'d like', weight: 2 },
      { value: 'regular', label: 'Regularly throughout the day', weight: 3 },
      { value: 'abundant', label: 'Abundantly and naturally in many ways', weight: 4 },
    ]
  },
  {
    id: 'needs-expression',
    question: 'How well do you communicate your intimacy and connection needs?',
    options: [
      { value: 'suppressed', label: 'I keep my needs to myself', weight: 1 },
      { value: 'hinted', label: 'I hint but struggle to express directly', weight: 2 },
      { value: 'expressed', label: 'I express my needs clearly most of the time', weight: 3 },
      { value: 'openly-discussed', label: 'We openly discuss and adjust to each other\'s needs', weight: 4 },
    ]
  },
  {
    id: 'partners-needs',
    question: 'How attuned are you to your partner\'s intimacy and connection needs?',
    options: [
      { value: 'unaware', label: 'I\'m often unaware or confused', weight: 1 },
      { value: 'learning', label: 'I\'m learning but miss signals sometimes', weight: 2 },
      { value: 'attuned', label: 'I\'m generally attuned and responsive', weight: 3 },
      { value: 'deeply-attuned', label: 'I\'m deeply attuned and anticipate their needs', weight: 4 },
    ]
  },
  {
    id: 'passion-excitement',
    question: 'How would you describe the passion and excitement in your relationship?',
    options: [
      { value: 'absent', label: 'Absent or feels like a roommate situation', weight: 1 },
      { value: 'fading', label: 'Fading, we\'re trying to reignite it', weight: 2 },
      { value: 'present', label: 'Present with moments of spark and excitement', weight: 3 },
      { value: 'vibrant', label: 'Vibrant and continuously evolving', weight: 4 },
    ]
  },
  {
    id: 'intimacy-barriers',
    question: 'How effectively do you navigate barriers to intimacy (stress, conflict, life demands)?',
    options: [
      { value: 'overwhelmed', label: 'Barriers completely block intimacy', weight: 1 },
      { value: 'struggling', label: 'We struggle and intimacy suffers significantly', weight: 2 },
      { value: 'managing', label: 'We manage but it requires active effort', weight: 3 },
      { value: 'resilient', label: 'We\'re resilient and maintain connection through challenges', weight: 4 },
    ]
  },
]

export function IntimacyConnectionAssessment({ onNavigate, onComplete }: IntimacyConnectionAssessmentProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [isComplete, setIsComplete] = useState(false)
  const [assessmentResult, setAssessmentResult] = useState<Record<string, any> | null>(null)

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

    console.log('[Assessment][intimacy_connection] started')
    console.log('[Assessment][intimacy_connection] payload mapped', {
      type: 'intimacy_connection',
      answerKeys: Object.keys(answers),
      score: percentageScore,
    })

    try {
      await saveAssessment({
        type: 'intimacy_connection',
        status: 'completed',
        version: 'v1',
        answers,
        scorePayload: result,
      })
      console.log('[Assessment][intimacy_connection] Supabase insert success')
    } catch (error) {
      console.error('[Assessment][intimacy_connection] Supabase insert failure', error)
      toast.error(error instanceof Error ? error.message : 'Unable to save assessment to Supabase.')
      return
    }

    setAssessmentResult(result)

    setIsComplete(true)
    toast.success('Assessment completed!')
    
    if (onComplete) {
      onComplete()
    }
  }

  const getScoreLevel = (score: number) => {
    if (score >= 85) return { label: 'Thriving Intimacy', color: 'text-success', bgColor: 'bg-success/10' }
    if (score >= 70) return { label: 'Strong Connection', color: 'text-elevate', bgColor: 'bg-elevate/10' }
    if (score >= 55) return { label: 'Room for Growth', color: 'text-warning', bgColor: 'bg-warning/10' }
    return { label: 'Needs Attention', color: 'text-destructive', bgColor: 'bg-destructive/10' }
  }

  const getInsights = (score: number) => {
    if (score >= 85) {
      return [
        'You have exceptional intimacy and connection in your relationship',
        'Both emotional and physical intimacy are strong and fulfilling',
        'You maintain vulnerability and emotional safety with each other',
        'Continue nurturing this connection while staying attentive to evolving needs',
      ]
    }
    if (score >= 70) {
      return [
        'You have a strong foundation of intimacy and connection',
        'Most aspects of emotional and physical intimacy are healthy',
        'Consider exploring areas where you can deepen connection further',
        'Maintain intentional quality time and open communication about needs',
      ]
    }
    if (score >= 55) {
      return [
        'Your intimacy and connection have room for meaningful growth',
        'Some barriers may be interfering with deeper connection',
        'Focus on building emotional safety and vulnerability',
        'Consider dedicating more intentional time to nurturing connection',
      ]
    }
    return [
      'Your intimacy and connection need significant attention',
      'Both emotional and physical intimacy may be struggling',
      'Consider seeking professional support to address barriers',
      'Start with small steps toward rebuilding emotional safety and trust',
    ]
  }

  if (isComplete) {
    const result = assessmentResult
    if (!result) {
      return null
    }
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
                  Here are your Intimacy & Connection results
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
              <Heart size={32} weight="duotone" className="text-elevate" />
            </div>
            <div>
              <h1 className="text-2xl font-bold" style={{ fontFamily: 'Sora, sans-serif' }}>
                Intimacy & Connection Assessment
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
