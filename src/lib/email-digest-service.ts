import type { 
  User, 
  RISScore, 
  WeeklyInsight, 
  ScoreHistory, 
  MicroActionCompletion,
  CheckIn,
  PillarType 
} from './types'

export interface EmailDigestData {
  user: User
  weekNumber: number
  dateRange: {
    start: string
    end: string
  }
  scoreProgress: {
    current: RISScore
    previous: RISScore
    change: number
    trend: 'up' | 'down' | 'stable'
  }
  weeklyInsight: WeeklyInsight | null
  achievements: {
    checkInsCompleted: number
    microActionsCompleted: number
    newAssessmentsCompleted: number
    aiConversations: number
  }
  topPatterns: Array<{
    pattern: string
    frequency: number
    pillar: PillarType
  }>
  nextSteps: string[]
  motivationalMessage: string
}

export interface EmailPreferences {
  userId: string
  enableWeeklyDigest: boolean
  digestDay: 'monday' | 'sunday'
  digestTime: string
  includeScoreProgress: boolean
  includeInsights: boolean
  includeMicroActions: boolean
  includePatterns: boolean
}

class EmailDigestService {
  private async getWeekNumber(): Promise<number> {
    const now = new Date()
    const start = new Date(now.getFullYear(), 0, 0)
    const diff = now.getTime() - start.getTime()
    const oneDay = 1000 * 60 * 60 * 24
    return Math.floor(diff / oneDay / 7)
  }

  private getWeekDateRange(): { start: string; end: string } {
    const now = new Date()
    const dayOfWeek = now.getDay()
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
    
    const monday = new Date(now)
    monday.setDate(now.getDate() + diff)
    monday.setHours(0, 0, 0, 0)
    
    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)
    sunday.setHours(23, 59, 59, 999)
    
