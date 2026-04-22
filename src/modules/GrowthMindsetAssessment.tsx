import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { motion, AnimatePresence } from 'fr
import { useKV } from '@github/spark/hooks'
import type { User, Subscription, RISScore } from '@/lib/types'
import { useKV } from '@github/spark/hooks'
import type { AppView } from '@/App'
import type { User, Subscription, RISScore } from '@/lib/types'

interface GrowthMindsetAssessmentProps {
  onNavigate: (view: AppView) => void
  onComplete?: () => void
}

      { value: 'int
   
      { value: 'reactive', labe
      { value: 'consistent', label: 'Consistently, with regular effort', weight: 4 },
  },
    id: 'feedback-response',
    options: [
      { value: 'difficult', label: 'It\'s hard, but I try to listen', weight: 2 },
      { value: 'grateful', label: 'I\'m grateful for the insight and opportunity to grow', 
    ]
    
  {
      { value: 'negative', label: 
      { value: 'growth', label: 'As essential opportunities for growth', weight: 4 },
  },
    id: 'vulnerability',
    options: [
      { value: 'selective', label: 'Selective, only in safe moments', weight: 2
      { value: 'open', label: 'I embrace vulnerability as connection', weight: 4 },
    ]
    
   
      { value: 'shame', labe
      { value: 'learn', label: 'Own it fully and use it as a learning moment', 
  },
    id: 'partner-growth',
    options: [
      { value: 'open', label: 'I\'m open to it and reflect on the feedback', weight: 3 },
      { value: 'encouraging', label: 'Enthusiastically encouraging', weight: 4 },
    ]
    
  {
      { value: 'aware', l
    question: 'How do you typically view challenges or conflicts in your relationship?',
  },
      { value: 'threat', label: 'As threats to the relationship', weight: 1 },
  const [currentQuestion, setCurrentQuestion] = useState(0)
      { value: 'neutral', label: 'As neutral occurrences that happen', weight: 3 },
    score: number
    ]
    
  {
  const [subscription] =
    overall: 0,
    options: [
    lastUpdated: new Date().toISOString()

  const progress = ((currentQuestion + 1) / questions.length) * 100
  const handleAnswer = (questionId: string, value: string, weight: number) => {
    
    
  {
  }
  const calculateResults = () => {
    const resp
    const percentageScore = (avgScore / 4) * 100
    let category = ''
    let insight = ''

    ]
    
  {
      description = 'You 
      premiumInsight = 'Your pattern shows strong growth orientation with some prot
    options: [
      insight = 'Start small: identify one area where you can experiment with a
    } else {
      description = 'You may be operating primarily from a fixed mindset, which ca
      premiumInsight = 'Your pattern indicates deep-seated beliefs that change is

    
  {
      premiumInsight

    setShowRes
    const currentRisScore = risScore || { understand: 51, align: 53, elevate: 50, ov
    const newOverall = Math.round((currentRisScore.understand + currentRi
    setRisScore((current) => ({
      elevate: newElevateScore,
     
  }
 

  }
  if (showResults && result) {
  const [responses, setResponses] = useState<Record<string, { value: string; weight: number }>>({})
        <div className="max-w-3xl mx-auto">
  const [result, setResult] = useState<{
    score: number
    category: string
    description: string
    insight: string
    premiumInsight: string
  } | null>(null)
  
                </div>
                <Badge variant="secondary" className="text-lg px-4 py-1">
                </Badge>

                <d
             

    lastUpdated: new Date().toISOString()
    

                        <h3 className="font-semibold mb-2 flex items-center gap-2">
                          <Badge variant="secondary" className="tex

                    </div>
                ) : (
    
    if (currentQuestion < questions.length - 1) {
                        <p className="text-s
    } else {
                        
    }
   

                  </div>
    const totalWeight = Object.values(responses).reduce((sum, r) => sum + r.weight, 0)
                  <Button
                    variant="outline"
    const percentageScore = (avgScore / 4) * 100
    
                    o
                  >
                  </
              </div>

      </div>
  }
  const currentQ = questions[currentQuestion]
  return (
      <div className="max-w-3xl mx-auto">
          variant="ghost"
          className="mb-6"
          <ArrowLeft size={20} className="mr-2" />
        </Button>
        <Card className="p-8">
            <div className="flex items-
      category = 'Emerging Growth Mindset'
              <span className="text-sm text-muted-foreground">{Math.round(progress)}% Complete</span>
            <Progress value={progress} className="h-2" />

            
              initial={{ opacity: 0, x: 2
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
              <h2 className="text-2xl font-semibold">
    }

                  <Button
                    variant={responses[cu
               
                  
              

     

                >
                </Button

        </Card>
    </div>
}

    setRisScore((current) => ({

      elevate: newElevateScore,

      lastUpdated: new Date().toISOString()




    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1)
    }
  }

  if (showResults && result) {
    return (
      <div className="min-h-screen bg-background py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="p-8 bg-gradient-to-br from-elevate/5 to-background">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-elevate/10 mb-4">
                  <Target size={40} className="text-elevate" weight="duotone" />
                </div>
                <h1 className="text-3xl font-bold mb-2">Growth Mindset Assessment Complete</h1>
                <Badge variant="secondary" className="text-lg px-4 py-1">
                  Score: {result.score}/100
                </Badge>
              </div>

              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-semibold mb-2 text-elevate">{result.category}</h2>
                  <p className="text-muted-foreground">{result.description}</p>
                </div>

                <div className="bg-card p-6 rounded-lg border">
                  <div className="flex items-start gap-3">
                    <Sparkle size={24} className="text-elevate mt-1" weight="fill" />
                    <div>
                      <h3 className="font-semibold mb-2">Key Insight</h3>
                      <p className="text-sm">{result.insight}</p>
                    </div>
                  </div>
                </div>

                {isPremium ? (
                  <div className="bg-gradient-to-br from-elevate/10 to-primary/5 p-6 rounded-lg border border-elevate/20">
                    <div className="flex items-start gap-3">
                      <Sparkle size={24} className="text-elevate mt-1" weight="fill" />
                      <div>
                        <h3 className="font-semibold mb-2 flex items-center gap-2">
                          Premium Deep-Dive Analysis
                          <Badge variant="secondary" className="text-xs">Premium</Badge>
                        </h3>
                        <p className="text-sm">{result.premiumInsight}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-muted/50 p-6 rounded-lg border border-dashed">
                    <div className="flex items-start gap-3">
                      <Lock size={24} className="text-muted-foreground mt-1" />
                      <div>
                        <h3 className="font-semibold mb-2">Unlock Premium Deep-Dive Analysis</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Get personalized insights into your growth patterns and specific recommendations for your unique situation.
                        </p>
                        <Button 
                          variant="default" 
                          size="sm"
                          onClick={() => onNavigate('pricing')}
                        >
                          Upgrade to Premium
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={() => onNavigate('elevate')}
                    variant="outline"
                    className="flex-1"

                    Back to Elevate

                  <Button
                    onClick={() => onNavigate('dashboard')}
                    className="flex-1"
                  >
                    Go to Dashboard
                  </Button>
                </div>
              </div>

          </motion.div>

      </div>

  }

  const currentQ = questions[currentQuestion]

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => onNavigate('elevate')}
          className="mb-6"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Elevate

        

          <div className="mb-6">

              <span className="text-sm font-medium">

              </span>
              <span className="text-sm text-muted-foreground">{Math.round(progress)}% Complete</span>
            </div>

          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion}

              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-semibold">

              </h2>

              <div className="space-y-3">

                  <Button

                    variant={responses[currentQ.id]?.value === option.value ? "default" : "outline"}
                    className="w-full justify-start text-left h-auto py-4 px-6"
                    onClick={() => handleAnswer(currentQ.id, option.value, option.weight)}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>

              {currentQuestion > 0 && (

                  variant="ghost"

                  className="mt-4"

                  Previous Question
                </Button>

            </motion.div>

        </Card>

    </div>
  )
}
