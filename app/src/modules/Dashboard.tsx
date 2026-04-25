import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RISScoreRing } from '@/components/RISScoreRing'
import { PillarProgressBar } from '@/components/PillarProgressBar'
import { WeeklyInsightCard } from '@/components/WeeklyInsightCard'
import { PatternAlert } from '@/components/PatternAlert'
import { Brain, UsersThree, TrendUp, ArrowRight, ChartLine, Sparkle, ChatCircleDots, CheckCircle, Star } from '@phosphor-icons/react'
import type { AppView } from '../App'
import type { RISScore, User, Subscription, ScoreHistory, RecurringPattern, AIMessage } from '@/lib/types'
import { FeatureGateService } from '@/lib/feature-gate-service'
import { ProgressService } from '@/lib/progress-service'
import { authService } from '@/lib/auth-service'
import { getOrCreateProfile } from '@/lib/db/profiles'
import { loadLatestRISScore } from '@/lib/db/assessments'
import { getCurrentSubscription } from '@/lib/db/subscriptions'
import { loadChatHistory } from '@/lib/db/ai'
import { getStateSnapshot, upsertStateSnapshot } from '@/lib/db/state-snapshots'
import { backfillCurrentUserWeeklyContent } from '@/lib/db/weekly-insight-pipeline'
import {
  loadLatestWeeklyInsight,
  markWeeklyInsightAsRead,
  type DashboardWeeklyInsight,
} from '@/lib/db/insights'
import {
  loadRecommendations,
  saveRecommendationFeedback,
  updateRecommendationStatus,
  type RecommendationFeedbackValue,
  type DashboardRecommendation,
} from '@/lib/db/recommendations'

interface DashboardProps {
  onNavigate: (view: AppView) => void
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const isDev = import.meta.env.DEV
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
  const [weeklyInsight, setWeeklyInsight] = useState<DashboardWeeklyInsight | null>(null)
  const [weeklyInsightLoading, setWeeklyInsightLoading] = useState(true)
  const [weeklyInsightError, setWeeklyInsightError] = useState<string | null>(null)
  const [weeklyPlanActions, setWeeklyPlanActions] = useState<DashboardRecommendation[]>([])
  const [weeklyPlanActionsLoading, setWeeklyPlanActionsLoading] = useState(true)
  const [weeklyPlanActionsError, setWeeklyPlanActionsError] = useState<string | null>(null)
  const [recommendationFeedbackById, setRecommendationFeedbackById] = useState<Record<string, RecommendationFeedbackValue>>({})
  const [recurringPatterns, setRecurringPatterns] = useState<RecurringPattern[]>([])
  const [aiMessages, setAiMessages] = useState<AIMessage[]>([])

  const loadOptionalStateSnapshot = async <T,>(key: string): Promise<T | null> => {
    try {
      return await getStateSnapshot<T>(key)
    } catch (error) {
      console.warn(`Failed loading optional state snapshot for key "${key}"`, error)
      return null
    }
  }

  const refreshInsightAndRecommendations = async () => {
    setWeeklyInsightLoading(true)
    setWeeklyPlanActionsLoading(true)
    setWeeklyInsightError(null)
    setWeeklyPlanActionsError(null)

    const [insightResult, weeklyPlanActionsResult] = await Promise.allSettled([
      loadLatestWeeklyInsight(),
      loadRecommendations(),
    ])

    if (insightResult.status === 'fulfilled') {
      setWeeklyInsight(insightResult.value)
      setWeeklyInsightError(null)
    } else {
      setWeeklyInsight(null)
      setWeeklyInsightError('Unable to load weekly insight.')
    }

    if (weeklyPlanActionsResult.status === 'fulfilled') {
      setWeeklyPlanActions(weeklyPlanActionsResult.value)
      setWeeklyPlanActionsError(null)
    } else {
      setWeeklyPlanActions([])
      setWeeklyPlanActionsError('Unable to load recommendations.')
    }

    setWeeklyInsightLoading(false)
    setWeeklyPlanActionsLoading(false)

    console.log('[Dashboard] reloaded', {
      weeklyInsightLoaded: insightResult.status === 'fulfilled' && Boolean(insightResult.value),
      weeklyPlanActionsCount: weeklyPlanActionsResult.status === 'fulfilled' ? weeklyPlanActionsResult.value.length : 0,
    })
  }

  const handleBackfillCurrentUserWeeklyContent = async () => {
    setWeeklyInsightLoading(true)
    setWeeklyPlanActionsLoading(true)

    try {
      await backfillCurrentUserWeeklyContent()
      await refreshInsightAndRecommendations()
    } catch (error) {
      console.error('[WeeklyPipeline] manual backfill failed:', error)
      setWeeklyInsightError('Unable to load weekly insight.')
      setWeeklyPlanActionsError('Unable to load recommendations.')
      setWeeklyInsightLoading(false)
      setWeeklyPlanActionsLoading(false)
    }
  }

