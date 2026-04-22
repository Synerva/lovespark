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
   
      { value: 'minimal', 
      { value: 'regular', label: 'I regularly invest in personal developm
    ]
  {
    question: 'How much time and energy do you actively invest in improving your relati
      { value: 'reactive', label: 'Only when problems arise', weight: 1 },
      { value: 'consistent', label: 'Consistently, with regular effort', weight: 
    ]
  {
   
      { value: 'defensive', label:
      { value: 'receptive', label: 'I\'m usually receptive and willing to reflect', weight: 3 },
    ]
  {
    question: 'How do you view challenges or conflicts in your relationship?',
      { value: 'threatening', label: 'As threats to the relationship', weight: 1 },
      { value: 'learning', label: 'As learning opportunities, though difficult', weight: 3 },
    ]
    
  {
    id: 'feedback-response',
    question: 'How do you respond to feedback or criticism from your partner?',
    options: [
  {
    question: 'How do you approach learning about relationships and personal development?',
      { value: 'avoidant', label: 'I don\'t really engage with it', weight: 1 },
      { value: 'interested', label: 'I\'m interested and read/listen occasionally', weight: 3 }
    ]
    
  {
    id: 'challenge-view',
    question: 'How do you view challenges or conflicts in your relationship?',
    options: [
  {
    question: 'How comfortable are you with vulnerability in your relationship?',
      { value: 'closed', label: 'Very uncomfortable, I keep walls up', weight: 1 },
      { value: 'growing', label: 'Getting more comfortable with practice', weight: 3 },
expor
  co
   
    align: 53,
    lastUpdated: new Date().toISOString(),
  
  const [responses, setResponses] = useState<Record<string, { value: strin
  const [result, setResult] = useState<{
    score: number
    insight: string
  } |
  co

    setResponses((prev) => (
    if (currentQuestion < questions.length - 1) {
    } else {
    }

    const totalWeight = Object.values(responses).reduce((sum, r) => sum + r.weight, 0)
    const percentageScore = (avgScore / 4) * 100
    l
    

      category = 'Growth-Or
      insight = 'Your commitment to growth is a powerful asset. Continue to model this minds
    } else if 
      description = 'You have a solid foundation of growth mindset and are actively worki
      premiumInsight = 'Your pattern shows strong growth orientation with some protective 
      category = 'Emerging Growth Mindset'
      insight = 'Start small: identify one area where you can experiment with a more growth-orien
    }
    
   

    const currentRisScore = risScore || { understand: 51, align: 53, elevate: 50,
    const newO
    setRisScore((current) => ({
      elevate: newElevateScore,
      lastUpdated: new Date().toISOString()

    s

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
