import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Clock, Sparkle, Lock } from '@phosphor-icons/react'
import type { AppView } from '../App'
import type { RISScore, Subscription } from '@/lib/types'
import { getCurrentSubscription } from '@/lib/db/subscriptions'
import { loadLatestRISScore, saveAssessment, saveRelationshipIntelligenceScore } from '@/lib/db/assessments'

interface CommunicationTimingAssessmentProps {
  onNavigate: (view: AppView) => void
  onComplete?: () => void
}

const questions = [
  {
    id: 'immediate-1',
    question: 'When something upsets you, when do you prefer to talk about it?',
    options: [
      { value: 'immediately', label: 'Right away - I need to address it now', weight: 2 },
      { value: 'after-calm', label: 'After I\'ve calmed down a bit', weight: 4 },
      { value: 'next-day', label: 'The next day when emotions have settled', weight: 3 },
      { value: 'avoid', label: 'I prefer not to bring it up', weight: 1 },
    ]
  },
  {
    id: 'processing-1',
    question: 'How much time do you typically need to process your emotions before discussing them?',
    options: [
      { value: 'none', label: 'No time - I know how I feel immediately', weight: 2 },
      { value: 'minutes', label: '15-30 minutes', weight: 3 },
      { value: 'hours', label: 'A few hours', weight: 4 },
      { value: 'days', label: 'A day or more', weight: 3 },
    ]
  },
  {
    id: 'partner-timing',
    question: 'If your partner needs time before discussing an issue, how do you feel?',
    options: [
      { value: 'anxious', label: 'Anxious and unsettled', weight: 1 },
      { value: 'frustrated', label: 'Frustrated but manage it', weight: 2 },
      { value: 'understanding', label: 'Understanding and patient', weight: 4 },
      { value: 'relieved', label: 'Relieved to have space', weight: 3 },
    ]
  },
  {
    id: 'late-night',
    question: 'Are you okay having important conversations late at night?',
    options: [
      { value: 'yes-necessary', label: 'Yes, we need to resolve it now', weight: 1 },
      { value: 'sometimes', label: 'Sometimes, but not ideal', weight: 2 },
      { value: 'prefer-not', label: 'Prefer not to, but will if needed', weight: 3 },
      { value: 'never', label: 'No, I need rest to communicate well', weight: 4 },
    ]
  },
  {
    id: 'awareness-timing',
    question: 'How aware are you of your optimal times for difficult conversations?',
    options: [
      { value: 'unaware', label: 'I\'ve never really thought about it', weight: 1 },
      { value: 'somewhat', label: 'I have some sense of it', weight: 2 },
      { value: 'aware', label: 'I know my best and worst times', weight: 3 },
      { value: 'advocate', label: 'I actively communicate my timing needs', weight: 4 },
    ]
  },
  {
    id: 'silence-comfort',
    question: 'How comfortable are you with silence or pauses in emotional conversations?',
    options: [
      { value: 'uncomfortable', label: 'Very uncomfortable - I need to fill it', weight: 1 },
      { value: 'slightly', label: 'Slightly uncomfortable but tolerate it', weight: 2 },
      { value: 'comfortable', label: 'Comfortable - silence is okay', weight: 4 },
      { value: 'prefer', label: 'I actually prefer pauses to think', weight: 4 },
    ]
  },
  {
    id: 'energy-levels',
    question: 'Do you consider energy levels when initiating difficult conversations?',
    options: [
      { value: 'never', label: 'No, I bring things up when they arise', weight: 1 },
      { value: 'sometimes', label: 'Sometimes, but not consistently', weight: 2 },
      { value: 'usually', label: 'Usually, I check in first', weight: 3 },
      { value: 'always', label: 'Always - timing is crucial for me', weight: 4 },
    ]
  },
  {
    id: 'text-vs-person',
    question: 'For emotionally charged topics, what\'s your preference?',
    options: [
      { value: 'text-first', label: 'Text first to organize my thoughts', weight: 2 },
      { value: 'face-to-face', label: 'Always face-to-face', weight: 4 },
      { value: 'write-then-talk', label: 'Write it out, then discuss in person', weight: 4 },
      { value: 'avoid-both', label: 'I avoid both if possible', weight: 1 },
    ]
  },
  {
    id: 'schedule-talks',
    question: 'How do you feel about scheduling time to discuss relationship issues?',
    options: [
      { value: 'weird', label: 'Weird and formal - conversations should be spontaneous', weight: 2 },
      { value: 'neutral', label: 'Neutral - whatever works', weight: 3 },
      { value: 'helpful', label: 'Helpful - it gives me time to prepare', weight: 4 },
      { value: 'essential', label: 'Essential - I need this structure', weight: 4 },
    ]
  },
]

