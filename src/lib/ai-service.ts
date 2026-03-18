import type { RISScore, PillarType, Insight, AssessmentResponse } from './types'

export async function generateCheckInInsights(
  responses: Record<string, number>,
  previousScore: RISScore,
  newScore: RISScore
): Promise<Insight[]> {
  const responseSummary = Object.entries(responses)
    .map(([key, value]) => `${key}: ${value}/100`)
    .join(', ')

  const promptText = `You are an AI relationship intelligence analyst for LoveSpark. Analyze this weekly check-in and generate 2-3 actionable insights.

Previous RIS Score: ${previousScore.overall}/100
New RIS Score: ${newScore.overall}/100
Score Delta: ${newScore.delta ? `${newScore.delta > 0 ? '+' : ''}${newScore.delta}` : '0'}

Pillar Scores:
- UNDERSTAND: ${previousScore.understand} → ${newScore.understand}
- ALIGN: ${previousScore.align} → ${newScore.align}
- ELEVATE: ${previousScore.elevate} → ${newScore.elevate}

Check-in Responses: ${responseSummary}

Generate insights that are:
- Analytical and data-driven, not therapeutic
- Specific and actionable
- Focus on patterns and behavioral optimization
- Appropriate tone: warm but precise, like a sophisticated assistant

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
    const response = await window.spark.llm(promptText, 'gpt-4o', true)
    const parsed = JSON.parse(response)

    return parsed.insights.map((insight: {
      type: 'pattern' | 'suggestion' | 'warning' | 'celebration'
      pillar: PillarType
      title: string
      content: string
      actionable: string
    }) => ({
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
    return getFallbackInsights(newScore)
  }
}

export async function generateInsightsFromCheckIn(
  userId: string,
  risScore: RISScore,
  responses: AssessmentResponse[],
  weekNumber: number
): Promise<Insight[]> {
  const responseSummary = responses
    .map((r) => `${r.questionId}: ${r.value}`)
    .join(', ')

  const promptText = `You are an AI relationship intelligence analyst for LoveSpark. Analyze this weekly check-in and generate 2-3 actionable insights.

User's RIS Score: ${risScore.overall}/100
Pillar Scores - UNDERSTAND: ${risScore.understand}, ALIGN: ${risScore.align}, ELEVATE: ${risScore.elevate}
Week Number: ${weekNumber}
Check-in Responses: ${responseSummary}
Score Delta: ${risScore.delta ? `${risScore.delta > 0 ? '+' : ''}${risScore.delta}` : 'Initial'}

Generate insights that are:
- Analytical and data-driven, not therapeutic
- Specific and actionable
- Focus on patterns and behavioral optimization
- Appropriate tone: warm but precise, like a sophisticated assistant

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
    const response = await window.spark.llm(promptText, 'gpt-4o', true)
    const parsed = JSON.parse(response)

    return parsed.insights.map((insight: {
      type: 'pattern' | 'suggestion' | 'warning' | 'celebration'
      pillar: PillarType
      title: string
      content: string
      actionable: string
    }) => ({
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
  let onboardingContext = ''
  
  try {
    const onboardingProfile = await window.spark.kv.get<{
      primaryPattern: string
      strengths: string[]
      growthEdge: string
      relationshipStatus: string
      relationshipGoal: string
      mainChallenge: string
    }>('lovespark-onboarding-profile')
    
    if (onboardingProfile) {
      onboardingContext = `
Onboarding Profile:
- Relationship Pattern: ${onboardingProfile.primaryPattern}
- Key Strengths: ${onboardingProfile.strengths.join(', ')}
- Growth Edge: ${onboardingProfile.growthEdge}
- Relationship Status: ${onboardingProfile.relationshipStatus}
- Primary Goal: ${onboardingProfile.relationshipGoal}
- Main Challenge: ${onboardingProfile.mainChallenge}
`
    }
  } catch (error) {
    // Onboarding profile not available yet
  }

  const contextInfo = `
RIS Score: ${risScore.overall}/100
Pillar Breakdown:
- UNDERSTAND: ${risScore.understand}/100
- ALIGN: ${risScore.align}/100  
- ELEVATE: ${risScore.elevate}/100
${risScore.delta !== undefined ? `Recent Change: ${risScore.delta > 0 ? '+' : ''}${risScore.delta}` : ''}
${activePillar ? `Currently viewing: ${activePillar.toUpperCase()} module` : ''}
${recentCheckIn ? 'Just completed weekly check-in' : ''}
${onboardingContext}
`

  const promptText = `You are an AI Relationship Intelligence Assistant for LoveSpark. You help users optimize their relationship patterns through data-driven insights.

Your tone is:
- Analytical yet warm
- Precise and non-judgmental
- Focus on behavioral patterns, not therapy
- Use "relationship intelligence" language, not clinical terms
${onboardingContext ? '- Reference their onboarding profile when relevant to provide personalized guidance' : ''}

Current User Context:
${contextInfo}

User Message: ${message}

Provide a helpful, actionable response (2-4 sentences). If relevant, suggest specific exercises, assessments, or protocols from their pillar modules.`

  try {
    const response = await window.spark.llm(promptText, 'gpt-4o', false)
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

  const promptText = `Generate a weekly optimization brief for a LoveSpark user.

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
    const response = await window.spark.llm(promptText, 'gpt-4o', true)
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

export async function generateFollowUpQuestions(
  baseQuestions: Array<{
    id: string
    question: string
    min: string
    max: string
    pillar: PillarType
  }>,
  previousCheckIns: Array<{
    responses: AssessmentResponse[]
    completedAt: string
    risScoreAfter: RISScore
  }>,
  currentResponses: Record<string, number>
): Promise<Array<{
  id: string
  question: string
  min: string
  max: string
  pillar: PillarType
  isFollowUp: boolean
}>> {
  if (previousCheckIns.length === 0) {
    return []
  }

  const recentCheckIns = previousCheckIns.slice(-3)
  
  const trends = analyzeResponseTrends(recentCheckIns, currentResponses)
  
  const promptText = `You are an AI relationship intelligence analyst for LoveSpark. Based on a user's check-in response patterns, generate 2-3 personalized follow-up questions.

Response Trends:
${JSON.stringify(trends, null, 2)}

Current Check-in Context:
${Object.entries(currentResponses).map(([key, value]) => `${key}: ${value}/100`).join('\n')}

Generate follow-up questions that:
- Build on specific patterns noticed in their responses (e.g., consistently low scores in certain areas, improvements, declines)
- Are curious and growth-oriented, not judgmental
- Help uncover deeper insights about their relationship patterns
- Use positive, forward-thinking language
- Are specific to what they've shared, not generic

Return a JSON object with this structure:
{
  "questions": [
    {
      "question": "The personalized question based on their patterns",
      "min": "Lower end label",
      "max": "Upper end label",
      "pillar": "understand" | "align" | "elevate",
      "context": "Brief note about why this question matters for them"
    }
  ]
}

Generate 2-3 questions maximum. Focus on the most meaningful patterns.`

  try {
    const response = await window.spark.llm(promptText, 'gpt-4o', true)
    const parsed = JSON.parse(response)

    return parsed.questions.map((q: any, index: number) => ({
      id: `followup-${Date.now()}-${index}`,
      question: q.question,
      min: q.min,
      max: q.max,
      pillar: q.pillar,
      isFollowUp: true,
    }))
  } catch (error) {
    console.error('Failed to generate follow-up questions:', error)
    return []
  }
}

function analyzeResponseTrends(
  previousCheckIns: Array<{
    responses: AssessmentResponse[]
    completedAt: string
    risScoreAfter: RISScore
  }>,
  currentResponses: Record<string, number>
): any {
  const trends: Record<string, any> = {}

  const questionIds = Object.keys(currentResponses)
  
  questionIds.forEach(questionId => {
    const historicalValues = previousCheckIns
      .map(checkIn => {
        const response = checkIn.responses.find(r => r.questionId === questionId)
        return response ? Number(response.value) : null
      })
      .filter(v => v !== null) as number[]

    if (historicalValues.length > 0) {
      const avg = historicalValues.reduce((a, b) => a + b, 0) / historicalValues.length
      const currentValue = currentResponses[questionId]
      const trend = currentValue > avg + 10 ? 'improving' : currentValue < avg - 10 ? 'declining' : 'stable'
      const consistency = Math.max(...historicalValues) - Math.min(...historicalValues)

      trends[questionId] = {
        average: Math.round(avg),
        current: currentValue,
        trend,
        consistency: consistency < 20 ? 'very consistent' : consistency < 40 ? 'moderate variance' : 'high variance',
        historicalValues,
      }
    }
  })

  const pillarAverages = {
    understand: 0,
    align: 0,
    elevate: 0,
  }
  
  previousCheckIns.forEach(checkIn => {
    pillarAverages.understand += checkIn.risScoreAfter.understand
    pillarAverages.align += checkIn.risScoreAfter.align
    pillarAverages.elevate += checkIn.risScoreAfter.elevate
  })

  Object.keys(pillarAverages).forEach(key => {
    pillarAverages[key as PillarType] = Math.round(
      pillarAverages[key as PillarType] / previousCheckIns.length
    )
  })

  return {
    questionTrends: trends,
    pillarAverages,
    checkInCount: previousCheckIns.length,
    overallTrend: previousCheckIns.length >= 2
      ? previousCheckIns[previousCheckIns.length - 1].risScoreAfter.overall -
        previousCheckIns[0].risScoreAfter.overall
      : 0,
  }
}

export async function generateOnboardingInsight(
  answers: {
    relationshipStatus: string
    relationshipGoal: string
    mainChallenge: string
    communicationStyle: string
    conflictStyle: string
    emotionalAwareness: string
  }
): Promise<{
  primaryPattern: string
  strengths: string[]
  growthEdge: string
  firstInsight: string
  intelligenceScore: number
}> {
  const promptText = `You are an AI relationship intelligence analyst for LoveSpark. A new user has completed their onboarding assessment. Based on their responses, generate a comprehensive psychological profile.

Onboarding Responses:
- Relationship Status: ${answers.relationshipStatus}
- Relationship Goal: ${answers.relationshipGoal}
- Main Challenge: ${answers.mainChallenge}
- Communication Style: ${answers.communicationStyle}
- Conflict Style: ${answers.conflictStyle}
- Emotional Awareness: ${answers.emotionalAwareness}

Generate a profile that:
- Identifies a primary relationship pattern (e.g., "Analytical Protector", "Intuitive Connector", "Structured Builder", "Adaptive Navigator")
- Lists 3 key strengths based on their responses
- Identifies one specific growth edge (area for development)
- Provides an encouraging first insight
- Assigns an initial Relationship Intelligence Score between 55-75 (never below 55 to maintain encouragement)

Use analytical, warm, non-therapeutic language. Focus on patterns and potential, not deficits.

Return as JSON:
{
  "primaryPattern": "Pattern name (2-3 words)",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "growthEdge": "One specific area for development",
  "firstInsight": "An encouraging 2-3 sentence insight about their journey ahead",
  "intelligenceScore": 68
}`

  try {
    const response = await window.spark.llm(promptText, 'gpt-4o', true)
    const parsed = JSON.parse(response)

    return {
      primaryPattern: parsed.primaryPattern,
      strengths: parsed.strengths,
      growthEdge: parsed.growthEdge,
      firstInsight: parsed.firstInsight,
      intelligenceScore: Math.max(55, Math.min(75, parsed.intelligenceScore)),
    }
  } catch (error) {
    return {
      primaryPattern: 'Intentional Builder',
      strengths: [
        'Strong commitment to growth',
        'Reflective self-awareness',
        'Willingness to engage deeply',
      ],
      growthEdge: 'Translating awareness into consistent action',
      firstInsight:
        'Your engagement with this assessment shows intentionality—a core predictor of relationship success. The path ahead involves building small, consistent habits that compound into meaningful change.',
      intelligenceScore: 65,
    }
  }
}
