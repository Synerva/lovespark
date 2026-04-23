import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RISScoreRing } from '@/components/RISScoreRing'
import { PillarProgressBar } from '@/components/PillarProgressBar'
import { WeeklyInsightCard } from '@/components/WeeklyInsightCard'
import { MicroActionTracker } from '@/components/MicroActionTracker'
import { PatternAlert } from '@/components/PatternAlert'
import { Brain, UsersThree, TrendUp, ArrowRight, ChartLine, Sparkle, ChatCircleDots } from '@phosphor-icons/react'
import type { AppView } from '../App'
import type { RISScore, User, Subscription, ScoreHistory, WeeklyInsight, RecurringPattern, AIMessage } from '@/lib/types'
import { FeatureGateService } from '@/lib/feature-gate-service'
import { ProgressService } from '@/lib/progress-service'
import { authService } from '@/lib/auth-service'
import { getOrCreateProfile } from '@/lib/db/profiles'
import { loadLatestRISScore } from '@/lib/db/assessments'
import { getCurrentSubscription } from '@/lib/db/subscriptions'
import { loadChatHistory } from '@/lib/db/ai'
import { getStateSnapshot, upsertStateSnapshot } from '@/lib/db/state-snapshots'

interface DashboardProps {
  onNavigate: (view: AppView) => void
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const [user, setUser] = useState<User | null>(null)
  const [risScore, setRisScore] = useState<RISScore>({
    overall: 52,
    understand: 51,
    align: 53,
    elevate: 50,
    lastUpdated: new Date().toISOString(),
  })
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [weeklyMessageCount, setWeeklyMessageCount] = useState(0)
  const [scoreHistory, setScoreHistory] = useState<ScoreHistory[]>([])
  const [weeklyInsights, setWeeklyInsights] = useState<WeeklyInsight[]>([])
  const [recurringPatterns, setRecurringPatterns] = useState<RecurringPattern[]>([])
  const [aiMessages, setAiMessages] = useState<AIMessage[]>([])

  useEffect(() => {
    const loadData = async () => {
      const session = authService.getSession()
      if (!session) {
        return
      }

      try {
        const [profile, dbRis, currentSubscription, history, weeklyCount, scoreHistorySnapshot, weeklyInsightsSnapshot, recurringPatternsSnapshot] = await Promise.all([
          getOrCreateProfile({ name: session.name, email: session.email, avatarUrl: session.avatarUrl }),
          loadLatestRISScore(),
          getCurrentSubscription(),
          loadChatHistory(),
          getStateSnapshot<number>('weekly_message_count'),
          getStateSnapshot<ScoreHistory[]>('score_history'),
          getStateSnapshot<WeeklyInsight[]>('weekly_insights'),
          getStateSnapshot<RecurringPattern[]>('recurring_patterns'),
        ])

        setUser({
          id: profile.id,
          name: profile.full_name || session.name,
          email: profile.email || session.email,
          avatarUrl: profile.avatar_url || session.avatarUrl,
          mode: 'individual',
          onboardingCompleted: profile.onboarding_completed,
          createdAt: profile.created_at,
        })
        if (dbRis) {
          setRisScore(dbRis)
        }
        setSubscription(currentSubscription)
        setAiMessages(history.messages)
        setWeeklyMessageCount(weeklyCount ?? 0)
        setScoreHistory(scoreHistorySnapshot ?? [])
        setWeeklyInsights(weeklyInsightsSnapshot ?? [])
        setRecurringPatterns(recurringPatternsSnapshot ?? [])
      } catch (error) {
        console.error('Failed loading dashboard data from Supabase:', error)
      }
    }

    void loadData()
  }, [])
  
  const isPremium = subscription && subscription.status === 'active' && subscription.planName !== 'FREE'
  const remainingMessages = FeatureGateService.getRemainingAIMessages(subscription ?? null, weeklyMessageCount ?? 0)

  const currentRisScore = risScore || {
    overall: 52,
    understand: 51,
    align: 53,
    elevate: 50,
    lastUpdated: new Date().toISOString(),
  }

  const weekNumber = ProgressService.getCurrentWeekNumber()
  const currentStage = ProgressService.determineUserStage(currentRisScore)

  const currentWeekInsight = (weeklyInsights || []).find(i => i.weekNumber === weekNumber)
  const unacknowledgedPatterns = (recurringPatterns || []).filter(p => !p.acknowledged)