    return {
      start: monday.toISOString(),
      end: sunday.toISOString()
    }
  }

  async generateDigestData(userId: string): Promise<EmailDigestData> {
    const weekNumber = await this.getWeekNumber()
    const dateRange = this.getWeekDateRange()
    
    const user = this.getUser(userId)
    const currentScore = await this.getCurrentScore(userId)
    const previousScore = await this.getPreviousWeekScore(userId)
    const weeklyInsight = await this.getLatestWeeklyInsight(userId)
    const achievements = await this.getWeeklyAchievements(userId, dateRange)
    const topPatterns = await this.getTopPatterns(userId, dateRange)
    const scoreChange = currentScore.overall - previousScore.overall
    
    const trend: 'up' | 'down' | 'stable' = 
      scoreChange > 1 ? 'up' : 
      scoreChange < -1 ? 'down' : 
      'stable'
    
    const nextSteps = await this.generateNextSteps(
      currentScore, 
      weeklyInsight, 
      topPatterns,
      achievements
    )
    
    const motivationalMessage = this.generateMotivationalMessage(
      trend,
      scoreChange,
      achievements
    )

    return {
      user,
      weekNumber,
      dateRange,
      scoreProgress: {
        current: currentScore,
        previous: previousScore,
        change: scoreChange,
        trend
      },
      weeklyInsight,
      achievements,
      topPatterns,
      nextSteps,
      motivationalMessage
    }
  }

  private getUser(userId: string): User {
    const userJson = localStorage.getItem('lovespark-user')
    if (userJson) {
      const user = JSON.parse(userJson)
      if (user.id === userId) return user
    }
    
    throw new Error('User not found')
  }

  private async getCurrentScore(userId: string): Promise<RISScore> {
    const scoreJson = localStorage.getItem('lovespark-ris-score')
    if (scoreJson) {
      return JSON.parse(scoreJson)
    }
    
    return {
      overall: 0,
      understand: 0,
      align: 0,
      elevate: 0,
      lastUpdated: new Date().toISOString()
    }
  }

  private async getPreviousWeekScore(userId: string): Promise<RISScore> {
    const historyJson = localStorage.getItem('lovespark-score-history')
    if (historyJson) {
      const history: ScoreHistory[] = JSON.parse(historyJson)
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
      
      const previousScore = history
        .filter(h => new Date(h.recordedAt) <= oneWeekAgo)
        .sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime())[0]
      
      if (previousScore) {
        return {
          overall: previousScore.score,
          understand: previousScore.understand,
          align: previousScore.align,
          elevate: previousScore.elevate,
          lastUpdated: previousScore.recordedAt
        }
      }
    }
    
    return await this.getCurrentScore(userId)
  }

  private async getLatestWeeklyInsight(userId: string): Promise<WeeklyInsight | null> {
    const insightsJson = localStorage.getItem('lovespark-weekly-insights')
    if (insightsJson) {
      const insights: WeeklyInsight[] = JSON.parse(insightsJson)
      const userInsights = insights
        .filter(i => i.userId === userId)
        .sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime())
      
      return userInsights[0] || null
    }
    
    return null
  }

  private async getWeeklyAchievements(
    userId: string, 
    dateRange: { start: string; end: string }
  ): Promise<EmailDigestData['achievements']> {
    const checkInsJson = localStorage.getItem('lovespark-check-ins')
    const microActionsJson = localStorage.getItem('lovespark-micro-action-completions')
    const messagesJson = localStorage.getItem('lovespark-ai-messages')
    
    let checkInsCompleted = 0
    if (checkInsJson) {
      const checkIns: CheckIn[] = JSON.parse(checkInsJson)
      checkInsCompleted = checkIns.filter(c => 
        c.userId === userId &&
        new Date(c.completedAt) >= new Date(dateRange.start) &&
        new Date(c.completedAt) <= new Date(dateRange.end)
      ).length
    }
    
    let microActionsCompleted = 0
    if (microActionsJson) {
      const completions: MicroActionCompletion[] = JSON.parse(microActionsJson)
      microActionsCompleted = completions.filter(c => 
        c.userId === userId &&
        new Date(c.completedAt) >= new Date(dateRange.start) &&
        new Date(c.completedAt) <= new Date(dateRange.end)
      ).length
    }
    
    let aiConversations = 0
    if (messagesJson) {
      const messages = JSON.parse(messagesJson)
      const userMessages = messages.filter((m: any) => 
        m.role === 'user' &&
        new Date(m.timestamp) >= new Date(dateRange.start) &&
        new Date(m.timestamp) <= new Date(dateRange.end)
      )
      aiConversations = userMessages.length
    }
    
    return {
      checkInsCompleted,
      microActionsCompleted,
      newAssessmentsCompleted: 0,
      aiConversations
    }
  }

  private async getTopPatterns(
    userId: string,
    dateRange: { start: string; end: string }
  ): Promise<Array<{ pattern: string; frequency: number; pillar: PillarType }>> {
    const patternsJson = localStorage.getItem('lovespark-detected-patterns')
    if (patternsJson) {
      const patterns = JSON.parse(patternsJson)
      const recentPatterns = patterns.filter((p: any) =>
        p.userId === userId &&
        new Date(p.detectedAt) >= new Date(dateRange.start) &&
        new Date(p.detectedAt) <= new Date(dateRange.end)
      )
      
      const patternCounts = new Map<string, { count: number; pillar: PillarType }>()
      recentPatterns.forEach((p: any) => {
        const existing = patternCounts.get(p.pattern) || { count: 0, pillar: p.pillar }
        patternCounts.set(p.pattern, { count: existing.count + 1, pillar: p.pillar })
      })
      
      return Array.from(patternCounts.entries())
        .map(([pattern, data]) => ({ pattern, frequency: data.count, pillar: data.pillar }))
        .sort((a, b) => b.frequency - a.frequency)
        .slice(0, 3)
    }
    
    return []
  }

  private async generateNextSteps(
    score: RISScore,
    insight: WeeklyInsight | null,
    patterns: Array<{ pattern: string; pillar: PillarType }>,
    achievements: EmailDigestData['achievements']
  ): Promise<string[]> {
    const steps: string[] = []
    
    if (achievements.checkInsCompleted === 0) {
      steps.push('Complete your weekly check-in to track progress')
    }
    
    const lowestPillar = this.getLowestPillar(score)
    if (lowestPillar) {
      const pillarNames = {
        understand: 'Understanding',
        align: 'Alignment',
        elevate: 'Elevation'
      }
      steps.push(`Focus on ${pillarNames[lowestPillar]} to improve your overall score`)
    }
    
    if (patterns.length > 0) {
      steps.push(`Explore the recurring pattern: "${patterns[0].pattern}"`)
    }
    
    if (insight && !insight.read) {
      steps.push('Review your personalized weekly insight')
    }
    
    if (achievements.microActionsCompleted < 3) {
      steps.push('Try completing at least 3 micro-actions this week')
    }
    
    if (steps.length === 0) {
      steps.push('Continue your amazing progress with daily reflections')
    }
    
    return steps.slice(0, 3)
  }

  private getLowestPillar(score: RISScore): PillarType | null {
    const pillars = [
      { name: 'understand' as PillarType, score: score.understand },
      { name: 'align' as PillarType, score: score.align },
      { name: 'elevate' as PillarType, score: score.elevate }
    ]
    
    const lowest = pillars.reduce((min, p) => p.score < min.score ? p : min)
    return lowest.name
  }

  private generateMotivationalMessage(
    trend: 'up' | 'down' | 'stable',
    change: number,
    achievements: EmailDigestData['achievements']
  ): string {
    const messages = {
      up: [
        `Incredible progress! Your score increased by ${Math.abs(change)} points this week.`,
        `You're on fire! Keep up the momentum with ${Math.abs(change)} points gained.`,
        `Outstanding growth! ${Math.abs(change)} points higher shows real commitment.`
      ],
      down: [
        'Every relationship has natural fluctuations. Focus on consistency this week.',
        'Growth isn\'t always linear. Use this week\'s insights to refocus.',
        'Small setbacks create space for bigger breakthroughs. Keep going.'
      ],
      stable: [
        'Consistency is key. You\'re building strong foundations.',
        'Steady progress shows maturity. Keep nurturing your growth.',
        'Maintaining your score takes dedication. Well done.'
      ]
    }
    
    const baseMessage = messages[trend][Math.floor(Math.random() * messages[trend].length)]
    
    if (achievements.checkInsCompleted > 0 || achievements.microActionsCompleted > 0) {
      return `${baseMessage} Your consistent effort is making a difference.`
    }
    
    return baseMessage
  }

  async getEmailPreferences(userId: string): Promise<EmailPreferences> {
    const prefsJson = localStorage.getItem(`lovespark-email-prefs-${userId}`)
    if (prefsJson) {
      return JSON.parse(prefsJson)
    }
    
    return {
      userId,
      enableWeeklyDigest: true,
      digestDay: 'monday',
      digestTime: '09:00',
      includeScoreProgress: true,
      includeInsights: true,
      includeMicroActions: true,
      includePatterns: true
    }
  }

  async updateEmailPreferences(prefs: EmailPreferences): Promise<void> {
    localStorage.setItem(`lovespark-email-prefs-${prefs.userId}`, JSON.stringify(prefs))
  }

  generateEmailHTML(data: EmailDigestData): string {
    const { user, weekNumber, dateRange, scoreProgress, weeklyInsight, achievements, topPatterns, nextSteps, motivationalMessage } = data
    
    const formatDate = (isoString: string) => {
      return new Date(isoString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    }
    
    const trendEmoji = scoreProgress.trend === 'up' ? '📈' : scoreProgress.trend === 'down' ? '📉' : '➡️'
    const trendColor = scoreProgress.trend === 'up' ? '#10b981' : scoreProgress.trend === 'down' ? '#f59e0b' : '#64748b'
    
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Weekly Relationship Intelligence Digest</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background-color: #FFF7F8;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #FFF7F8; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(225, 29, 72, 0.08);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #E11D48 0%, #F43F5E 50%, #FB7185 100%); padding: 40px 32px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600; font-family: 'Sora', sans-serif;">
                ✨ Your Weekly Digest
              </h1>
              <p style="margin: 12px 0 0; color: rgba(255, 255, 255, 0.95); font-size: 16px;">
                Week ${weekNumber} • ${formatDate(dateRange.start)} - ${formatDate(dateRange.end)}
              </p>
            </td>
          </tr>
          
          <!-- Motivational Message -->
          <tr>
            <td style="padding: 32px; background-color: #FFF7F8; border-bottom: 1px solid #F1F5F9;">
              <p style="margin: 0; font-size: 18px; line-height: 1.6; color: #0F172A; text-align: center; font-weight: 500;">
                ${motivationalMessage}
              </p>
            </td>
          </tr>
          
          <!-- Score Progress -->
          <tr>
            <td style="padding: 32px;">
              <h2 style="margin: 0 0 24px; font-size: 20px; font-weight: 600; color: #0F172A; font-family: 'Sora', sans-serif;">
                ${trendEmoji} Score Progress
              </h2>
              
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="text-align: center; padding: 24px; background: linear-gradient(135deg, rgba(225, 29, 72, 0.05) 0%, rgba(251, 113, 133, 0.05) 100%); border-radius: 12px;">
                    <div style="font-size: 48px; font-weight: 700; color: #E11D48; margin-bottom: 8px;">
                      ${scoreProgress.current.overall}
                    </div>
                    <div style="font-size: 14px; color: #64748B; margin-bottom: 16px;">
                      Relationship Intelligence Score
                    </div>
                    <div style="display: inline-block; padding: 6px 16px; background-color: ${trendColor}15; color: ${trendColor}; border-radius: 20px; font-size: 14px; font-weight: 600;">
                      ${scoreProgress.change > 0 ? '+' : ''}${scoreProgress.change.toFixed(1)} points
                    </div>
                  </td>
                </tr>
              </table>
              
              <!-- Pillar Scores -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 24px;">
                <tr>
                  <td style="padding: 12px; background-color: rgba(101, 90, 230, 0.08); border-radius: 8px; width: 32%; vertical-align: top;">
                    <div style="font-size: 12px; color: #64748B; margin-bottom: 4px;">UNDERSTAND</div>
                    <div style="font-size: 24px; font-weight: 600; color: #655AE6;">${scoreProgress.current.understand}</div>
                  </td>
                  <td style="width: 2%;"></td>
                  <td style="padding: 12px; background-color: rgba(236, 72, 153, 0.08); border-radius: 8px; width: 32%; vertical-align: top;">
                    <div style="font-size: 12px; color: #64748B; margin-bottom: 4px;">ALIGN</div>
                    <div style="font-size: 24px; font-weight: 600; color: #EC4899;">${scoreProgress.current.align}</div>
                  </td>
                  <td style="width: 2%;"></td>
                  <td style="padding: 12px; background-color: rgba(34, 197, 94, 0.08); border-radius: 8px; width: 32%; vertical-align: top;">
                    <div style="font-size: 12px; color: #64748B; margin-bottom: 4px;">ELEVATE</div>
                    <div style="font-size: 24px; font-weight: 600; color: #22C55E;">${scoreProgress.current.elevate}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          ${weeklyInsight ? `
          <!-- Weekly Insight -->
          <tr>
            <td style="padding: 32px; background-color: #FFF7F8; border-top: 1px solid #F1F5F9;">
              <h2 style="margin: 0 0 16px; font-size: 20px; font-weight: 600; color: #0F172A; font-family: 'Sora', sans-serif;">
                💡 This Week's Insight
              </h2>
              <div style="background-color: #ffffff; padding: 20px; border-radius: 12px; border-left: 4px solid #E11D48;">
                <p style="margin: 0 0 12px; font-size: 16px; line-height: 1.6; color: #0F172A; font-weight: 500;">
                  ${weeklyInsight.patternObservation}
                </p>
                <div style="margin-top: 16px; padding: 12px; background-color: #F59E0B15; border-radius: 8px;">
                  <div style="font-size: 12px; color: #F59E0B; font-weight: 600; margin-bottom: 6px;">MICRO-ACTION</div>
                  <div style="font-size: 14px; color: #0F172A;">${weeklyInsight.microAction}</div>
                </div>
                <div style="margin-top: 12px; padding: 12px; background-color: #655AE615; border-radius: 8px;">
                  <div style="font-size: 12px; color: #655AE6; font-weight: 600; margin-bottom: 6px;">REFLECTION</div>
                  <div style="font-size: 14px; color: #0F172A;">${weeklyInsight.reflectionQuestion}</div>
                </div>
              </div>
            </td>
          </tr>
          ` : ''}
          
          <!-- Achievements -->
          <tr>
            <td style="padding: 32px; border-top: 1px solid #F1F5F9;">
              <h2 style="margin: 0 0 16px; font-size: 20px; font-weight: 600; color: #0F172A; font-family: 'Sora', sans-serif;">
                🎯 This Week's Activity
              </h2>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 16px; background-color: #FFF7F8; border-radius: 8px; width: 48%; vertical-align: top;">
                    <div style="font-size: 32px; font-weight: 700; color: #E11D48;">${achievements.checkInsCompleted}</div>
                    <div style="font-size: 14px; color: #64748B;">Check-ins completed</div>
                  </td>
                  <td style="width: 4%;"></td>
                  <td style="padding: 16px; background-color: #FFF7F8; border-radius: 8px; width: 48%; vertical-align: top;">
                    <div style="font-size: 32px; font-weight: 700; color: #E11D48;">${achievements.microActionsCompleted}</div>
                    <div style="font-size: 14px; color: #64748B;">Micro-actions done</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          ${topPatterns.length > 0 ? `
          <!-- Top Patterns -->
          <tr>
            <td style="padding: 32px; background-color: #FFF7F8; border-top: 1px solid #F1F5F9;">
              <h2 style="margin: 0 0 16px; font-size: 20px; font-weight: 600; color: #0F172A; font-family: 'Sora', sans-serif;">
                🔍 Patterns Detected
              </h2>
              ${topPatterns.map(p => `
              <div style="margin-bottom: 12px; padding: 16px; background-color: #ffffff; border-radius: 8px; border-left: 3px solid #E11D48;">
                <div style="font-size: 16px; color: #0F172A; font-weight: 500;">${p.pattern}</div>
                <div style="font-size: 13px; color: #64748B; margin-top: 4px;">Appeared ${p.frequency} time${p.frequency > 1 ? 's' : ''} • ${p.pillar.toUpperCase()}</div>
              </div>
              `).join('')}
            </td>
          </tr>
          ` : ''}
          
          <!-- Next Steps -->
          <tr>
            <td style="padding: 32px; border-top: 1px solid #F1F5F9;">
              <h2 style="margin: 0 0 16px; font-size: 20px; font-weight: 600; color: #0F172A; font-family: 'Sora', sans-serif;">
                📋 Your Next Steps
              </h2>
              ${nextSteps.map((step, idx) => `
              <div style="margin-bottom: 12px; padding: 16px; background-color: #FFF7F8; border-radius: 8px; display: flex; align-items: start;">
                <div style="width: 28px; height: 28px; background: linear-gradient(135deg, #E11D48, #F43F5E); color: white; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-weight: 600; font-size: 14px; flex-shrink: 0; margin-right: 12px;">
                  ${idx + 1}
                </div>
                <div style="font-size: 15px; color: #0F172A; line-height: 1.5; padding-top: 4px;">
                  ${step}
                </div>
              </div>
              `).join('')}
            </td>
          </tr>
          
          <!-- CTA -->
          <tr>
            <td style="padding: 32px; text-align: center; background: linear-gradient(135deg, rgba(225, 29, 72, 0.05) 0%, rgba(251, 113, 133, 0.05) 100%); border-top: 1px solid #F1F5F9;">
              <a href="#" style="display: inline-block; padding: 16px 48px; background: linear-gradient(135deg, #E11D48 0%, #F43F5E 50%, #FB7185 100%); color: #ffffff; text-decoration: none; border-radius: 999px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(225, 29, 72, 0.3);">
                Open LoveSpark Dashboard
              </a>
              <p style="margin: 16px 0 0; font-size: 14px; color: #64748B;">
                Continue your relationship growth journey
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; text-align: center; background-color: #F8FAFC; border-top: 1px solid #F1F5F9;">
              <p style="margin: 0 0 8px; font-size: 12px; color: #64748B;">
                You're receiving this because you enabled weekly digests.
              </p>
              <p style="margin: 0; font-size: 12px;">
                <a href="#" style="color: #E11D48; text-decoration: none;">Update preferences</a> •
                <a href="#" style="color: #64748B; text-decoration: none;">Unsubscribe</a>
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim()
  }
}

export const emailDigestService = new EmailDigestService()