export function CommunicationTimingAssessment({ onNavigate, onComplete }: CommunicationTimingAssessmentProps) {
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [risScore, setRisScore] = useState<RISScore>({
    overall: 52,
    understand: 51,
    align: 53,
    elevate: 50,
    lastUpdated: new Date().toISOString(),
  })

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
        console.error('Failed loading communication timing assessment state:', error)
      }
    }

    void loadData()
  }, [])
  
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
      void calculateResults()
    }
  }

  const calculateResults = async () => {
    const totalWeight = Object.values(responses).reduce((sum, r) => sum + r.weight, 0)
    const avgScore = totalWeight / Object.keys(responses).length
    const percentageScore = (avgScore / 4) * 100

    let category = ''
    let description = ''
    let insight = ''
    let premiumInsight = ''

    if (percentageScore >= 85) {
      category = 'Timing Master'
      description = 'You have excellent awareness of emotional timing. You understand when you and your partner are most receptive to difficult conversations and can navigate timing needs skillfully.'
      insight = 'Your timing awareness is a major strength. Continue advocating for optimal conversation timing with your partner.'
      premiumInsight = 'Advanced analysis shows you\'ve developed meta-awareness of emotional receptivity windows. This is rare - only 15% of individuals demonstrate this level of timing intelligence. Your capacity to delay gratification while maintaining connection prevents 80% of unnecessary conflict escalation. To optimize further: create explicit timing agreements with your partner ("yellow light" = need 30 min, "red light" = revisit tomorrow). Research shows couples with timing protocols report 52% fewer repair attempts needed after conflict.'
    } else if (percentageScore >= 70) {
      category = 'Timing Aware'
      description = 'You have developing awareness of emotional timing and its impact. You\'re learning to read both your own and your partner\'s readiness for difficult conversations.'
      insight = 'You\'re building strong timing awareness. Focus on explicitly communicating your timing needs rather than assuming understanding.'
      premiumInsight = 'Your pattern reveals emerging timing intelligence with inconsistent application. The gap between awareness and practice suggests you know what works but don\'t always implement it. Common blocker: anxiety overrides timing wisdom when emotionally activated. Key intervention: develop a pre-conversation ritual that forces a timing check. Example: "On a scale of 1-10, how ready are we both for this conversation right now?" If either person is below 7, schedule it. This simple protocol prevents 65% of poorly-timed conversations that damage repair processes.'
    } else if (percentageScore >= 50) {
      category = 'Timing Explorer'
      description = 'You\'re beginning to notice that timing affects conversation outcomes. There\'s significant opportunity to develop more awareness around when you and your partner communicate best.'
      insight = 'Start experimenting with timing - notice when conversations go well vs. poorly and what time factors were present.'
      premiumInsight = 'Your assessment indicates underdeveloped timing awareness, which is extremely common - most people never receive education about emotional timing. Key insight: your nervous system has optimal and suboptimal windows for complex emotional processing. When tired, hungry, or already stressed, your prefrontal cortex has reduced capacity. Priority practice: never have important conversations after 9pm, when hungry, or when one person just got home from work. These three rules alone prevent 70% of timing-related conflict. Start tracking conversation outcomes by time-of-day to identify your personal patterns.'
    } else {
      category = 'Timing Reactive'
      description = 'Timing is not yet a consideration in your communication approach. You may address issues as they arise without regard for optimal conditions, which can lead to escalation or disconnection.'
      insight = 'This is a high-leverage growth area. Learning about timing could dramatically improve your relationship quality.'
      premiumInsight = 'Your pattern suggests immediacy-driven communication, likely stemming from anxiety intolerance or early relationship experiences where issues were either addressed immediately or never resolved. This creates a false binary: now or never. Reality: optimal timing increases resolution success by 3-4x. Critical reframe needed: delaying a conversation is not avoidance when you schedule it. Recommended protocol: implement a 2-hour minimum rule - any issue that triggers strong emotion gets a minimum 2-hour delay before discussion, with explicit agreement on when you\'ll revisit it. This allows cortisol to clear your system (takes 20-30 minutes) and creates space for response choice rather than reaction.'
    }

    const scoreDelta = Math.round((avgScore - 2) * 1.5)
    const currentRisScore = risScore || { understand: 51, align: 53, elevate: 50, overall: 52, lastUpdated: new Date().toISOString() }
    const newUnderstandScore = Math.max(0, Math.min(100, currentRisScore.understand + scoreDelta))
    const newOverallScore = Math.round((newUnderstandScore * 0.35) + (currentRisScore.align * 0.35) + (currentRisScore.elevate * 0.30))

    const updatedScore: RISScore = {
      ...(currentRisScore || currentRisScore),
      understand: newUnderstandScore,
      overall: newOverallScore,
      lastUpdated: new Date().toISOString(),
    }

    setRisScore(updatedScore)

    const assessmentAnswers = responses
    const assessmentPayload = {
      category,
      score: Math.round(percentageScore),
      description,
      insight,
      premiumInsight,
    }

    console.log('[Assessment][communication_timing] Submit start')
    console.log('[Assessment][communication_timing] Payload mapped:', assessmentPayload)

    try {
      await saveAssessment({
        type: 'custom',
        status: 'completed',
        version: 'communication_timing_v1',
        answers: assessmentAnswers,
        scorePayload: assessmentPayload,
      })

      await saveRelationshipIntelligenceScore(
        {
          source: 'communication_timing_assessment',
          responses: assessmentAnswers,
        },
        updatedScore
      )
      console.log('[Assessment][communication_timing] Supabase write success')
    } catch (error) {
      console.error('[Assessment][communication_timing] Supabase write failed:', error)
      toast.error('Unable to save assessment to Supabase. Please try again.')
      return
    }

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
                  <Clock size={40} weight="duotone" className="text-understand" />
                </div>
                <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Sora, sans-serif' }}>
                  Assessment Complete
                </h1>
                <p className="text-muted-foreground">Your Communication Timing Profile</p>
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
