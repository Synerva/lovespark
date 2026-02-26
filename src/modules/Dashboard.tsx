import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RISScoreRing } from '@/components/RISScoreRing'
import { PillarProgressBar } from '@/components/PillarProgressBar'
import { InsightCard } from '@/components/InsightCard'
import { Brain, UsersThree, TrendUp, ArrowRight, ChartLine, Sparkle, ChatCircleDots } from '@phosphor-icons/react'
import type { AppView } from '../App'
import type { RISScore, Insight, User, Subscription } from '@/lib/types'
import { FeatureGateService } from '@/lib/feature-gate-service'
import { SubscriptionService } from '@/lib/subscription-service'

interface DashboardProps {
  onNavigate: (view: AppView) => void
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const [user] = useKV<User>('lovespark-user', null as any)
  const [risScore] = useKV<RISScore>('lovespark-ris-score', {
    overall: 52,
    understand: 51,
    align: 53,
    elevate: 50,
    lastUpdated: new Date().toISOString(),
  })
  const [insights] = useKV<Insight[]>('lovespark-insights', [])
  const [subscription] = useKV<Subscription | null>('lovespark-subscription', null)
  const [weeklyMessageCount] = useKV<number>('lovespark-weekly-message-count', 0)
  
  const isPremium = subscription && subscription.status === 'active' && subscription.planName !== 'FREE'
  const remainingMessages = FeatureGateService.getRemainingAIMessages(subscription ?? null, weeklyMessageCount ?? 0)

  const handleInsightRead = (id: string) => {
    // Mark insight as read
  }

  const currentRisScore = risScore || {
    overall: 52,
    understand: 51,
    align: 53,
    elevate: 50,
    lastUpdated: new Date().toISOString(),
  }

  const currentInsights = insights || []

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold" style={{ fontFamily: 'Sora, sans-serif' }}>
              Welcome back{user?.name ? `, ${user.name}` : ''}
            </h1>
            <p className="text-muted-foreground">
              {user?.mode === 'couple' ? 'Couple Mode' : 'Individual Mode'}
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
          <Card className="lg:col-span-1">
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

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Pillar Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <PillarProgressBar pillar="understand" score={currentRisScore.understand} />
              <PillarProgressBar pillar="align" score={currentRisScore.align} />
              <PillarProgressBar pillar="elevate" score={currentRisScore.elevate} />
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="cursor-pointer hover:shadow-lg transition-all" onClick={() => onNavigate('understand')}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Brain size={24} weight="duotone" className="text-primary" />
                </div>
                <CardTitle>UNDERSTAND</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Build self-awareness through pattern recognition and emotional intelligence
              </p>
              <Button variant="ghost" className="w-full">
                Explore <ArrowRight className="ml-2" />
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-all" onClick={() => onNavigate('align')}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-accent/10 rounded-lg">
                  <UsersThree size={24} weight="duotone" className="text-accent" />
                </div>
                <CardTitle>ALIGN</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Optimize communication and identify alignment gaps
              </p>
              <Button variant="ghost" className="w-full">
                Explore <ArrowRight className="ml-2" />
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-all" onClick={() => onNavigate('elevate')}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-secondary/20 rounded-lg">
                  <TrendUp size={24} weight="duotone" className="text-secondary-foreground" />
                </div>
                <CardTitle>ELEVATE</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Apply insights through protocols and track progress
              </p>
              <Button variant="ghost" className="w-full">
                Explore <ArrowRight className="ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {currentInsights.length > 0 && (
          <div>
            <h2 className="text-2xl font-semibold mb-4" style={{ fontFamily: 'Sora, sans-serif' }}>
              Recent Insights
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentInsights.slice(0, 3).map((insight, index) => (
                <InsightCard
                  key={insight.id}
                  insight={insight}
                  onRead={handleInsightRead}
                  index={index}
                />
              ))}
            </div>
          </div>
        )}

        <Card className="bg-gradient-to-br from-accent/10 to-secondary/10 border-accent/20">
          <CardContent className="p-8 text-center">
            <h3 className="text-xl font-semibold mb-2" style={{ fontFamily: 'Sora, sans-serif' }}>
              Complete Your Weekly Check-In
            </h3>
            <p className="text-muted-foreground mb-6">
              Regular reflection drives progress. Update your RIS and unlock new insights.
            </p>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => onNavigate('check-in')} size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
                Start Check-In
              </Button>
              <Button onClick={() => onNavigate('check-in-history')} size="lg" variant="outline">
                <ChartLine className="mr-2" />
                View History
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
