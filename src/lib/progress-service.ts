import type { 
  ScoreHistory, 
  WeeklyInsight, 
  MicroAction, 
  MicroActionCompletion, 
  RecurringPattern,
  UserStage,
  RISScore,
  PillarType 
} from './types'

declare const spark: {
  llmPrompt: (strings: TemplateStringsArray, ...values: any[]) => string
  llm: (prompt: string, model?: string, jsonMode?: boolean) => Promise<string>
}

export class ProgressService {
  static MICRO_ACTIONS: MicroAction[] = [
    {
      id: 'emotional-pause',
      label: 'Practiced emotional pause',
      description: 'Took a moment before reacting to emotional triggers',
      pillar: 'understand',
      order: 1
    },
    {
      id: 'clarified-expectations',
      label: 'Clarified expectations',
      description: 'Had a conversation to align expectations with partner',
      pillar: 'align',
      order: 2
    },
    {
      id: 'reflective-question',
      label: 'Asked reflective question',
      description: 'Asked yourself or partner a deeper reflective question',
      pillar: 'elevate',
      order: 3
    }
  ]

  static getCurrentWeekNumber(): number {
    const now = new Date()
    const start = new Date(now.getFullYear(), 0, 0)
    const diff = now.getTime() - start.getTime()
    const oneDay = 1000 * 60 * 60 * 24
    return Math.floor(diff / oneDay / 7)
  }

  static determineUserStage(risScore: RISScore): UserStage {
    const { understand, align, elevate } = risScore

    if (understand < 60) {
      return 'understand'
    } else if (align < 60) {
      return 'align'
    } else if (elevate < 60) {
      return 'elevate'
    } else {
      const lowest = Math.min(understand, align, elevate)
      if (lowest === understand) return 'understand'
      if (lowest === align) return 'align'
      return 'elevate'
    }
  }

  static getStageDescription(stage: UserStage): string {
    switch (stage) {
      case 'understand':
        return 'Build self-awareness through pattern recognition'
      case 'align':
        return 'Create connection through clear communication'
      case 'elevate':
        return 'Maintain growth through consistent practice'
    }
  }

  static async generateInsight(
    userId: string,
    risScore: RISScore,
    recentMessages: any[]
  ): Promise<Partial<WeeklyInsight>> {
    const stage = this.determineUserStage(risScore)
    const weekNumber = this.getCurrentWeekNumber()

    const prompt = spark.llmPrompt`You are a relationship intelligence coach. Generate a weekly insight for a user.

Current RIS Score: ${risScore.overall}
- Understand: ${risScore.understand}
- Align: ${risScore.align}
- Elevate: ${risScore.elevate}

Current Stage: ${stage.toUpperCase()}

Recent conversation topics: ${recentMessages.slice(0, 5).map((m: any) => m.content).join('; ')}

Generate a structured weekly insight with EXACTLY these three parts:
1. Pattern Observation (one clear behavioral pattern you notice - 2 sentences max)
2. Micro-Action (one specific, actionable thing they can do this week - 1 sentence)
3. Reflection Question (one thought-provoking question - 1 sentence)

Return ONLY valid JSON in this format:
{
  "patternObservation": "string",
  "microAction": "string", 
  "reflectionQuestion": "string"
}`

    try {
      const response = await spark.llm(prompt, 'gpt-4o', true)
      const insight = JSON.parse(response)
      
      return {
        userId,
        weekNumber,
        generatedAt: new Date().toISOString(),
        patternObservation: insight.patternObservation,
        microAction: insight.microAction,
        reflectionQuestion: insight.reflectionQuestion,
        read: false,
        pillarFocus: stage
      }
    } catch (error) {
      console.error('Failed to generate insight:', error)
      return {
        userId,
        weekNumber,
        generatedAt: new Date().toISOString(),
        patternObservation: 'You\'re showing consistent engagement with your relationship growth.',
        microAction: 'This week, pause before reacting to a moment of tension.',
        reflectionQuestion: 'What would change if you approached conflict with curiosity instead of defense?',
        read: false,
        pillarFocus: stage
      }
    }
  }

  static detectRecurringPatterns(messages: any[]): { pattern: string; frequency: number; relatedIds: string[] }[] {
    const keywords: Record<string, string[]> = {
      'Communication breakdown': ['misunderstand', 'unclear', 'confused', 'didn\'t get', 'mixed signals'],
      'Emotional reactivity': ['angry', 'frustrated', 'upset', 'triggered', 'defensive'],
      'Expectation mismatch': ['expected', 'thought you would', 'assumed', 'disappointed', 'let down'],
      'Avoidance pattern': ['avoid', 'ignore', 'withdraw', 'shut down', 'distance'],
      'Timing issues': ['wrong time', 'not now', 'busy', 'timing', 'when you\'re'],
    }

    const patterns: { pattern: string; frequency: number; relatedIds: string[] }[] = []

    for (const [patternName, terms] of Object.entries(keywords)) {
      const relatedMessages = messages.filter(m => 
        m.role === 'user' && terms.some(term => 
          m.content.toLowerCase().includes(term.toLowerCase())
        )
      )

      if (relatedMessages.length >= 3) {
        patterns.push({
          pattern: patternName,
          frequency: relatedMessages.length,
          relatedIds: relatedMessages.map(m => m.id)
        })
      }
    }

    return patterns.sort((a, b) => b.frequency - a.frequency)
  }

  static shouldShowCoachingSuggestion(
    scoreHistory: ScoreHistory[],
    recurringPatterns: RecurringPattern[],
    weeksSinceLastChange: number
  ): { show: boolean; reason?: string } {
    if (scoreHistory.length >= 3) {
      const recent = scoreHistory.slice(-3)
      const scoreDiffs = recent.map((s, i) => i > 0 ? s.score - recent[i - 1].score : 0)
      const isStagnant = scoreDiffs.slice(1).every(diff => Math.abs(diff) < 2)
      
      if (isStagnant) {
        return {
          show: true,
          reason: 'Your score has remained steady. A coaching session could help identify your next growth area.'
        }
      }
    }

    const highFrequencyPatterns = recurringPatterns.filter(p => p.frequency >= 5 && !p.acknowledged)
    if (highFrequencyPatterns.length > 0) {
      return {
        show: true,
        reason: `You've mentioned "${highFrequencyPatterns[0].pattern.toLowerCase()}" multiple times. A coach could help you break this pattern.`
      }
    }

    return { show: false }
  }

  static getGrowthOpportunityMessage(risScore: RISScore, stage: UserStage): string {
    const { understand, align, elevate } = risScore
    
    if (stage === 'understand' && understand < 60) {
      return 'Growth opportunity detected in self-awareness'
    } else if (stage === 'align' && align < 60) {
      return 'Growth opportunity detected in communication alignment'
    } else if (stage === 'elevate' && elevate < 60) {
      return 'Growth opportunity detected in habit consistency'
    }
    
    const lowest = Math.min(understand, align, elevate)
    if (lowest === understand) return 'Growth opportunity detected in understanding patterns'
    if (lowest === align) return 'Growth opportunity detected in relationship alignment'
    return 'Growth opportunity detected in elevating practices'
  }
}
