import { useState } from 'react'
import { Button } from '@/components/ui/but
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Card } from '@/components/ui/card'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Target, Sparkle, Lock } from '@phosphor-icons/react'

  onNavigate: (view: AppView) => voi

const questions = [
    id: 'personal-development',
    options: [
 

  },
  {
    id: 'personal-development',
    question: 'How do you approach learning about relationships and personal development?',
    options: [
      { value: 'avoidant', label: 'I don\'t really engage with it', weight: 1 },
      { value: 'occasional', label: 'I\'m interested and read/listen occasionally', weight: 2 },
      { value: 'interested', label: 'I actively seek out resources and insights', weight: 3 },
      { value: 'regular', label: 'I regularly invest in personal development', weight: 4 },
    q
  },
   
    id: 'relationship-investment',
    question: 'How much time and energy do you actively invest in improving your relationship?',
    options: [
      { value: 'minimal', label: 'Very little, if any', weight: 1 },
      { value: 'reactive', label: 'Only when problems arise', weight: 2 },
      { value: 'periodic', label: 'Periodically, when I remember', weight: 3 },
      { value: 'consistent', label: 'Consistently, with regular effort', weight: 4 },
     
  },
  {
    id: 'feedback-response',
    question: 'How do you respond to feedback or criticism from your partner?',
    options: [
      { value: 'defensive', label: 'I become defensive or dismissive', weight: 1 },
      { value: 'difficult', label: 'It\'s hard, but I try to listen', weight: 2 },
  },
      { value: 'grateful', label: 'I\'m grateful for the insight and opportunity to grow', weight: 4 },
    q
  },
   
    id: 'challenge-view',
    ]
    options: [
    id: 'partner-growth',
      { value: 'negative', label: 'As negative experiences to avoid', weight: 2 },
      { value: 'threatened', label: 'Threatened or uncomfortable', weight: 1 },
      { value: 'growth', label: 'As essential opportunities for growth', weight: 4 },
     
  },
   
    id: 'vulnerability',
    question: 'How comfortable are you with vulnerability in your relationship?',
      { value:
      { value: 'closed', label: 'Very uncomfortable, I keep walls up', weight: 1 },
      { value: 'selective', label: 'Selective, only in safe moments', weight: 2 },
      { value: 'growing', label: 'Getting more comfortable with practice', weight: 3 },
      { value: 'open', label: 'I embrace vulnerability as connection', weight: 4 },
    ]
  },
  c
    id: 'mistake-response',
    question: 'When you make a mistake in your relationship, your typical response is:',
    options: [
      { value: 'blame', label: 'Defend or shift blame', weight: 1 },
      { value: 'shame', label: 'Feel ashamed and withdraw', weight: 2 },
      { value: 'acknowledge', label: 'Acknowledge it and try to do better', weight: 3 },
      { value: 'learn', label: 'Own it fully and use it as a learning moment', weight: 4 },
    c
  },
  }
    id: 'partner-growth',
    question: 'How do you feel about your partner\'s personal growth and changes?',
    setRespons
      { value: 'threatened', label: 'Threatened or uncomfortable', weight: 1 },
      { value: 'uncertain', label: 'Uncertain, worried about growing apart', weight: 2 },
      { value: 'supportive', label: 'Supportive, with some concerns', weight: 3 },
      { value: 'encouraging', label: 'Enthusiastically encouraging', weight: 4 },
    ]
  },

    id: 'fixed-patterns',
    question: 'When you notice unhelpful patterns in your relationship, you:',
    options: [
      { value: 'accept', label: 'Accept them as "just how things are"', weight: 1 },
      { value: 'aware', label: 'Notice them but feel stuck', weight: 2 },
      { value: 'experiment', label: 'Experiment with changing them', weight: 3 },
      { value: 'actively-shift', label: 'Actively work to shift them together', weight: 4 },
    ]
  },
]