  useEffect(() => {
    const loadData = async () => {
      const session = authService.getSession()
      if (!session) {
        return
      }

      try {
        const [
          profile,
          dbRis,
          currentSubscription,
          history,
          weeklyCount,
          scoreHistorySnapshot,
          recurringPatternsSnapshot,
        ] = await Promise.all([
          getOrCreateProfile({ name: session.name, email: session.email, avatarUrl: session.avatarUrl }),
          loadLatestRISScore(),
          getCurrentSubscription(),
          loadChatHistory(),
          loadOptionalStateSnapshot<number>('weekly_message_count'),
          loadOptionalStateSnapshot<ScoreHistory[]>('score_history'),
          loadOptionalStateSnapshot<RecurringPattern[]>('recurring_patterns'),
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
        setRecurringPatterns(recurringPatternsSnapshot ?? [])

        await refreshInsightAndRecommendations()
      } catch (error) {
        console.error('Failed loading dashboard data from Supabase:', error)
        setWeeklyInsightError('Unable to load weekly insight.')
        setWeeklyPlanActionsError('Unable to load recommendations.')
      } finally {
        setWeeklyInsightLoading(false)
        setWeeklyPlanActionsLoading(false)
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

  const handleMarkInsightRead = async () => {
    if (!weeklyInsight) return
    try {
      await markWeeklyInsightAsRead(weeklyInsight.id)
      setWeeklyInsight((current) => (current ? { ...current, read: true } : current))
    } catch (error) {
      console.error('Failed marking weekly insight as read:', error)
    }
  }

  const handleUpdateRecommendationStatus = async (recommendationId: string, status: string) => {
    try {
      await updateRecommendationStatus(recommendationId, status)
      await refreshInsightAndRecommendations()
    } catch (error) {
      console.error('Failed updating recommendation status:', error)
    }
  }

  const handleSaveRecommendationFeedback = async (
    recommendationId: string,
    feedback: RecommendationFeedbackValue
  ) => {
    try {
      await saveRecommendationFeedback(recommendationId, feedback)
      setRecommendationFeedbackById((current) => ({
        ...current,
        [recommendationId]: feedback,
      }))
    } catch (error) {
      console.error('Failed saving recommendation feedback:', error)
    }
  }

  const weeklySummaryFallback = 'This week, focus on improving communication clarity and emotional timing.'
  const weeklyPlanSummary = useMemo(() => {
    const insightText = weeklyInsight?.content?.trim()
    if (!insightText) {
      return weeklySummaryFallback
    }

    const focusMatch = insightText.match(/(?:opportunity is to improve|focus on improving)\s+([^.]*)/i)
    if (focusMatch?.[1]) {
      return `This week, focus on improving ${focusMatch[1].trim()}.`
    }

    return weeklySummaryFallback
  }, [weeklyInsight?.content])

  const sortedRecommendations = useMemo(() => {
    const statusRank = (status: string) => {
      const normalized = String(status).toLowerCase()
      if (normalized === 'pending') return 0
      if (normalized === 'completed') return 2
      return 1
    }

    return [...weeklyPlanActions].sort((a, b) => {
      const statusDiff = statusRank(a.status) - statusRank(b.status)
      if (statusDiff !== 0) {
        return statusDiff
      }

      const createdAtA = Date.parse(a.createdAt)
      const createdAtB = Date.parse(b.createdAt)
      return createdAtB - createdAtA
    })
  }, [weeklyPlanActions])

  const completedRecommendationsCount = useMemo(
    () => weeklyPlanActions.filter((recommendation) => String(recommendation.status).toLowerCase() === 'completed').length,
    [weeklyPlanActions]
  )
  const totalRecommendationsCount = weeklyPlanActions.length
  const completionPercent = totalRecommendationsCount > 0
    ? Math.round((completedRecommendationsCount / totalRecommendationsCount) * 100)
    : 0

  const firstPendingRecommendationId = useMemo(
    () => sortedRecommendations.find((recommendation) => String(recommendation.status).toLowerCase() === 'pending')?.id,
    [sortedRecommendations]
  )

  const getRecommendationIcon = (recommendation: DashboardRecommendation) => {
    const typeText = `${recommendation.recommendationType ?? ''} ${recommendation.title ?? ''}`.toLowerCase()

    if (typeText.includes('align') || typeText.includes('communication')) {
      return <UsersThree size={18} className="text-align" weight="duotone" />
    }

    if (typeText.includes('understand') || typeText.includes('emotion')) {
      return <Brain size={18} className="text-understand" weight="duotone" />
    }

    if (typeText.includes('elevate') || typeText.includes('habit') || typeText.includes('ritual')) {
      return <TrendUp size={18} className="text-elevate" weight="duotone" />
    }

    return <Sparkle size={18} className="text-primary" weight="duotone" />
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
          {isDev && (
            <Button variant="outline" onClick={() => { void handleBackfillCurrentUserWeeklyContent() }}>
              Backfill Weekly Content
            </Button>
          )}
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {weeklyInsightLoading ? (
            <Card className="shadow-md border-accent/30 bg-gradient-to-br from-accent/5 to-transparent">
              <CardContent className="p-6 text-sm text-muted-foreground">
                Loading weekly insight...
              </CardContent>
            </Card>
          ) : weeklyInsightError ? (
            <Card className="shadow-md border-destructive/30">
              <CardContent className="p-6 text-sm text-destructive">
                {weeklyInsightError}
              </CardContent>
            </Card>
          ) : weeklyInsight ? (
            <WeeklyInsightCard
              insight={weeklyInsight}
              onMarkRead={() => { void handleMarkInsightRead() }}
            />
          ) : (
            <Card className="shadow-md border-accent/30 bg-gradient-to-br from-accent/5 to-transparent">
              <CardHeader>
                <CardTitle className="text-lg">Weekly Insight</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Complete your weekly check-in to unlock your next weekly insight.
                </p>
              </CardContent>
            </Card>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-lg">Your Weekly Plan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-lg border border-accent/30 bg-accent/5 p-3">
                <p className="text-sm text-muted-foreground">{weeklyPlanSummary}</p>
              </div>

              {!weeklyPlanActionsLoading && !weeklyPlanActionsError && totalRecommendationsCount > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">
                    Weekly Progress: {completedRecommendationsCount} / {totalRecommendationsCount} completed
                  </p>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${completionPercent}%` }}
                    />
                  </div>
                </div>
              )}

              {weeklyPlanActionsLoading && (
                <p className="text-sm text-muted-foreground">Loading recommendations...</p>
              )}

              {!weeklyPlanActionsLoading && weeklyPlanActionsError && (
                <p className="text-sm text-destructive">{weeklyPlanActionsError}</p>
              )}

              {!weeklyPlanActionsLoading && !weeklyPlanActionsError && weeklyPlanActions.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Your personalized weekly plan will appear after your check-in.
                </p>
              )}

              {!weeklyPlanActionsLoading && !weeklyPlanActionsError && sortedRecommendations.map((recommendation) => {
                const isCompleted = String(recommendation.status).toLowerCase() === 'completed'
                const selectedFeedback = recommendationFeedbackById[recommendation.id]
                const isTodaysFocus = recommendation.id === firstPendingRecommendationId

                return (
                  <div key={recommendation.id} className="p-3 rounded-lg border border-border">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2">
                        <div className="mt-0.5">{getRecommendationIcon(recommendation)}</div>
                        <div>
                          <p className="text-sm font-medium">{recommendation.title}</p>
                          {recommendation.description && (
                            <p className="text-sm text-muted-foreground mt-1">{recommendation.description}</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-2">
                            <span className="font-medium text-foreground/80">Why this matters:</span>{' '}
                            {recommendation.whyThis ?? 'Small consistent steps help build trust, safety, and connection over time.'}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Estimated time: {recommendation.estimatedTime ?? '2-3 minutes'}
                          </p>
                        </div>
                      </div>

                      {isTodaysFocus && (
                        <Badge variant="outline" className="bg-primary/5 border-primary/30 text-primary">
                          <Star size={12} className="mr-1" weight="fill" />
                          Today's focus
                        </Badge>
                      )}
                    </div>

                    {!isCompleted && (
                      <div className="flex gap-2 mt-3">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => { void handleUpdateRecommendationStatus(recommendation.id, 'completed') }}
                        >
                          Mark as Done
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => { void handleUpdateRecommendationStatus(recommendation.id, 'dismissed') }}
                        >
                          Skip
                        </Button>
                      </div>
                    )}

                    {isCompleted && (
                      <div className="mt-3 space-y-2">
                        <div className="rounded-md border border-success/30 bg-success/10 p-2 text-sm text-success flex items-center gap-2">
                          <CheckCircle size={16} weight="fill" />
                          <span>Nice — small actions like this improve connection over time.</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant={selectedFeedback === 'helpful' ? 'default' : 'outline'}
                            onClick={() => { void handleSaveRecommendationFeedback(recommendation.id, 'helpful') }}
                          >
                            👍 Helpful
                          </Button>
                          <Button
                            size="sm"
                            variant={selectedFeedback === 'neutral' ? 'default' : 'outline'}
                            onClick={() => { void handleSaveRecommendationFeedback(recommendation.id, 'neutral') }}
                          >
                            😐 Neutral
                          </Button>
                          <Button
                            size="sm"
                            variant={selectedFeedback === 'not_helpful' ? 'default' : 'outline'}
                            onClick={() => { void handleSaveRecommendationFeedback(recommendation.id, 'not_helpful') }}
                          >
                            👎 Not helpful
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </motion.div>

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