  useEffect(() => {
    if (!user?.id) return

    if ((scoreHistory || []).length === 0 || (scoreHistory || []).every((s: ScoreHistory) => s.score !== currentRisScore.overall)) {
      const newHistory: ScoreHistory = {
        id: `score-${Date.now()}`,
        userId: user.id,
        score: currentRisScore.overall,
        understand: currentRisScore.understand,
        align: currentRisScore.align,
        elevate: currentRisScore.elevate,
        recordedAt: new Date().toISOString(),
        source: 'manual'
      }
      setScoreHistory((current) => [...(current || []), newHistory])
      void upsertStateSnapshot('score_history', [...(scoreHistory || []), newHistory])
    }

    if (!(weeklyInsights || []).some((i: WeeklyInsight) => i.weekNumber === weekNumber)) {
      ProgressService.generateInsight(user.id, currentRisScore, aiMessages || []).then(insight => {
        const fullInsight: WeeklyInsight = {
          ...insight as WeeklyInsight,
          id: `insight-${weekNumber}-${Date.now()}`
        }
        setWeeklyInsights((current) => [...(current || []), fullInsight])
        void upsertStateSnapshot('weekly_insights', [...(weeklyInsights || []), fullInsight])
      })
    }

    const detectedPatterns = ProgressService.detectRecurringPatterns(aiMessages || [])
    for (const detected of detectedPatterns) {
      if (!(recurringPatterns || []).some((p: RecurringPattern) => p.pattern === detected.pattern)) {
        const newPattern: RecurringPattern = {
          id: `pattern-${Date.now()}-${detected.pattern}`,
          userId: user.id,
          pattern: detected.pattern,
          frequency: detected.frequency,
          firstDetected: new Date().toISOString(),
          lastDetected: new Date().toISOString(),
          pillar: currentStage,
          relatedMessageIds: detected.relatedIds,
          acknowledged: false
        }
        setRecurringPatterns((current) => [...(current || []), newPattern])
        void upsertStateSnapshot('recurring_patterns', [...(recurringPatterns || []), newPattern])
      }
    }
  }, [user?.id, weekNumber])

  const handleMarkInsightRead = () => {
    if (currentWeekInsight) {
      setWeeklyInsights((current) =>
        (current || []).map((i: WeeklyInsight) => i.id === currentWeekInsight.id ? { ...i, read: true } : i)
      )
      void upsertStateSnapshot(
        'weekly_insights',
        (weeklyInsights || []).map((i: WeeklyInsight) =>
          i.id === currentWeekInsight.id ? { ...i, read: true } : i
        )
      )
    }
  }