export function GrowthMindsetAssessment({ onNavigate, onComplete }: GrowthMindsetAssessmentProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [showResults, setShowResults] = useState(false)
  const [user] = useKV<User>('lovespark-user', null)
  const [subscription] = useKV<Subscription>('lovespark-subscription', null)
  const [risScore, setRisScore] = useKV<RISScore>('lovespark-ris-score', {
    overall: 0,
    understand: 0,
    align: 0,
    elevate: 0,
      insight = 'Growth mindset is a learn
  })
  const [responses, setResponses] = useState<Record<string, { value: string; weight: number }>>({})
      category,
      insight,
    category: string
    description: string
    setResult(asses
    premiumInsight: string
  } | null>(null)

  const isPremium = subscription?.tier === 'premium' || subscription?.tier === 'elite'
  const progress = ((currentQuestion + 1) / questions.length) * 100

  const handleAnswer = (questionId: string, value: string, weight: number) => {
    setResponses((prev) => ({ ...prev, [questionId]: { value, weight } }))
    

      setCurrentQuestion((prev) => prev + 1)
      setCur
      calculateResults()

  }

  const calculateResults = () => {
            initial={{ opacity: 0, y: 20 }}
    const responseCount = Object.keys(responses).length + 1
    const avgScore = totalWeight / responseCount
            <Card className="p-8 bg-gradient-to-
    
    let category = ''
    let description = ''
    let insight = ''
    let premiumInsight = ''

    if (percentageScore >= 85) {
      category = 'Growth-Oriented Mindset'
      description = 'You have a highly developed growth mindset in your relationship. You actively seek opportunities to learn, grow, and evolve together.'
      insight = 'Your commitment to growth is a powerful asset. Continue to model this mindset and invite your partner to grow alongside you.'
      premiumInsight = 'Your pattern shows exceptional openness to growth. The key opportunity is to balance your enthusiasm for growth with acceptance of where you and your partner are in the present moment. Consider: How can you honor the growth journey while also celebrating what already works?'
    } else if (percentageScore >= 65) {
      category = 'Developing Growth Mindset'
      description = 'You have a solid foundation of growth mindset and are actively working to strengthen it. You recognize the value of growth but may face obstacles.'
      insight = 'You\'re on a positive trajectory. Focus on one specific area where you can lean more into growth orientation.'
      premiumInsight = 'Your pattern shows strong growth orientation with some protective habits still active. Notice when you shift into "fixed" thinking - it\'s often a sign of feeling unsafe or uncertain. Creating more emotional safety in those moments will unlock your natural growth orientation.'
    } else if (percentageScore >= 45) {

      description = 'You\'re beginning to develop a growth mindset but may still default to fixed patterns under stress or conflict.'
      insight = 'Start small: identify one area where you can experiment with a more growth-oriented approach this week.'
      premiumInsight = 'Your pattern suggests you intellectually understand growth mindset but emotionally revert to protection under pressure. This is normal. The work is building new neural pathways through repeated practice in low-stakes moments first. What would it look like to practice growth thinking in calm, safe moments?'
    } else {
      category = 'Fixed Mindset Dominant'
      description = 'You may be operating primarily from a fixed mindset, which can create barriers to relationship growth and change.'
      insight = 'Growth mindset is a learnable skill. Begin by noticing one pattern you\'d like to shift and approach it with curiosity.'
      premiumInsight = 'Your pattern indicates deep-seated beliefs that change is threatening or unlikely. This often stems from past experiences where growth felt unsafe or was punished. The invitation is to start very small: can you be curious about one small thing this week? Not to change it, just to be curious about it.'
     

    const assessmentResult = {
      score: Math.round(percentageScore),
      category,
      description,
      insight,
      premiumInsight
    }

    setResult(assessmentResult)
    setShowResults(true)

    const currentRisScore = risScore || { understand: 51, align: 53, elevate: 50, overall: 51, lastUpdated: new Date().toISOString() }
    const newElevateScore = Math.round((currentRisScore.elevate + percentageScore) / 2)
    const newOverall = Math.round((currentRisScore.understand + currentRisScore.align + newElevateScore) / 3)
    
                        <div cl
      ...current,
      overall: newOverall,
                        </div>
                    )}
    }))
  }

  const handleBack = () => {
                  >
                  </Button>
     
   

                    Go to Dash
            
            </Card>
        </div>
    )


    <div className="min-h-screen bg-backgr
        <Bu
        </Button>
        <Card className="p-8">
            <div className="flex items-center justify-between mb-2">
                Question {currentQuestion + 1} of {questions.length}
              <span cl
            <Progress value={progress} className="h-2" />

            <motion.d
              initial={{ opacity: 0, x: 20 }}
              exit={

                {currentQ.question}

                {currentQ.options.map((option) => (
                    key={option.value}
                    className="w-full
                    whil
                    {o


                <Button
                  onClick={handleBack}
                >
                  Previous Questio
              )}
          </AnimatePresence>
      </div>











                      <Sparkle size={18} className="text-elevate" weight="fill" />

























































































































