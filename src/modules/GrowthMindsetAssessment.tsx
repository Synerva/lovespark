import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Target, Sparkle, CheckCircle } from '@phosphor-icons/react'
const questions = [
    id: 'personal-growth-commitment',

      { value: 'occasional', label: 'I o
      { value: 'core-priority', label
  },
 

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
  {
    question: 'How do you respond to feedback or criticism from your partner?',
    options: [
      { value: 'defensive', label: 'I tend to get defensive and shut down', weight: 1 },
      { value: 'resistant', label: 'I listen but often resist making changes', weight: 2 },
      { value: 'receptive', label: 'I\'m usually receptive and willing to reflect', weight: 3 },
      { value: 'welcoming', label: 'I welcome feedback as an opportunity to grow', weight: 4 },
    ]
    
  {
      { value: 'crisis-only', la
    question: 'How do you view challenges or conflicts in your relationship?',
    options: [
      { value: 'threatening', label: 'As threats to the relationship', weight: 1 },
      { value: 'frustrating', label: 'As frustrating obstacles to overcome', weight: 2 },
      { value: 'learning', label: 'As learning opportunities, though difficult', weight: 3 },
      { value: 'growth', label: 'As valuable growth opportunities we can face together', weight: 4 },
    ]
    
  {
  {
    question: 'How capable do you feel of changing relationship patterns or behaviors?',
    options: [
      { value: 'stuck', label: 'I feel stuck in my patterns', weight: 1 },
      { value: 'difficult', label: 'Change is very difficult for me', weight: 2 },
      { value: 'capable', label: 'I believe I can change with effort', weight: 3 },

    s

   
    } else {
    }

    if (currentQuestionIndex > 0) {
    }

    const totalScore = Object.values(answers).reduce((sum, weight) => sum + weight
    c
    
   
      answers,
    }
    await setA
      growthMindsetAssessment: result,

    toast.success('Assessment completed!')
    if (onComplete) {
    }

   
    if (score >= 55) return { label:
  }
  const getIns
      return [
        'Your openness to feedback and change creates a strong foundation for continuou
        'Continue to maintain this growth-oriented approach while ensuring balance and 
    }
     
    
   
    }
      return [
        'You r
        'Work on increasing your openness to feedback and vulnerability',
    }
      'You may be operating with more fixed mindset patterns',
      'Consider exploring what barriers prevent you from embracing relationship d
    ]

   
    const insights = g
    return (
        <div c
            <ArrowLeft className="mr-2" /> Back to ELEVATE

            initial={{ opacity: 0, y: 20 }}
            className="space-y-6"
     
    
 

                <p className="text-muted-foreground">
                </p>

                <div className="text-center">
                    {result.score}%

                  </Badge>

                  <div className="flex items-start gap-3 mb-4">

                        Key Insights
                      <ul className="space-y-2 text-sm text-
   

                        ))}
                    </div>
                </Card>
            
                    se
     
   

                  </Button>
              </div>
          </motion.div>
     
  }

      <div className="max-w-3xl mx-aut
          <ArrowLeft className="mr-2" /> Back to ELEVATE

          <div className="flex items-center gap-4 mb-4">

            <div>
                Growth Mindse
              <p 
              <
          </di
        </div>
     

            animate={{ opacity: 1, x: 0 }}
            trans
            <Card className="p-8 mb-6 
       

                {curren
                    key={option.value}
    
                     
                  
     
   

                        {answers[currentQues
                        )}
                      <span className="text-sm">{option.label}</span>
                  </button>
              </div>


                  Back
              )}
              
                className="flex-1"
                {currentQuestionIndex === questions.length - 1 ? 'Complete' : 'Next'}
            </div>
        </AnimatePresence>
    </d
}




























































































































































































