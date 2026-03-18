import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { RISScoreRing } from '@/components/RISScoreRing'
import { Sparkle, Heart, Target, ChatCircle, Lightning, TrendUp, ArrowRight } from '@phosphor-icons/react'
import type { User, RISScore, OnboardingProfile, AIMessage } from '@/lib/types'
import { calculateRISScore } from '@/lib/ris-calculator'
import { authService } from '@/lib/auth-service'
import { generateOnboardingInsight } from '@/lib/ai-service'

interface OnboardingProps {
  onComplete: () => void
  isRetake?: boolean
}

type OnboardingStep = 
  | 'welcome' 
  | 'relationship-status' 
  | 'relationship-goal' 
  | 'main-challenge' 
  | 'communication-style' 
  | 'conflict-style'
  | 'emotional-awareness'
  | 'processing' 
  | 'insight'
  | 'score-reveal'
  | 'method-map'

interface OnboardingAnswers {
  relationshipStatus?: string
  relationshipGoal?: string
  mainChallenge?: string
  communicationStyle?: string
  conflictStyle?: string
  emotionalAwareness?: string
}

export function Onboarding({ onComplete, isRetake = false }: OnboardingProps) {
  const [step, setStep] = useState<OnboardingStep>('welcome')
  const [answers, setAnswers] = useState<OnboardingAnswers>({})
  const [aiInsight, setAiInsight] = useState<{
    primaryPattern: string
    strengths: string[]
    growthEdge: string
    firstInsight: string
    intelligenceScore: number
  } | null>(null)
  
  const authUser = authService.getSession()
  const userId = authUser?.id || ''
  
  const [, setUser] = useKV<User>(`lovespark-user-${userId}`, null as any)
  const [existingRisScore] = useKV<RISScore>(`lovespark-ris-score-${userId}`, null as any)
  const [, setRisScore] = useKV<RISScore>(`lovespark-ris-score-${userId}`, null as any)
  const [existingProfile] = useKV<OnboardingProfile>(`lovespark-onboarding-profile-${userId}`, null as any)
  const [, setOnboardingProfile] = useKV<OnboardingProfile>(`lovespark-onboarding-profile-${userId}`, null as any)
  const [, setAiMessages] = useKV<AIMessage[]>(`lovespark-ai-messages-${userId}`, [])

  const steps: OnboardingStep[] = ['welcome', 'relationship-status', 'relationship-goal', 'main-challenge', 'communication-style', 'conflict-style', 'emotional-awareness']
  const currentStepIndex = steps.indexOf(step)
  const progress = currentStepIndex >= 0 ? (currentStepIndex / (steps.length - 1)) * 100 : 0

  const updateAnswer = (key: keyof OnboardingAnswers, value: string) => {
    setAnswers(prev => ({ ...prev, [key]: value }))
  }

  const handleNext = () => {
    const currentIndex = steps.indexOf(step)
    if (currentIndex < steps.length - 1) {
      setStep(steps[currentIndex + 1])
    } else {
      processOnboarding()
    }
  }

  const processOnboarding = async () => {
    setStep('processing')
    
    const authUser = authService.getSession()
    
    try {
      const insight = await generateOnboardingInsight({
        relationshipStatus: answers.relationshipStatus || '',
        relationshipGoal: answers.relationshipGoal || '',
        mainChallenge: answers.mainChallenge || '',
        communicationStyle: answers.communicationStyle || '',
        conflictStyle: answers.conflictStyle || '',
        emotionalAwareness: answers.emotionalAwareness || '',
      })
      
      setAiInsight(insight)
      
      const baseScore = insight.intelligenceScore
      const pillarVariation = 5
      
      const initialScore: RISScore = {
        overall: baseScore,
        understand: baseScore + Math.floor(Math.random() * pillarVariation) - 2,
        align: baseScore + Math.floor(Math.random() * pillarVariation) - 2,
        elevate: baseScore + Math.floor(Math.random() * pillarVariation) - 2,
        lastUpdated: new Date().toISOString(),
      }
      
      const messageContent = isRetake 
        ? `## Assessment Updated! 🔄\n\n**Your Updated Relationship Pattern:** ${insight.primaryPattern}\n\n**Key Strengths:**\n${insight.strengths.map(s => `- ${s}`).join('\n')}\n\n**Growth Edge:** ${insight.growthEdge}\n\n**Updated Insight:**\n${insight.firstInsight}\n\n${existingRisScore ? `**Previous Score:** ${existingRisScore.overall} → **New Score:** ${baseScore}\n**Change:** ${baseScore > existingRisScore.overall ? '📈' : baseScore < existingRisScore.overall ? '📉' : '➡️'} ${Math.abs(baseScore - existingRisScore.overall)} points\n\n` : ''}---\n\nYour profile has been refreshed. I'm here to support your continued growth!`
        : `## Welcome to LoveSpark! 🎯\n\n**Your Relationship Pattern:** ${insight.primaryPattern}\n\n**Key Strengths:**\n${insight.strengths.map(s => `- ${s}`).join('\n')}\n\n**Growth Edge:** ${insight.growthEdge}\n\n**First Insight:**\n${insight.firstInsight}\n\n---\n\nI'm here to support your relationship intelligence journey. Feel free to ask me anything about your profile, the LoveSpark method, or how to get started!`
      
      const onboardingMessage: AIMessage = {
        id: `${isRetake ? 'retake' : 'onboarding'}-insight-${Date.now()}`,
        role: 'assistant',
        content: messageContent,
        timestamp: new Date().toISOString(),
        context: {
          risScore: baseScore,
        },
      }
      
      setAiMessages((prev) => [...(prev || []), onboardingMessage])
      
      const onboardingProfile: OnboardingProfile = {
        userId: authUser?.id || `user-${Date.now()}`,
        relationshipStatus: answers.relationshipStatus || '',
        relationshipGoal: answers.relationshipGoal || '',
        mainChallenge: answers.mainChallenge || '',
        communicationStyle: answers.communicationStyle || '',
        conflictStyle: answers.conflictStyle || '',
        emotionalAwareness: answers.emotionalAwareness || '',
        intelligenceScore: insight.intelligenceScore,
        primaryPattern: insight.primaryPattern,
        strengths: insight.strengths,
        growthEdge: insight.growthEdge,
        createdAt: new Date().toISOString(),
      }
      
      setOnboardingProfile(onboardingProfile)
      setRisScore(initialScore)
      
      setTimeout(() => {
        setStep('insight')
      }, 2000)
      
    } catch (error) {
      console.error('Error processing onboarding:', error)
      
      const fallbackInsight = {
        primaryPattern: 'Intentional Builder',
        strengths: ['Strong commitment to growth', 'Reflective self-awareness', 'Willingness to engage deeply'],
        growthEdge: 'Translating awareness into consistent action',
        firstInsight: 'Your engagement with this assessment shows intentionality—a core predictor of relationship success.',
        intelligenceScore: 65,
      }
      
      setAiInsight(fallbackInsight)
      setTimeout(() => setStep('insight'), 2000)
    }
  }

  const completeOnboarding = () => {
    const authUser = authService.getSession()
    
    setUser(prev => ({
      ...prev!,
      id: prev?.id || authUser?.id || `user-${Date.now()}`,
      name: prev?.name || authUser?.name || 'User',
      email: prev?.email || authUser?.email || 'user@lovespark.ai',
      mode: 'individual',
      onboardingCompleted: true,
      createdAt: prev?.createdAt || authUser?.createdAt || new Date().toISOString(),
    }))
    
    onComplete()
  }

  const skipOnboarding = () => {
    const authUser = authService.getSession()
    
    setUser(prev => ({
      ...prev!,
      id: prev?.id || authUser?.id || `user-${Date.now()}`,
      name: prev?.name || authUser?.name || 'User',
      email: prev?.email || authUser?.email || 'user@lovespark.ai',
      mode: 'individual',
      onboardingCompleted: true,
      createdAt: prev?.createdAt || authUser?.createdAt || new Date().toISOString(),
    }))
    
    onComplete()
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
            {isRetake ? 'Update Your Profile' : 'Welcome to LoveSpark'}
          </h1>
          <p className="text-xl text-muted-foreground mb-4">
            {isRetake 
              ? 'Refresh your relationship intelligence profile' 
              : 'Your AI-first Relationship Intelligence Operating System'}
          </p>
          <p className="text-base text-muted-foreground mb-8 max-w-lg mx-auto">
            {isRetake
              ? "Let's update your profile with your current relationship state and generate fresh insights based on where you are now."
              : "In the next few minutes, we'll build your relationship intelligence profile and generate your first AI-powered insights."}
          </p>
          {isRetake && existingProfile && (
            <div className="bg-muted/50 rounded-lg p-4 mb-6 text-sm text-left max-w-md mx-auto">
              <p className="font-medium mb-2">Current Profile:</p>
              <p className="text-muted-foreground">Pattern: {existingProfile.primaryPattern}</p>
              <p className="text-muted-foreground">Score: {existingProfile.intelligenceScore}</p>
              <p className="text-muted-foreground text-xs mt-2">
                Last updated: {new Date(existingProfile.createdAt).toLocaleDateString()}
              </p>
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={() => setStep('relationship-status')} size="lg" className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
              {isRetake ? 'Update Assessment' : 'Begin Assessment'}
              <ArrowRight className="ml-2" size={20} />
            </Button>
            <Button onClick={skipOnboarding} size="lg" variant="outline">
              Skip for Now
            </Button>
          </div>
        </motion.div>
      </div>
    )
  }

  if (step === 'relationship-status') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-2xl w-full">
          <Progress value={progress} className="mb-8" />
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <Heart size={28} weight="duotone" className="text-accent" />
                  <CardTitle>What's your current relationship status?</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <RadioGroup value={answers.relationshipStatus} onValueChange={(value) => updateAnswer('relationshipStatus', value)}>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted cursor-pointer">
                      <RadioGroupItem value="single" id="single" />
                      <Label htmlFor="single" className="cursor-pointer flex-1">Single and working on myself</Label>
                    </div>
                    <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted cursor-pointer">
                      <RadioGroupItem value="dating" id="dating" />
                      <Label htmlFor="dating" className="cursor-pointer flex-1">Dating or exploring</Label>
                    </div>
                    <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted cursor-pointer">
                      <RadioGroupItem value="relationship-early" id="relationship-early" />
                      <Label htmlFor="relationship-early" className="cursor-pointer flex-1">In a relationship (less than 2 years)</Label>
                    </div>
                    <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted cursor-pointer">
                      <RadioGroupItem value="relationship-established" id="relationship-established" />
                      <Label htmlFor="relationship-established" className="cursor-pointer flex-1">In an established relationship (2+ years)</Label>
                    </div>
                    <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted cursor-pointer">
                      <RadioGroupItem value="married" id="married" />
                      <Label htmlFor="married" className="cursor-pointer flex-1">Married or life-partnered</Label>
                    </div>
                    <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted cursor-pointer">
                      <RadioGroupItem value="complicated" id="complicated" />
                      <Label htmlFor="complicated" className="cursor-pointer flex-1">It's complicated</Label>
                    </div>
                  </div>
                </RadioGroup>

                <div className="flex justify-between items-center mt-6">
                  <Button onClick={skipOnboarding} variant="ghost">
                    Skip Survey
                  </Button>
                  {answers.relationshipStatus && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <Button onClick={handleNext}>
                        Continue
                        <ArrowRight className="ml-2" size={20} />
                      </Button>
                    </motion.div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    )
  }

  if (step === 'relationship-goal') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-2xl w-full">
          <Progress value={progress} className="mb-8" />
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <Target size={28} weight="duotone" className="text-secondary" />
                  <CardTitle>What's your primary relationship goal?</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <RadioGroup value={answers.relationshipGoal} onValueChange={(value) => updateAnswer('relationshipGoal', value)}>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted cursor-pointer">
                      <RadioGroupItem value="understand-myself" id="understand-myself" />
                      <Label htmlFor="understand-myself" className="cursor-pointer flex-1">Understand my patterns better</Label>
                    </div>
                    <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted cursor-pointer">
                      <RadioGroupItem value="improve-communication" id="improve-communication" />
                      <Label htmlFor="improve-communication" className="cursor-pointer flex-1">Improve communication with my partner</Label>
                    </div>
                    <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted cursor-pointer">
                      <RadioGroupItem value="resolve-conflict" id="resolve-conflict" />
                      <Label htmlFor="resolve-conflict" className="cursor-pointer flex-1">Navigate conflict more effectively</Label>
                    </div>
                    <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted cursor-pointer">
                      <RadioGroupItem value="deepen-connection" id="deepen-connection" />
                      <Label htmlFor="deepen-connection" className="cursor-pointer flex-1">Deepen emotional connection</Label>
                    </div>
                    <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted cursor-pointer">
                      <RadioGroupItem value="prepare-future" id="prepare-future" />
                      <Label htmlFor="prepare-future" className="cursor-pointer flex-1">Prepare for a future relationship</Label>
                    </div>
                    <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted cursor-pointer">
                      <RadioGroupItem value="maintain-health" id="maintain-health" />
                      <Label htmlFor="maintain-health" className="cursor-pointer flex-1">Maintain a healthy relationship</Label>
                    </div>
                  </div>
                </RadioGroup>

                <div className="flex justify-between items-center mt-6">
                  <Button onClick={skipOnboarding} variant="ghost">
                    Skip Survey
                  </Button>
                  {answers.relationshipGoal && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <Button onClick={handleNext}>
                        Continue
                        <ArrowRight className="ml-2" size={20} />
                      </Button>
                    </motion.div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    )
  }

  if (step === 'main-challenge') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-2xl w-full">
          <Progress value={progress} className="mb-8" />
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <Lightning size={28} weight="duotone" className="text-accent" />
                  <CardTitle>What's your biggest relationship challenge?</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <RadioGroup value={answers.mainChallenge} onValueChange={(value) => updateAnswer('mainChallenge', value)}>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted cursor-pointer">
                      <RadioGroupItem value="expressing-feelings" id="expressing-feelings" />
                      <Label htmlFor="expressing-feelings" className="cursor-pointer flex-1">Expressing my feelings clearly</Label>
                    </div>
                    <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted cursor-pointer">
                      <RadioGroupItem value="understanding-partner" id="understanding-partner" />
                      <Label htmlFor="understanding-partner" className="cursor-pointer flex-1">Understanding my partner's perspective</Label>
                    </div>
                    <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted cursor-pointer">
                      <RadioGroupItem value="managing-conflict" id="managing-conflict" />
                      <Label htmlFor="managing-conflict" className="cursor-pointer flex-1">Managing conflict without escalation</Label>
                    </div>
                    <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted cursor-pointer">
                      <RadioGroupItem value="trust-issues" id="trust-issues" />
                      <Label htmlFor="trust-issues" className="cursor-pointer flex-1">Building or rebuilding trust</Label>
                    </div>
                    <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted cursor-pointer">
                      <RadioGroupItem value="intimacy" id="intimacy" />
                      <Label htmlFor="intimacy" className="cursor-pointer flex-1">Maintaining emotional or physical intimacy</Label>
                    </div>
                    <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted cursor-pointer">
                      <RadioGroupItem value="past-patterns" id="past-patterns" />
                      <Label htmlFor="past-patterns" className="cursor-pointer flex-1">Breaking old relationship patterns</Label>
                    </div>
                  </div>
                </RadioGroup>

                <div className="flex justify-between items-center mt-6">
                  <Button onClick={skipOnboarding} variant="ghost">
                    Skip Survey
                  </Button>
                  {answers.mainChallenge && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <Button onClick={handleNext}>
                        Continue
                        <ArrowRight className="ml-2" size={20} />
                      </Button>
                    </motion.div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    )
  }

  if (step === 'communication-style') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-2xl w-full">
          <Progress value={progress} className="mb-8" />
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <ChatCircle size={28} weight="duotone" className="text-secondary" />
                  <CardTitle>How would you describe your communication style?</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <RadioGroup value={answers.communicationStyle} onValueChange={(value) => updateAnswer('communicationStyle', value)}>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted cursor-pointer">
                      <RadioGroupItem value="direct" id="direct" />
                      <Label htmlFor="direct" className="cursor-pointer flex-1">Direct and straightforward</Label>
                    </div>
                    <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted cursor-pointer">
                      <RadioGroupItem value="thoughtful" id="thoughtful" />
                      <Label htmlFor="thoughtful" className="cursor-pointer flex-1">Thoughtful and measured</Label>
                    </div>
                    <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted cursor-pointer">
                      <RadioGroupItem value="emotional" id="emotional" />
                      <Label htmlFor="emotional" className="cursor-pointer flex-1">Emotional and expressive</Label>
                    </div>
                    <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted cursor-pointer">
                      <RadioGroupItem value="reserved" id="reserved" />
                      <Label htmlFor="reserved" className="cursor-pointer flex-1">Reserved and private</Label>
                    </div>
                    <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted cursor-pointer">
                      <RadioGroupItem value="analytical" id="analytical" />
                      <Label htmlFor="analytical" className="cursor-pointer flex-1">Analytical and logical</Label>
                    </div>
                    <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted cursor-pointer">
                      <RadioGroupItem value="adaptive" id="adaptive" />
                      <Label htmlFor="adaptive" className="cursor-pointer flex-1">Adaptive to the situation</Label>
                    </div>
                  </div>
                </RadioGroup>

                <div className="flex justify-between items-center mt-6">
                  <Button onClick={skipOnboarding} variant="ghost">
                    Skip Survey
                  </Button>
                  {answers.communicationStyle && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <Button onClick={handleNext}>
                        Continue
                        <ArrowRight className="ml-2" size={20} />
                      </Button>
                    </motion.div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    )
  }

  if (step === 'conflict-style') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-2xl w-full">
          <Progress value={progress} className="mb-8" />
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <Lightning size={28} weight="duotone" className="text-accent" />
                  <CardTitle>When conflict arises, you typically...</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <RadioGroup value={answers.conflictStyle} onValueChange={(value) => updateAnswer('conflictStyle', value)}>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted cursor-pointer">
                      <RadioGroupItem value="address-immediately" id="address-immediately" />
                      <Label htmlFor="address-immediately" className="cursor-pointer flex-1">Address it immediately and directly</Label>
                    </div>
                    <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted cursor-pointer">
                      <RadioGroupItem value="process-first" id="process-first" />
                      <Label htmlFor="process-first" className="cursor-pointer flex-1">Need time to process before discussing</Label>
                    </div>
                    <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted cursor-pointer">
                      <RadioGroupItem value="avoid" id="avoid" />
                      <Label htmlFor="avoid" className="cursor-pointer flex-1">Tend to avoid or minimize it</Label>
                    </div>
                    <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted cursor-pointer">
                      <RadioGroupItem value="seek-resolution" id="seek-resolution" />
                      <Label htmlFor="seek-resolution" className="cursor-pointer flex-1">Focus on finding solutions quickly</Label>
                    </div>
                    <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted cursor-pointer">
                      <RadioGroupItem value="emotional-first" id="emotional-first" />
                      <Label htmlFor="emotional-first" className="cursor-pointer flex-1">Express emotions before problem-solving</Label>
                    </div>
                    <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted cursor-pointer">
                      <RadioGroupItem value="shutdown" id="shutdown" />
                      <Label htmlFor="shutdown" className="cursor-pointer flex-1">Tend to shut down or withdraw</Label>
                    </div>
                  </div>
                </RadioGroup>

                <div className="flex justify-between items-center mt-6">
                  <Button onClick={skipOnboarding} variant="ghost">
                    Skip Survey
                  </Button>
                  {answers.conflictStyle && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <Button onClick={handleNext}>
                        Continue
                        <ArrowRight className="ml-2" size={20} />
                      </Button>
                    </motion.div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    )
  }

  if (step === 'emotional-awareness') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-2xl w-full">
          <Progress value={progress} className="mb-8" />
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <Heart size={28} weight="duotone" className="text-secondary" />
                  <CardTitle>How aware are you of your emotional patterns?</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <RadioGroup value={answers.emotionalAwareness} onValueChange={(value) => updateAnswer('emotionalAwareness', value)}>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted cursor-pointer">
                      <RadioGroupItem value="very-aware" id="very-aware" />
                      <Label htmlFor="very-aware" className="cursor-pointer flex-1">Very aware - I track my patterns closely</Label>
                    </div>
                    <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted cursor-pointer">
                      <RadioGroupItem value="mostly-aware" id="mostly-aware" />
                      <Label htmlFor="mostly-aware" className="cursor-pointer flex-1">Mostly aware - I recognize them in reflection</Label>
                    </div>
                    <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted cursor-pointer">
                      <RadioGroupItem value="somewhat-aware" id="somewhat-aware" />
                      <Label htmlFor="somewhat-aware" className="cursor-pointer flex-1">Somewhat aware - I'm learning to notice</Label>
                    </div>
                    <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted cursor-pointer">
                      <RadioGroupItem value="not-very-aware" id="not-very-aware" />
                      <Label htmlFor="not-very-aware" className="cursor-pointer flex-1">Not very aware - It's hard to identify patterns</Label>
                    </div>
                    <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted cursor-pointer">
                      <RadioGroupItem value="exploring" id="exploring" />
                      <Label htmlFor="exploring" className="cursor-pointer flex-1">Just starting to explore emotional awareness</Label>
                    </div>
                  </div>
                </RadioGroup>

                <div className="flex justify-between items-center mt-6">
                  <Button onClick={skipOnboarding} variant="ghost">
                    Skip Survey
                  </Button>
                  {answers.emotionalAwareness && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <Button onClick={handleNext}>
                        Generate My Profile
                        <Sparkle className="ml-2" size={20} />
                      </Button>
                    </motion.div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
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
            Generating your Relationship Intelligence insights...
          </p>
        </motion.div>
      </div>
    )
  }

  if (step === 'insight' && aiInsight) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl w-full"
        >
          <Card>
            <CardHeader className="text-center pb-4">
              <div className="inline-flex items-center justify-center p-4 bg-accent/20 rounded-full mb-4 mx-auto">
                <Sparkle size={40} weight="duotone" className="text-accent" />
              </div>
              <CardTitle className="text-3xl mb-2">Your Relationship Pattern</CardTitle>
              <p className="text-2xl font-semibold text-accent" style={{ fontFamily: 'Sora, sans-serif' }}>
                {aiInsight.primaryPattern}
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <TrendUp size={20} className="text-secondary" />
                  Your Key Strengths
                </h4>
                <ul className="space-y-2">
                  {aiInsight.strengths.map((strength, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-2"
                    >
                      <span className="text-secondary">•</span>
                      <span>{strength}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Target size={20} className="text-accent" />
                  Growth Edge
                </h4>
                <p className="text-muted-foreground">{aiInsight.growthEdge}</p>
              </div>

              <div className="bg-muted/50 rounded-lg p-4">
                <h4 className="font-semibold mb-2">First Insight</h4>
                <p className="text-sm">{aiInsight.firstInsight}</p>
              </div>

              <div className="flex justify-center pt-4">
                <Button onClick={() => setStep('score-reveal')} size="lg">
                  Reveal My Intelligence Score
                  <ArrowRight className="ml-2" size={20} />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  if (step === 'score-reveal' && aiInsight) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl w-full"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-semibold mb-2" style={{ fontFamily: 'Sora, sans-serif' }}>
              Your Relationship Intelligence Score™
            </h2>
            <p className="text-muted-foreground">
              Your personalized baseline for growth
            </p>
          </div>
          
          <div className="flex justify-center mb-8">
            <RISScoreRing score={aiInsight.intelligenceScore} />
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Your Profile Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-1">Primary Pattern</h4>
                <p className="text-muted-foreground">{aiInsight.primaryPattern}</p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-1">Strength</h4>
                <p className="text-muted-foreground">{aiInsight.strengths[0]}</p>
              </div>

              <div>
                <h4 className="font-semibold mb-1">Growth Edge</h4>
                <p className="text-muted-foreground">{aiInsight.growthEdge}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="relative mb-6 overflow-hidden">
            <div className="absolute inset-0 backdrop-blur-sm bg-background/80 z-10 flex items-center justify-center">
              <div className="text-center p-6">
                <Sparkle size={32} weight="fill" className="text-primary mx-auto mb-3" />
                <h4 className="font-semibold mb-2">Unlock Full Profile</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Get complete insights, pattern analysis, and personalized recommendations
                </p>
                <Button 
                  onClick={() => setStep('method-map')}
                  className="bg-gradient-to-r from-primary via-secondary to-align"
                >
                  Unlock Full Profile
                </Button>
              </div>
            </div>
            <CardHeader>
              <CardTitle className="text-lg">Advanced Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="h-16 bg-muted rounded"></div>
              <div className="h-16 bg-muted rounded"></div>
              <div className="h-16 bg-muted rounded"></div>
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={() => setStep('method-map')} size="lg" variant="outline">
              Continue to Dashboard
              <ArrowRight className="ml-2" size={20} />
            </Button>
            <Button 
              onClick={() => {
                setStep('method-map')
              }}
              size="lg"
              variant="ghost"
            >
              Work with a Coach
            </Button>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-6">
            This is your starting point. As you engage with assessments and check-ins, your RIS will evolve.
          </p>
        </motion.div>
      </div>
    )
  }

  if (step === 'method-map') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl w-full"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold mb-3" style={{ fontFamily: 'Sora, sans-serif' }}>
              The LoveSpark Method
            </h2>
            <p className="text-muted-foreground">
              Three interconnected pillars for relationship intelligence
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="h-full">
                <CardHeader>
                  <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center mb-3">
                    <Heart size={24} weight="duotone" className="text-accent" />
                  </div>
                  <CardTitle>UNDERSTAND</CardTitle>
                  <CardDescription>
                    Build self-awareness of your emotional patterns, triggers, and attachment style
                  </CardDescription>
                </CardHeader>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="h-full ring-2 ring-secondary">
                <CardHeader>
                  <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center mb-3">
                    <ChatCircle size={24} weight="duotone" className="text-secondary" />
                  </div>
                  <CardTitle>ALIGN</CardTitle>
                  <CardDescription>
                    Improve communication, clarify expectations, and build connection with your partner
                  </CardDescription>
                </CardHeader>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="h-full">
                <CardHeader>
                  <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center mb-3">
                    <TrendUp size={24} weight="duotone" className="text-accent" />
                  </div>
                  <CardTitle>ELEVATE</CardTitle>
                  <CardDescription>
                    Apply insights through consistent habits and track your relationship growth
                  </CardDescription>
                </CardHeader>
              </Card>
            </motion.div>
          </div>

          <div className="text-center">
            <p className="text-muted-foreground mb-6">
              You'll start by building your UNDERSTAND foundation through assessments and weekly check-ins
            </p>
            <Button onClick={completeOnboarding} size="lg" className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
              Enter Dashboard
              <ArrowRight className="ml-2" size={20} />
            </Button>
          </div>
        </motion.div>
      </div>
    )
  }

  return null
}
