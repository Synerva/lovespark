import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RISScoreRing } from '@/components/RISScoreRing'
import { PillarProgressBar } from '@/components/PillarProgressBar'
import { InsightCard } from '@/components/InsightCard'
import { Brain, UsersThree, TrendUp, ArrowRight } from '@phosphor-icons/react'
import type { AppView } from '../App'
import type { RISScore, Insight, User } from '@/lib/types'

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

  const handleInsightRead = (id: string) => {
    // Mark insight as read
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
              {user?.mode === 'couple' ? 'Couple Mode' : 'Individual Mode'}
            </p>
          </div>
        </header>

        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-center">Your RIS Score</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <RISScoreRing
                score={risScore.overall}
                delta={risScore.delta}
                animate
              />
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Pillar Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <PillarProgressBar pillar="understand" score={risScore.understand} />
              <PillarProgressBar pillar="align" score={risScore.align} />
              <PillarProgressBar pillar="elevate" score={risScore.elevate} />
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="cursor-pointer hover:shadow-lg transition-all" onClick={() => onNavigate('understand')}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-accent/10 rounded-lg">
                  <Brain size={24} weight="duotone" className="text-accent" />
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
                <div className="p-2 bg-secondary/10 rounded-lg">
                  <UsersThree size={24} weight="duotone" className="text-secondary" />
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
                <div className="p-2 bg-primary/10 rounded-lg">
                  <TrendUp size={24} weight="duotone" className="text-primary" />
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

        {insights.length > 0 && (
          <div>
            <h2 className="text-2xl font-semibold mb-4" style={{ fontFamily: 'Sora, sans-serif' }}>
              Recent Insights
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {insights.slice(0, 3).map((insight, index) => (
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
            <Button onClick={() => onNavigate('check-in')} size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
              Start Check-In
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
