import type { RISScore, PillarType, Insight, AssessmentResponse } from './types'

export async function generateInsightsFromCheckIn(
  userId: string,
  risScore: RISScore,
  responses: AssessmentResponse[],
  weekNumber: number
): Promise<Insight[]> {
  const responseSummary = responses
    .map((r) => `${r.questionId}: ${r.value}`)
    .join(', ')

  const prompt = spark.llmPrompt`You are an AI relationship intelligence analyst for LoveSpark. Analyze this weekly check-in and generate 2-3 actionable insights.

User's RIS Score: ${risScore.overall}/100
Pillar Scores - UNDERSTAND: ${risScore.understand}, ALIGN: ${risScore.align}, ELEVATE: ${risScore.elevate}
Week Number: ${weekNumber}
Check-in Responses: ${responseSummary}
Score Delta: ${risScore.delta ? `${risScore.delta > 0 ? '+' : ''}${risScore.delta}` : 'Initial'}

Generate insights that are:
- Analytical and data-driven, not therapeutic
- Specific and actionable
- Focus on patterns and behavioral optimization
- Appropriate tone: warm but precise, like a sophisticated coach

Return a JSON object with this structure:
{
  "insights": [
    {
      "type": "pattern" | "suggestion" | "warning" | "celebration",
      "pillar": "understand" | "align" | "elevate",
      "title": "Brief insight title (5-8 words)",
      "content": "Detailed insight (2-3 sentences)",
      "actionable": "Specific next step recommendation"
    }
  ]
}`

  try {
    const response = await spark.llm(prompt, 'gpt-4o', true)
    const parsed = JSON.parse(response)

    return parsed.insights.map((insight: any) => ({
      id: `insight-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: insight.type,
      pillar: insight.pillar,
      title: insight.title,
      content: insight.content,
      actionable: insight.actionable,
      createdAt: new Date().toISOString(),
      read: false,
    }))
  } catch (error) {
    return getFallbackInsights(risScore)
  }
}

export async function generateAICoachResponse(
  message: string,
  risScore: RISScore,
  activePillar?: PillarType,
  recentCheckIn?: boolean
): Promise<string> {
  const contextInfo = `
RIS Score: ${risScore.overall}/100
Pillar Breakdown:
- UNDERSTAND: ${risScore.understand}/100
- ALIGN: ${risScore.align}/100  
- ELEVATE: ${risScore.elevate}/100
${risScore.delta !== undefined ? `Recent Change: ${risScore.delta > 0 ? '+' : ''}${risScore.delta}` : ''}
${activePillar ? `Currently viewing: ${activePillar.toUpperCase()} module` : ''}
${recentCheckIn ? 'Just completed weekly check-in' : ''}
`

  const prompt = spark.llmPrompt`You are an AI Relationship Intelligence Coach for LoveSpark. You help users optimize their relationship patterns through data-driven insights.

Your tone is:
- Analytical yet warm
- Precise and non-judgmental
- Focus on behavioral patterns, not therapy
- Use "relationship intelligence" language, not clinical terms

Current User Context:
${contextInfo}

User Message: ${message}

Provide a helpful, actionable response (2-4 sentences). If relevant, suggest specific exercises, assessments, or protocols from their pillar modules.`

  try {
    const response = await spark.llm(prompt, 'gpt-4o', false)
    return response
  } catch (error) {
    return "I'm processing your request. Could you rephrase that or ask about a specific area of your relationship intelligence?"
  }
}

export async function generateWeeklyBrief(
  risScore: RISScore,
  weekNumber: number,
  recentInsights: Insight[]
): Promise<{
  highlights: string[]
  focusArea: PillarType
  suggestedProtocols: string[]
  insights: string[]
}> {
  const lowestPillar: PillarType =
    risScore.understand <= risScore.align && risScore.understand <= risScore.elevate
      ? 'understand'
      : risScore.align <= risScore.elevate
        ? 'align'
        : 'elevate'

  const insightsSummary = recentInsights
    .slice(0, 3)
    .map((i) => i.title)
    .join(', ')

  const prompt = spark.llmPrompt`Generate a weekly optimization brief for a LoveSpark user.

Week ${weekNumber} Data:
- RIS Score: ${risScore.overall}/100 (Change: ${risScore.delta ?? 0})
- UNDERSTAND: ${risScore.understand}
- ALIGN: ${risScore.align}
- ELEVATE: ${risScore.elevate}
- Focus Area: ${lowestPillar.toUpperCase()}
- Recent Insights: ${insightsSummary}

Generate a brief with:
1. 3 highlight bullets (wins and patterns from the week)
2. 2-3 suggested protocols for the focus area
3. 2 key insights for the upcoming week

Return as JSON:
{
  "highlights": ["bullet 1", "bullet 2", "bullet 3"],
  "suggestedProtocols": ["protocol 1", "protocol 2"],
  "insights": ["insight 1", "insight 2"]
}`

  try {
    const response = await spark.llm(prompt, 'gpt-4o', true)
    const parsed = JSON.parse(response)

    return {
      highlights: parsed.highlights,
      focusArea: lowestPillar,
      suggestedProtocols: parsed.suggestedProtocols,
      insights: parsed.insights,
    }
  } catch (error) {
    return {
      highlights: [
        `Your RIS score is ${risScore.overall}/100`,
        `Strongest pillar: ${getStrongestPillar(risScore)}`,
        'Check-in completed this week',
      ],
      focusArea: lowestPillar,
      suggestedProtocols: [
        'Daily Emotional Check-in',
        'Communication Pattern Journal',
      ],
      insights: [
        'Continue building consistency with weekly check-ins',
        `Focus on ${lowestPillar} exercises to balance your score`,
      ],
    }
  }
}

function getFallbackInsights(risScore: RISScore): Insight[] {
  return [
    {
      id: `insight-${Date.now()}-1`,
      type: 'pattern',
      pillar: 'understand',
      title: 'Building Self-Awareness Foundation',
      content:
        'Your check-in shows engagement with emotional awareness. Consistent reflection is building your relationship intelligence baseline.',
      actionable: 'Complete the Emotional Intelligence Profile in the UNDERSTAND module',
      createdAt: new Date().toISOString(),
      read: false,
    },
    {
      id: `insight-${Date.now()}-2`,
      type: 'suggestion',
      pillar: 'elevate',
      title: 'Consistency Drives Growth',
      content:
        'Weekly check-ins are your most powerful tool. Users who maintain streaks see 40% faster RIS improvement.',
      actionable: 'Set a reminder for next week\'s check-in',
      createdAt: new Date().toISOString(),
      read: false,
    },
  ]
}

function getStrongestPillar(risScore: RISScore): string {
  if (
    risScore.understand >= risScore.align &&
    risScore.understand >= risScore.elevate
  ) {
    return 'UNDERSTAND'
  } else if (risScore.align >= risScore.elevate) {
    return 'ALIGN'
  } else {
    return 'ELEVATE'
  }
}
