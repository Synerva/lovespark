import { useState, useMemo } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { 
  ArrowLeft, 
  TrendUp, 
  TrendDown, 
  CalendarCheck,
  ChartLine,
  Brain,
  UsersThree,
  Sparkle
} from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import type { CheckIn, RISScore } from '@/lib/types'
import type { AppView } from '@/App'

interface CheckInHistoryProps {
  onNavigate: (view: AppView) => void
}

export function CheckInHistory({ onNavigate }: CheckInHistoryProps) {
  const [checkIns] = useKV<CheckIn[]>('lovespark-check-ins', [])
  const [activeTab, setActiveTab] = useState<'overview' | 'trends' | 'insights'>('overview')

  const sortedCheckIns = useMemo(() => {
    return [...(checkIns || [])].sort((a, b) => 
      new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
    )
  }, [checkIns])

  const scoresTrend = useMemo(() => {
    return sortedCheckIns.map(checkIn => ({
      date: new Date(checkIn.completedAt),
      week: checkIn.weekNumber,
      overall: checkIn.risScoreAfter.overall,
      understand: checkIn.risScoreAfter.understand,
      align: checkIn.risScoreAfter.align,
      elevate: checkIn.risScoreAfter.elevate,
      delta: checkIn.risScoreAfter.delta || 0,
    })).reverse()
  }, [sortedCheckIns])

  const statistics = useMemo(() => {
    if (scoresTrend.length === 0) return null

    const firstScore = scoresTrend[0].overall
    const lastScore = scoresTrend[scoresTrend.length - 1].overall
    const overallChange = lastScore - firstScore
    const avgDelta = scoresTrend.reduce((sum, s) => sum + s.delta, 0) / scoresTrend.length

    const maxScore = Math.max(...scoresTrend.map(s => s.overall))
    const minScore = Math.min(...scoresTrend.map(s => s.overall))

    const positiveWeeks = scoresTrend.filter(s => s.delta > 0).length
    const negativeWeeks = scoresTrend.filter(s => s.delta < 0).length

    return {
      totalCheckIns: checkIns?.length || 0,
      overallChange,
      avgDelta,
      maxScore,
      minScore,
      positiveWeeks,
      negativeWeeks,
      currentStreak: calculateStreak(sortedCheckIns),
    }
  }, [scoresTrend, checkIns, sortedCheckIns])

  const pillarTrends = useMemo(() => {
    if (scoresTrend.length < 2) return null

    const first = scoresTrend[0]
    const last = scoresTrend[scoresTrend.length - 1]

    return {
      understand: {
        change: last.understand - first.understand,
        current: last.understand,
      },
      align: {
        change: last.align - first.align,
        current: last.align,
      },
      elevate: {
        change: last.elevate - first.elevate,
        current: last.elevate,
      },
    }
  }, [scoresTrend])

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const formatDateShort = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => onNavigate('dashboard')} size="sm">
              <ArrowLeft className="mr-2" /> Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold" style={{ fontFamily: 'Sora, sans-serif' }}>
                Check-In History
              </h1>
              <p className="text-muted-foreground mt-1">
                Track your relationship intelligence journey over time
              </p>
            </div>
          </div>
        </div>

        {!checkIns || checkIns.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardContent className="p-12 text-center">
                <CalendarCheck size={64} weight="duotone" className="mx-auto mb-4 text-muted-foreground" />
                <h2 className="text-2xl font-semibold mb-2" style={{ fontFamily: 'Sora, sans-serif' }}>
                  No Check-Ins Yet
                </h2>
                <p className="text-muted-foreground mb-6">
                  Complete your first weekly check-in to start tracking your RIS score trends
                </p>
                <Button onClick={() => onNavigate('check-in')} size="lg">
                  Start Your First Check-In
                  <Sparkle className="ml-2" weight="fill" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="overview">
                <ChartLine className="mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="trends">
                <TrendUp className="mr-2" />
                Trends
              </TabsTrigger>
              <TabsTrigger value="insights">
                <Sparkle className="mr-2" weight="fill" />
                Insights Timeline
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {statistics && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="grid md:grid-cols-4 gap-4"
                >
                  <Card className="bg-gradient-to-br from-accent/10 to-accent/5">
                    <CardContent className="p-6">
                      <div className="text-sm text-muted-foreground mb-2">Total Check-Ins</div>
                      <div className="text-3xl font-bold" style={{ fontFamily: 'Sora, sans-serif' }}>
                        {statistics.totalCheckIns}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {statistics.currentStreak} week streak
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-secondary/10 to-secondary/5">
                    <CardContent className="p-6">
                      <div className="text-sm text-muted-foreground mb-2">Overall Change</div>
                      <div className="flex items-baseline gap-2">
                        <div className="text-3xl font-bold" style={{ fontFamily: 'Sora, sans-serif' }}>
                          {statistics.overallChange > 0 ? '+' : ''}{statistics.overallChange.toFixed(1)}
                        </div>
                        {statistics.overallChange > 0 ? (
                          <TrendUp size={24} weight="bold" className="text-secondary" />
                        ) : (
                          <TrendDown size={24} weight="bold" className="text-destructive" />
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Since week 1
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="text-sm text-muted-foreground mb-2">Score Range</div>
                      <div className="flex items-baseline gap-2">
                        <div className="text-3xl font-bold" style={{ fontFamily: 'Sora, sans-serif' }}>
                          {statistics.minScore}
                        </div>
                        <div className="text-muted-foreground">—</div>
                        <div className="text-3xl font-bold" style={{ fontFamily: 'Sora, sans-serif' }}>
                          {statistics.maxScore}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Min to Max
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="text-sm text-muted-foreground mb-2">Progress Rate</div>
                      <div className="text-3xl font-bold" style={{ fontFamily: 'Sora, sans-serif' }}>
                        {statistics.avgDelta > 0 ? '+' : ''}{statistics.avgDelta.toFixed(1)}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Avg per week
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card>
                  <CardHeader>
                    <h2 className="text-xl font-semibold" style={{ fontFamily: 'Sora, sans-serif' }}>
                      RIS Score Progression
                    </h2>
                  </CardHeader>
                  <CardContent className="p-6">
                    <ScoreTrendChart data={scoresTrend} />
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="text-xl font-semibold mb-4" style={{ fontFamily: 'Sora, sans-serif' }}>
                  Recent Check-Ins
                </h2>
                <div className="space-y-4">
                  {sortedCheckIns.slice(0, 5).map((checkIn, index) => (
                    <CheckInCard key={checkIn.id} checkIn={checkIn} index={index} />
                  ))}
                </div>
              </motion.div>
            </TabsContent>

            <TabsContent value="trends" className="space-y-6">
              {pillarTrends && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <Card>
                    <CardHeader>
                      <h2 className="text-xl font-semibold flex items-center gap-2" style={{ fontFamily: 'Sora, sans-serif' }}>
                        <Brain weight="duotone" />
                        UNDERSTAND Pillar Trend
                      </h2>
                    </CardHeader>
                    <CardContent className="p-6">
                      <PillarTrendChart 
                        data={scoresTrend} 
                        pillar="understand" 
                        color="oklch(0.65 0.09 195)"
                      />
                      <div className="mt-6 flex items-center justify-between">
                        <div>
                          <div className="text-sm text-muted-foreground">Current Score</div>
                          <div className="text-3xl font-bold" style={{ fontFamily: 'Sora, sans-serif' }}>
                            {pillarTrends.understand.current}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">Total Change</div>
                          <div className={`text-2xl font-bold flex items-center gap-2 ${pillarTrends.understand.change >= 0 ? 'text-secondary' : 'text-destructive'}`}>
                            {pillarTrends.understand.change > 0 ? '+' : ''}{pillarTrends.understand.change.toFixed(1)}
                            {pillarTrends.understand.change > 0 ? (
                              <TrendUp weight="bold" />
                            ) : (
                              <TrendDown weight="bold" />
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <h2 className="text-xl font-semibold flex items-center gap-2" style={{ fontFamily: 'Sora, sans-serif' }}>
                        <UsersThree weight="duotone" />
                        ALIGN Pillar Trend
                      </h2>
                    </CardHeader>
                    <CardContent className="p-6">
                      <PillarTrendChart 
                        data={scoresTrend} 
                        pillar="align" 
                        color="oklch(0.72 0.12 75)"
                      />
                      <div className="mt-6 flex items-center justify-between">
                        <div>
                          <div className="text-sm text-muted-foreground">Current Score</div>
                          <div className="text-3xl font-bold" style={{ fontFamily: 'Sora, sans-serif' }}>
                            {pillarTrends.align.current}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">Total Change</div>
                          <div className={`text-2xl font-bold flex items-center gap-2 ${pillarTrends.align.change >= 0 ? 'text-secondary' : 'text-destructive'}`}>
                            {pillarTrends.align.change > 0 ? '+' : ''}{pillarTrends.align.change.toFixed(1)}
                            {pillarTrends.align.change > 0 ? (
                              <TrendUp weight="bold" />
                            ) : (
                              <TrendDown weight="bold" />
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <h2 className="text-xl font-semibold flex items-center gap-2" style={{ fontFamily: 'Sora, sans-serif' }}>
                        <TrendUp weight="duotone" />
                        ELEVATE Pillar Trend
                      </h2>
                    </CardHeader>
                    <CardContent className="p-6">
                      <PillarTrendChart 
                        data={scoresTrend} 
                        pillar="elevate" 
                        color="oklch(0.22 0.04 250)"
                      />
                      <div className="mt-6 flex items-center justify-between">
                        <div>
                          <div className="text-sm text-muted-foreground">Current Score</div>
                          <div className="text-3xl font-bold" style={{ fontFamily: 'Sora, sans-serif' }}>
                            {pillarTrends.elevate.current}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">Total Change</div>
                          <div className={`text-2xl font-bold flex items-center gap-2 ${pillarTrends.elevate.change >= 0 ? 'text-secondary' : 'text-destructive'}`}>
                            {pillarTrends.elevate.change > 0 ? '+' : ''}{pillarTrends.elevate.change.toFixed(1)}
                            {pillarTrends.elevate.change > 0 ? (
                              <TrendUp weight="bold" />
                            ) : (
                              <TrendDown weight="bold" />
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </TabsContent>

            <TabsContent value="insights" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {sortedCheckIns.map((checkIn, index) => (
                  <CheckInDetailCard key={checkIn.id} checkIn={checkIn} index={index} />
                ))}
              </motion.div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  )
}

function CheckInCard({ checkIn, index }: { checkIn: CheckIn; index: number }) {
  const delta = checkIn.risScoreAfter.delta || 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-center justify-center w-16 h-16 bg-accent/10 rounded-lg">
                <div className="text-xs text-muted-foreground">Week</div>
                <div className="text-xl font-bold" style={{ fontFamily: 'Sora, sans-serif' }}>
                  {checkIn.weekNumber}
                </div>
              </div>
              <div>
                <div className="font-medium">{formatDateLong(checkIn.completedAt)}</div>
                <div className="text-sm text-muted-foreground">
                  {checkIn.insightsGenerated.length} insights generated
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold mb-1" style={{ fontFamily: 'Sora, sans-serif' }}>
                {checkIn.risScoreAfter.overall}
              </div>
              <Badge 
                variant={delta >= 0 ? 'default' : 'destructive'}
                className={delta >= 0 ? 'bg-secondary text-secondary-foreground' : ''}
              >
                {delta > 0 ? '+' : ''}{delta.toFixed(1)}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function CheckInDetailCard({ checkIn, index }: { checkIn: CheckIn; index: number }) {
  const delta = checkIn.risScoreAfter.delta || 0
  const [insights] = useKV<any[]>('lovespark-insights', [])
  
  const checkInInsights = (insights || []).filter((insight: any) => 
    checkIn.insightsGenerated.includes(insight.id)
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-center justify-center w-12 h-12 bg-accent/10 rounded-lg">
                <div className="text-lg font-bold" style={{ fontFamily: 'Sora, sans-serif' }}>
                  {checkIn.weekNumber}
                </div>
              </div>
              <div>
                <div className="font-semibold">{formatDateLong(checkIn.completedAt)}</div>
                <div className="text-sm text-muted-foreground">
                  Week {checkIn.weekNumber} Check-In
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold" style={{ fontFamily: 'Sora, sans-serif' }}>
                {checkIn.risScoreAfter.overall}
              </div>
              <Badge 
                variant={delta >= 0 ? 'default' : 'destructive'}
                className={delta >= 0 ? 'bg-secondary text-secondary-foreground' : ''}
              >
                {delta > 0 ? '+' : ''}{delta.toFixed(1)}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-4 p-4 bg-muted/30 rounded-lg">
            <div className="text-center">
              <div className="text-xs text-muted-foreground mb-1">UNDERSTAND</div>
              <div className="text-lg font-semibold" style={{ fontFamily: 'Sora, sans-serif' }}>
                {checkIn.risScoreAfter.understand}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-muted-foreground mb-1">ALIGN</div>
              <div className="text-lg font-semibold" style={{ fontFamily: 'Sora, sans-serif' }}>
                {checkIn.risScoreAfter.align}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-muted-foreground mb-1">ELEVATE</div>
              <div className="text-lg font-semibold" style={{ fontFamily: 'Sora, sans-serif' }}>
                {checkIn.risScoreAfter.elevate}
              </div>
            </div>
          </div>

          {checkInInsights.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground mb-2">
                Insights Generated
              </div>
              {checkInInsights.map((insight: any) => (
                <div 
                  key={insight.id}
                  className="p-3 bg-accent/5 border border-accent/20 rounded-lg"
                >
                  <div className="flex items-start gap-2">
                    <Sparkle size={16} weight="fill" className="text-accent mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="font-medium text-sm mb-1">{insight.title}</div>
                      <div className="text-sm text-muted-foreground">{insight.content}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

function ScoreTrendChart({ data }: { data: any[] }) {
  if (data.length === 0) return null

  const maxScore = Math.max(...data.map(d => d.overall))
  const minScore = Math.min(...data.map(d => d.overall))
  const range = maxScore - minScore || 10
  const padding = range * 0.2

  const chartHeight = 200
  const chartWidth = data.length > 1 ? 100 : 50

  const getY = (score: number) => {
    const normalizedScore = ((score - minScore + padding) / (range + padding * 2))
    return chartHeight - (normalizedScore * chartHeight)
  }

  const getX = (index: number) => {
    return (index / Math.max(data.length - 1, 1)) * chartWidth
  }

  const pathData = data.map((d, i) => {
    const x = getX(i)
    const y = getY(d.overall)
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
  }).join(' ')

  return (
    <div className="w-full">
      <svg 
        viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
        className="w-full h-48"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="oklch(0.65 0.09 195)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="oklch(0.65 0.09 195)" stopOpacity="0.05" />
          </linearGradient>
        </defs>

        <path
          d={`${pathData} L ${getX(data.length - 1)} ${chartHeight} L 0 ${chartHeight} Z`}
          fill="url(#scoreGradient)"
        />

        <path
          d={pathData}
          fill="none"
          stroke="oklch(0.65 0.09 195)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {data.map((d, i) => (
          <g key={i}>
            <circle
              cx={getX(i)}
              cy={getY(d.overall)}
              r="3"
              fill="oklch(0.65 0.09 195)"
              stroke="white"
              strokeWidth="2"
            />
          </g>
        ))}
      </svg>

      <div className="flex justify-between mt-4 text-xs text-muted-foreground">
        {data.map((d, i) => (
          <div key={i} className="text-center" style={{ width: `${100 / data.length}%` }}>
            <div>W{d.week}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function PillarTrendChart({ data, pillar, color }: { data: any[]; pillar: 'understand' | 'align' | 'elevate'; color: string }) {
  if (data.length === 0) return null

  const scores = data.map(d => d[pillar])
  const maxScore = Math.max(...scores)
  const minScore = Math.min(...scores)
  const range = maxScore - minScore || 10
  const padding = range * 0.2

  const chartHeight = 160
  const chartWidth = data.length > 1 ? 100 : 50

  const getY = (score: number) => {
    const normalizedScore = ((score - minScore + padding) / (range + padding * 2))
    return chartHeight - (normalizedScore * chartHeight)
  }

  const getX = (index: number) => {
    return (index / Math.max(data.length - 1, 1)) * chartWidth
  }

  const pathData = data.map((d, i) => {
    const x = getX(i)
    const y = getY(d[pillar])
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
  }).join(' ')

  return (
    <div className="w-full">
      <svg 
        viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
        className="w-full h-40"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id={`${pillar}Gradient`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0.05" />
          </linearGradient>
        </defs>

        <path
          d={`${pathData} L ${getX(data.length - 1)} ${chartHeight} L 0 ${chartHeight} Z`}
          fill={`url(#${pillar}Gradient)`}
        />

        <path
          d={pathData}
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {data.map((d, i) => (
          <g key={i}>
            <circle
              cx={getX(i)}
              cy={getY(d[pillar])}
              r="3"
              fill={color}
              stroke="white"
              strokeWidth="2"
            />
          </g>
        ))}
      </svg>

      <div className="flex justify-between mt-4 text-xs text-muted-foreground">
        {data.map((d, i) => (
          <div key={i} className="text-center" style={{ width: `${100 / data.length}%` }}>
            <div>W{d.week}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function calculateStreak(checkIns: CheckIn[]): number {
  if (checkIns.length === 0) return 0
  
  const sortedByWeek = [...checkIns].sort((a, b) => b.weekNumber - a.weekNumber)
  
  let streak = 1
  for (let i = 0; i < sortedByWeek.length - 1; i++) {
    const current = sortedByWeek[i].weekNumber
    const next = sortedByWeek[i + 1].weekNumber
    
    if (current - next === 1) {
      streak++
    } else {
      break
    }
  }
  
  return streak
}

function formatDateLong(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}