  const handleAcknowledgePattern = (patternId: string) => {
    setRecurringPatterns((current) =>
      (current || []).map((p: RecurringPattern) => p.id === patternId ? { ...p, acknowledged: true } : p)
    )
    void upsertStateSnapshot(
      'recurring_patterns',
      (recurringPatterns || []).map((p: RecurringPattern) =>
        p.id === patternId ? { ...p, acknowledged: true } : p
      )
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold" style={{ fontFamily: 'Sora, sans-serif' }}>
              Welcome back{user?.name ? `, ${user.name}` : ''}
            </h1>
            <p className="text-muted-foreground">
              Your Relationship Intelligence Dashboard
            </p>
          </div>
        </header>

        {!isPremium && (
          <Card className="bg-gradient-to-r from-primary/5 to-accent/10 border-primary/20">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="bg-background/50 border-primary/30">Free Plan</Badge>
                  </div>
                  <h3 className="text-lg font-semibold mb-1">You're on the Free Plan</h3>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <ChatCircleDots size={16} />
                      <span>{remainingMessages === -1 ? 'Unlimited' : `${remainingMessages}/5`} AI messages this week</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Brain size={16} />
                      <span>2 assessments max</span>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation()
                        onNavigate('usage-stats')
                      }}
                      className="flex items-center gap-1 text-primary hover:underline"
                    >
                      <ChartLine size={16} />
                      <span>View Stats</span>
                    </button>
                  </div>
                </div>
                <Button onClick={() => onNavigate('pricing')} className="gap-2 w-full md:w-auto">
                  <Sparkle size={18} weight="fill" />
                  Upgrade to Premium
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ 
              type: 'spring',
              stiffness: 280,
              damping: 20,
              mass: 0.8,
              delay: 0.1
            }}
            whileHover={{ 
              scale: 1.05,
              y: -6,
              transition: { 
                type: 'spring', 
                stiffness: 400, 
                damping: 15 
              }
            }}
          >
            <Card className="lg:col-span-1 shadow-md">
              <CardHeader>
                <CardTitle className="text-center">Your RIS Score</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center">
                <RISScoreRing
                  score={currentRisScore.overall}
                  delta={currentRisScore.delta}
                  animate
                />
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ 
              type: 'spring',
              stiffness: 280,
              damping: 20,
              mass: 0.8,
              delay: 0.2
            }}
            whileHover={{ 
              scale: 1.03,
              y: -6,
              transition: { 
                type: 'spring', 
                stiffness: 400, 
                damping: 15 
              }
            }}
            className="lg:col-span-2"
          >
            <Card className="shadow-md h-full">
              <CardHeader>
                <CardTitle>Pillar Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <PillarProgressBar pillar="understand" score={currentRisScore.understand} />
                <PillarProgressBar pillar="align" score={currentRisScore.align} />
                <PillarProgressBar pillar="elevate" score={currentRisScore.elevate} />
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {currentWeekInsight && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <WeeklyInsightCard 
              insight={currentWeekInsight}
              onMarkRead={handleMarkInsightRead}
            />
          </motion.div>
        )}

        {user?.id && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
          >
            <MicroActionTracker 
              userId={user.id}
              weekNumber={weekNumber}
            />
          </motion.div>
        )}

        {unacknowledgedPatterns.length > 0 && (
          <div className="space-y-4">
            {unacknowledgedPatterns.map((pattern, index) => (
              <motion.div
                key={pattern.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
              >
                <PatternAlert
                  pattern={pattern}
                  onAcknowledge={() => handleAcknowledgePattern(pattern.id)}
                  onNavigate={onNavigate}
                  aiExplanation={`This pattern appears frequently in your conversations and may be affecting your relationship dynamic. Understanding and addressing it could lead to significant growth.`}
                />
              </motion.div>
            ))}
          </div>
        )}



        <div className="grid md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ 
              type: 'spring',
              stiffness: 260,
              damping: 20,
              mass: 0.9,
              delay: 0.3
            }}
            whileHover={{ 
              scale: 1.05,
              y: -8,
              transition: { 
                type: 'spring', 
                stiffness: 350, 
                damping: 12 
              }
            }}
            whileTap={{ 
              scale: 0.98,
              transition: { 
                type: 'spring', 
                stiffness: 500, 
                damping: 20 
              }
            }}
          >
            <Card className="cursor-pointer shadow-md border-understand/30 relative overflow-hidden group bg-gradient-to-br from-understand/15 via-understand/5 to-transparent" onClick={() => onNavigate('understand')}>
              <div className="absolute inset-0 bg-gradient-to-br from-understand/30 via-understand/15 to-understand/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-gradient-pulse" />
              <CardHeader className="relative">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-understand/20 rounded-lg group-hover:bg-understand/30 transition-colors">
                    <Brain size={24} weight="duotone" className="text-understand" />
                  </div>
                  <CardTitle>UNDERSTAND</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="relative">
                <p className="text-sm text-muted-foreground mb-4">
                  Build self-awareness through pattern recognition and emotional intelligence
                </p>
                <Button variant="ghost" className="w-full">
                  Explore <ArrowRight className="ml-2" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ 
              type: 'spring',
              stiffness: 260,
              damping: 20,
              mass: 0.9,
              delay: 0.4
            }}
            whileHover={{ 
              scale: 1.05,
              y: -8,
              transition: { 
                type: 'spring', 
                stiffness: 350, 
                damping: 12 
              }
            }}
            whileTap={{ 
              scale: 0.98,
              transition: { 
                type: 'spring', 
                stiffness: 500, 
                damping: 20 
              }
            }}
          >
            <Card className="cursor-pointer shadow-md border-align/30 relative overflow-hidden group bg-gradient-to-br from-align/15 via-align/5 to-transparent" onClick={() => onNavigate('align')}>
              <div className="absolute inset-0 bg-gradient-to-br from-align/30 via-align/15 to-align/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-gradient-pulse" />
              <CardHeader className="relative">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-align/20 rounded-lg group-hover:bg-align/30 transition-colors">
                    <UsersThree size={24} weight="duotone" className="text-align" />
                  </div>
                  <CardTitle>ALIGN</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="relative">
                <p className="text-sm text-muted-foreground mb-4">
                  Optimize communication and identify alignment gaps
                </p>
                <Button variant="ghost" className="w-full">
                  Explore <ArrowRight className="ml-2" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ 
              type: 'spring',
              stiffness: 260,
              damping: 20,
              mass: 0.9,
              delay: 0.5
            }}
            whileHover={{ 
              scale: 1.05,
              y: -8,
              transition: { 
                type: 'spring', 
                stiffness: 350, 
                damping: 12 
              }
            }}
            whileTap={{ 
              scale: 0.98,
              transition: { 
                type: 'spring', 
                stiffness: 500, 
                damping: 20 
              }
            }}
          >
            <Card className="cursor-pointer shadow-md border-elevate/30 relative overflow-hidden group bg-gradient-to-br from-elevate/15 via-elevate/5 to-transparent" onClick={() => onNavigate('elevate')}>
              <div className="absolute inset-0 bg-gradient-to-br from-elevate/30 via-elevate/15 to-elevate/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-gradient-pulse" />
              <CardHeader className="relative">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-elevate/20 rounded-lg group-hover:bg-elevate/30 transition-colors">
                    <TrendUp size={24} weight="duotone" className="text-elevate" />
                  </div>
                  <CardTitle>ELEVATE</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="relative">
                <p className="text-sm text-muted-foreground mb-4">
                  Apply insights through protocols and track progress
                </p>
                <Button variant="ghost" className="w-full">
                  Explore <ArrowRight className="ml-2" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>


      </div>
    </div>
  )
}
