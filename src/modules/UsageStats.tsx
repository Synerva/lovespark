import { useState, useMemo, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  ArrowLeft, 
  ChatCircleDots, 
  TrendUp, 
  CalendarBlank, 
  Clock,
  ChartLine,
  Robot,
  User as UserIcon,
  Sparkle
} from '@phosphor-icons/react'
import type { AppView } from '../App'
import type { AIMessage, Subscription } from '@/lib/types'
import { format, startOfWeek, endOfWeek, eachDayOfInterval, subWeeks, isWithinInterval, parseISO } from 'date-fns'
import { loadChatHistory } from '@/lib/db/ai'
import { getCurrentSubscription } from '@/lib/db/subscriptions'
import { getStateSnapshot } from '@/lib/db/state-snapshots'

interface UsageStatsProps {
  onNavigate: (view: AppView) => void
}

type TimeRange = '7days' | '30days' | '90days' | 'all'

interface DailyStats {
  date: string
  messageCount: number
  userMessages: number
  aiMessages: number
}

interface WeeklyStats {
  weekStart: string
  weekEnd: string
  messageCount: number
  averagePerDay: number
}

export function UsageStats({ onNavigate }: UsageStatsProps) {
  const [messages, setMessages] = useState<AIMessage[]>([])
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [weeklyMessageCount, setWeeklyMessageCount] = useState(0)
  const [timeRange, setTimeRange] = useState<TimeRange>('30days')
  const [selectedWeek, setSelectedWeek] = useState<number>(0)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [history, currentSubscription, weeklyCount] = await Promise.all([
          loadChatHistory(),
          getCurrentSubscription(),
          getStateSnapshot<number>('weekly_message_count'),
        ])

        setMessages(history.messages)
        setSubscription(currentSubscription)
        setWeeklyMessageCount(weeklyCount ?? 0)
      } catch (error) {
        console.error('Failed loading usage stats data:', error)
      }
    }

    void loadData()
  }, [])

  const isPremium = subscription && subscription.status === 'active' && subscription.planName !== 'FREE'

  const stats = useMemo(() => {
    const now = new Date()
    const allMessages = messages || []
    
    let startDate: Date
    switch (timeRange) {
      case '7days':
        startDate = subWeeks(now, 1)
        break
      case '30days':
        startDate = subWeeks(now, 4)
        break
      case '90days':
        startDate = subWeeks(now, 12)
        break
      case 'all':
        startDate = new Date(0)
        break
    }

    const filteredMessages = allMessages.filter(msg => {
      const msgDate = parseISO(msg.timestamp)
      return msgDate >= startDate
    })

    const totalMessages = filteredMessages.length
    const userMessages = filteredMessages.filter(m => m.role === 'user').length
    const aiMessages = filteredMessages.filter(m => m.role === 'assistant').length

    const dailyBreakdown: Record<string, DailyStats> = {}
    filteredMessages.forEach(msg => {
      const date = format(parseISO(msg.timestamp), 'yyyy-MM-dd')
      if (!dailyBreakdown[date]) {
        dailyBreakdown[date] = {
          date,
          messageCount: 0,
          userMessages: 0,
          aiMessages: 0,
        }
      }
      dailyBreakdown[date].messageCount++
      if (msg.role === 'user') dailyBreakdown[date].userMessages++
      if (msg.role === 'assistant') dailyBreakdown[date].aiMessages++
    })

    const dailyStats = Object.values(dailyBreakdown).sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )

    const weeklyBreakdown: WeeklyStats[] = []
    for (let i = 0; i < 12; i++) {
      const weekStart = startOfWeek(subWeeks(now, i), { weekStartsOn: 1 })
      const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 })
      
      const weekMessages = allMessages.filter(msg => {
        const msgDate = parseISO(msg.timestamp)
        return isWithinInterval(msgDate, { start: weekStart, end: weekEnd })
      })

      weeklyBreakdown.push({
        weekStart: format(weekStart, 'MMM dd'),
        weekEnd: format(weekEnd, 'MMM dd'),
        messageCount: weekMessages.length,
        averagePerDay: weekMessages.length / 7,
      })
    }

    const averagePerDay = totalMessages / Math.max(1, (now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))

    return {
      totalMessages,
      userMessages,
      aiMessages,
      averagePerDay,
      dailyStats,
      weeklyBreakdown: weeklyBreakdown.reverse(),
      filteredMessages,
    }
  }, [messages, timeRange])

  const currentWeekStats = stats.weeklyBreakdown[stats.weeklyBreakdown.length - 1]

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => onNavigate('dashboard')}>
              <ArrowLeft size={24} />
            </Button>
            <div>
              <h1 className="text-3xl font-bold" style={{ fontFamily: 'Sora, sans-serif' }}>
                Usage Statistics
              </h1>
              <p className="text-muted-foreground">
                Track your AI Coach conversation history
              </p>
            </div>
          </div>
          <Select value={timeRange} onValueChange={(val) => setTimeRange(val as TimeRange)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="90days">Last 90 Days</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
        </header>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
              <ChatCircleDots className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalMessages}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.userMessages} sent, {stats.aiMessages} received
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Week</CardTitle>
              <CalendarBlank className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isPremium ? currentWeekStats?.messageCount || 0 : weeklyMessageCount || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {!isPremium && `${Math.max(0, 5 - (weeklyMessageCount || 0))} remaining`}
                {isPremium && 'Unlimited messages'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Daily Average</CardTitle>
              <TrendUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.averagePerDay.toFixed(1)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Messages per day
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Plan Status</CardTitle>
              <Sparkle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isPremium ? 'Premium' : 'Free'}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {isPremium ? 'Unlimited access' : 'Limited to 5/week'}
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="weekly">Weekly Breakdown</TabsTrigger>
            <TabsTrigger value="messages">Message History</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Daily Activity</CardTitle>
                <CardDescription>Your message volume over time</CardDescription>
              </CardHeader>
              <CardContent>
                {stats.dailyStats.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <ChatCircleDots size={48} className="mx-auto mb-4 opacity-20" />
                    <p>No messages yet. Start a conversation with your AI Coach!</p>
                    <Button onClick={() => onNavigate('ai-coach')} className="mt-4">
                      Open AI Coach
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {stats.dailyStats.slice(0, 14).map((day) => (
                      <div key={day.date} className="flex items-center gap-4">
                        <div className="w-24 text-sm text-muted-foreground">
                          {format(parseISO(day.date), 'MMM dd')}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <div 
                              className="h-8 bg-accent rounded-md flex items-center justify-center text-xs font-medium transition-all"
                              style={{ 
                                width: `${Math.max(40, (day.messageCount / Math.max(...stats.dailyStats.map(d => d.messageCount))) * 100)}%` 
                              }}
                            >
                              {day.messageCount}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-4 text-xs text-muted-foreground w-32">
                          <span className="flex items-center gap-1">
                            <UserIcon size={12} /> {day.userMessages}
                          </span>
                          <span className="flex items-center gap-1">
                            <Robot size={12} /> {day.aiMessages}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {!isPremium && (
              <Card className="bg-gradient-to-r from-secondary/20 to-accent/20 border-secondary/30">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-2">Upgrade for Unlimited Insights</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        Get unlimited AI Coach conversations, advanced analytics, and priority support
                      </p>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2">
                          <ChatCircleDots size={16} className="text-accent" />
                          <span>Unlimited AI messages</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <ChartLine size={16} className="text-accent" />
                          <span>Advanced usage analytics</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Sparkle size={16} className="text-accent" weight="fill" />
                          <span>Deeper relationship insights</span>
                        </li>
                      </ul>
                    </div>
                    <Button onClick={() => onNavigate('pricing')} size="lg" className="gap-2 w-full lg:w-auto whitespace-nowrap">
                      <Sparkle size={18} weight="fill" />
                      Upgrade Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="weekly" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Trends</CardTitle>
                <CardDescription>12-week conversation history</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.weeklyBreakdown.map((week, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium">
                          {week.weekStart} - {week.weekEnd}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{week.messageCount} messages</span>
                          <span className="text-xs">~{week.averagePerDay.toFixed(1)}/day</span>
                        </div>
                      </div>
                      <div className="h-3 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-accent rounded-full transition-all"
                          style={{ 
                            width: `${Math.min(100, (week.messageCount / Math.max(...stats.weeklyBreakdown.map(w => w.messageCount)) * 100))}%` 
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="messages" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Conversation History</CardTitle>
                <CardDescription>
                  {stats.filteredMessages.length} messages in selected period
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px] pr-4">
                  {stats.filteredMessages.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <ChatCircleDots size={48} className="mx-auto mb-4 opacity-20" />
                      <p>No conversation history in this time range</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {stats.filteredMessages
                        .slice()
                        .reverse()
                        .map((message) => (
                          <div
                            key={message.id}
                            className={`flex gap-3 ${
                              message.role === 'user' ? 'justify-end' : 'justify-start'
                            }`}
                          >
                            {message.role === 'assistant' && (
                              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                                <Robot size={18} weight="bold" className="text-accent-foreground" />
                              </div>
                            )}
                            <div
                              className={`max-w-[70%] rounded-2xl p-4 ${
                                message.role === 'user'
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-card border border-border'
                              }`}
                            >
                              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                              <div className="flex items-center gap-2 mt-2 text-xs opacity-70">
                                <Clock size={12} />
                                <span>
                                  {format(parseISO(message.timestamp), 'MMM dd, h:mm a')}
                                </span>
                              </div>
                            </div>
                            {message.role === 'user' && (
                              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                                <UserIcon size={18} weight="bold" className="text-primary-foreground" />
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
