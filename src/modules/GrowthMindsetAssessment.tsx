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
    id: 'personal-growth',
    question: 'How much do you prioritize personal growth in your life?',
    options: [
      { value: 'minimal', label: 'Not much, I don\'t focus on it', weight: 1 },
      { value: 'occasional', label: 'Occasionally, when I think about it', weight: 2 },
      { value: 'regular', label: 'I regularly invest in personal development', weight: 3 },
      { value: 'priority', label: 'It\'s a top priority in my life', weight: 4 },
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
    id: 'feedback-response',
    question: 'How do you respond to feedback or criticism from your partner?',
    options: [
      { value: 'defensive', label: 'I tend to get defensive and shut down', weight: 1 },
      { value: 'resistant', label: 'I listen but often resist making changes', weight: 2 },
      { value: 'receptive', label: 'I\'m usually receptive and willing to reflect', weight: 3 },
      { value: 'welcoming', label: 'I welcome feedback as an opportunity to grow', weight: 4 },
    ]
  },
  {
    id: 'challenge-view',
    question: 'How do you view challenges or conflicts in your relationship?',
    options: [
      { value: 'threatening', label: 'As threats to the relationship', weight: 1 },
      { value: 'frustrating', label: 'As frustrating obstacles to overcome', weight: 2 },
      { value: 'learning', label: 'As learning opportunities, though difficult', weight: 3 },
      { value: 'growth', label: 'As valuable growth opportunities we can face together', weight: 4 },
    ]
  },
  {
    id: 'change-capability',
    question: 'How capable do you feel of changing relationship patterns or behaviors?',
    options: [
      { value: 'stuck', label: 'I feel stuck in my patterns', weight: 1 },
      { value: 'difficult', label: 'Change is very difficult for me', weight: 2 },
      { value: 'capable', label: 'I believe I can change with effort', weight: 3 },
      { value: 'confident', label: 'I\'m confident in my ability to evolve and grow', weight: 4 },
    ]
  },
  {
    id: 'learning-approach',
    question: 'How do you approach learning about relationships and personal development?',
    options: [
      { value: 'avoidant', label: 'I don\'t really engage with it', weight: 1 },
      { value: 'crisis-only', label: 'Only when there\'s a problem', weight: 2 },
      { value: 'interested', label: 'I\'m interested and read/listen occasionally', weight: 3 },
      { value: 'active', label: 'I actively seek out resources and apply what I learn', weight: 4 },
    ]
  },
  {
    id: 'failure-response',
    question: 'When you make a mistake or "fail" in your relationship, how do you respond?',
    options: [
      { value: 'shame', label: 'I feel ashamed and avoid thinking about it', weight: 1 },
      { value: 'blame', label: 'I tend to blame circumstances or my partner', weight: 2 },
      { value: 'acknowledge', label: 'I acknowledge it and try to do better', weight: 3 },
      { value: 'learn', label: 'I analyze what happened and actively learn from it', weight: 4 },
    ]
  },
  {
    id: 'vulnerability',
    question: 'How comfortable are you with vulnerability in your relationship?',
    options: [
      { value: 'closed', label: 'Very uncomfortable, I keep walls up', weight: 1 },
      { value: 'selective', label: 'Somewhat uncomfortable, I\'m selective about sharing', weight: 2 },
      { value: 'growing', label: 'Getting more comfortable with practice', weight: 3 },
      { value: 'open', label: 'Comfortable being open and vulnerable', weight: 4 },
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
      category = 'Growth-Oriented Leader'
      description = 'You demonstrate a strong growth mindset and actively invest in your personal and relational development. You view challenges as opportunities and embrace vulnerability as a path to connection.'
      insight = 'Your commitment to growth is a powerful asset. Continue to model this mindset and invite your partner into the journey with you.'
      premiumInsight = 'Your assessment reveals an advanced growth orientation that creates a powerful flywheel effect in your relationship. Your willingness to learn, adapt, and be vulnerable creates psychological safety that allows your partner to do the same. Research shows that when one partner consistently demonstrates growth mindset, the other partner\'s growth mindset increases by an average of 23% over 6 months. Your leadership here is transformative. To optimize: focus on making your learning process visible to your partner and creating shared growth rituals.'
    } else if (percentageScore >= 70) {
      category = 'Active Learner'
      description = 'You have a solid foundation of growth mindset and are actively working on your development. You\'re open to feedback and see value in continuous improvement.'
      insight = 'You\'re building strong growth habits. Focus on consistency and bringing your partner along on the journey.'
      premiumInsight = 'Your pattern shows strong growth orientation with some protective barriers still in place. You\'re willing to grow, but may still experience resistance when growth feels threatening to your identity or requires deep vulnerability. The key leverage point is distinguishing between "growth as achievement" (which can become another form of performance pressure) and "growth as unfolding" (which is more sustainable and authentic). Practice self-compassion during setbacks - research shows self-compassion actually increases motivation and resilience more than self-criticism.'
    } else if (percentageScore >= 50) {
      category = 'Emerging Growth Mindset'
      description = 'You\'re beginning to develop a growth orientation, though you may still default to fixed mindset thinking in challenging moments. There\'s significant opportunity to strengthen your growth capacity.'
      insight = 'Start small: identify one area where you can experiment with a more growth-oriented approach. Notice the results.'
      premiumInsight = 'Your assessment indicates you\'re in transition between fixed and growth mindset patterns. You understand growth mindset intellectually but haven\'t fully internalized it emotionally yet. This is actually a powerful position - awareness is the first step. The most effective intervention at this stage is to work with your self-talk. Notice when you use fixed language ("I\'m just not good at that") and practice reframing ("I haven\'t developed that skill yet"). The word "yet" is powerful. Also, focus on process over outcome - celebrate effort and learning, not just results.'
    } else {
      category = 'Fixed Mindset Patterns'
      description = 'You tend to operate from a more fixed mindset, which may limit your capacity for growth and adaptation in relationships. Building growth mindset would significantly enhance your relationship quality.'
      insight = 'This is a powerful growth opportunity. Consider exploring what beliefs or fears may be keeping you from embracing change and vulnerability.'
      premiumInsight = 'Your pattern suggests deeply embedded fixed mindset beliefs that likely developed as protective mechanisms. Fixed mindset isn\'t a character flaw - it\'s often a response to environments where mistakes were punished or where love and acceptance were conditional on performance. The path forward isn\'t to force yourself to change, but to understand and have compassion for these protective patterns while gently experimenting with new approaches. Recommended focus: work with a therapist or coach to explore the origins of these patterns. Also, start with low-stakes growth experiments outside the relationship context to build confidence and new neural pathways.'
    }

    const scoreDelta = Math.round((avgScore - 2) * 2)
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
