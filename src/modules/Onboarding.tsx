import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RISScoreRing } from '@/components/RISScoreRing'
import { Sparkle } from '@phosphor-icons/react'
import type { User, RISScore } from '@/lib/types'
import { calculateRISScore } from '@/lib/ris-calculator'

interface OnboardingProps {
  onComplete: () => void
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState<'welcome' | 'mode' | 'processing' | 'reveal'>('welcome')
  const [, setUser] = useKV<User>('lovespark-user', null as any)
  const [, setRisScore] = useKV<RISScore>('lovespark-ris-score', null as any)

  const handleModeSelect = async (mode: 'individual' | 'couple') => {
    const newUser: User = {
      id: `user-${Date.now()}`,
      name: 'User',
      email: 'user@lovespark.ai',
      mode,
      onboardingCompleted: false,
      createdAt: new Date().toISOString(),
    }
    
    setStep('processing')
    
    setTimeout(() => {
      const initialScore = calculateRISScore({
        emotionalAwareness: 55,
        triggerRecognition: 50,
        attachmentUnderstanding: 52,
        reflectionConsistency: 48,
        communicationQuality: 53,
        expectationClarity: 50,
        emotionalResponsiveness: 51,
        valueAlignment: 54,
        insightApplication: 49,
        habitConsistency: 48,
        conflictRepairSpeed: 50,
        progressOverTime: 50,
      })
      
      setUser({ ...newUser, onboardingCompleted: true })
      setRisScore(initialScore)
      setStep('reveal')
    }, 2500)
  }

  if (step === 'welcome') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6"
        style={{
          background: 'radial-gradient(circle at 50% 0%, oklch(0.65 0.09 195 / 0.1), transparent 70%)'
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl text-center"
        >
          <div className="inline-flex items-center justify-center p-4 bg-secondary/20 rounded-full mb-6">
            <Sparkle size={48} weight="duotone" className="text-secondary" />
          </div>
          <h1 className="text-5xl font-bold mb-4" style={{ fontFamily: 'Sora, sans-serif' }}>
            Welcome to LoveSpark
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Your AI-first Relationship Intelligence Operating System
          </p>
          <Button onClick={() => setStep('mode')} size="lg" className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
            Begin Your Journey
          </Button>
        </motion.div>
      </div>
    )
  }

  if (step === 'mode') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-4xl w-full">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-semibold mb-3" style={{ fontFamily: 'Sora, sans-serif' }}>
              Choose Your Mode
            </h2>
            <p className="text-muted-foreground">
              Select how you'd like to use LoveSpark
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="cursor-pointer hover:shadow-lg transition-all h-full" onClick={() => handleModeSelect('individual')}>
                <CardHeader>
                  <CardTitle>Individual Mode</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Build your relationship intelligence independently. Perfect for personal growth and preparing for future relationships.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="cursor-pointer hover:shadow-lg transition-all h-full" onClick={() => handleModeSelect('couple')}>
                <CardHeader>
                  <CardTitle>Couple Mode</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Collaborate with your partner. Get couple-level insights, alignment scores, and shared growth protocols.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    )
  }

  if (step === 'processing') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="inline-block mb-6"
          >
            <Sparkle size={64} weight="duotone" className="text-accent" />
          </motion.div>
          <h3 className="text-2xl font-semibold mb-2" style={{ fontFamily: 'Sora, sans-serif' }}>
            Analyzing Your Profile
          </h3>
          <p className="text-muted-foreground">
            Generating your initial Relationship Intelligence Score...
          </p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full text-center"
      >
        <h2 className="text-3xl font-semibold mb-8" style={{ fontFamily: 'Sora, sans-serif' }}>
          Your Relationship Intelligence Score
        </h2>
        
        <div className="flex justify-center mb-8">
          <RISScoreRing score={52} />
        </div>

        <p className="text-lg text-muted-foreground mb-8">
          This is your baseline. As you engage with assessments, check-ins, and protocols, your RIS will evolve to reflect your growing relationship intelligence.
        </p>

        <Button onClick={onComplete} size="lg" className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
          Enter Dashboard
        </Button>
      </motion.div>
    </div>
  )
}
