import type { RISScore, AssessmentResponse, PillarType } from './types'

interface SubScores {
  emotionalAwareness: number
  triggerRecognition: number
  attachmentUnderstanding: number
  reflectionConsistency: number
  communicationQuality: number
  expectationClarity: number
  emotionalResponsiveness: number
  valueAlignment: number
  insightApplication: number
  habitConsistency: number
  conflictRepairSpeed: number
  progressOverTime: number
}

export function calculateRISScore(
  subScores: Partial<SubScores>,
  previousScore?: RISScore
): RISScore {
  const understandScore = calculatePillarScore('understand', {
    emotionalAwareness: subScores.emotionalAwareness ?? 50,
    triggerRecognition: subScores.triggerRecognition ?? 50,
    attachmentUnderstanding: subScores.attachmentUnderstanding ?? 50,
    reflectionConsistency: subScores.reflectionConsistency ?? 50,
  })

  const alignScore = calculatePillarScore('align', {
    communicationQuality: subScores.communicationQuality ?? 50,
    expectationClarity: subScores.expectationClarity ?? 50,
    emotionalResponsiveness: subScores.emotionalResponsiveness ?? 50,
    valueAlignment: subScores.valueAlignment ?? 50,
  })

  const elevateScore = calculatePillarScore('elevate', {
    insightApplication: subScores.insightApplication ?? 50,
    habitConsistency: subScores.habitConsistency ?? 50,
    conflictRepairSpeed: subScores.conflictRepairSpeed ?? 50,
    progressOverTime: subScores.progressOverTime ?? 50,
  })

  const overall = Math.round(
    understandScore * 0.35 + alignScore * 0.35 + elevateScore * 0.3
  )

  const delta = previousScore ? overall - previousScore.overall : undefined

  return {
    overall,
    understand: understandScore,
    align: alignScore,
    elevate: elevateScore,
    delta,
    lastUpdated: new Date().toISOString(),
  }
}

function calculatePillarScore(
  pillar: PillarType,
  scores: Record<string, number>
): number {
  const values = Object.values(scores)
  const average = values.reduce((sum, val) => sum + val, 0) / values.length
  return Math.round(Math.min(100, Math.max(0, average)))
}

export function updateScoreFromCheckIn(
  currentScore: RISScore,
  checkInResponses: AssessmentResponse[]
): RISScore {
  const improvements: Partial<SubScores> = {}

  checkInResponses.forEach((response) => {
    const value = typeof response.value === 'number' ? response.value : 50

    if (response.questionId.includes('emotional')) {
      improvements.emotionalAwareness = value
    } else if (response.questionId.includes('trigger')) {
      improvements.triggerRecognition = value
    } else if (response.questionId.includes('communication')) {
      improvements.communicationQuality = value
    } else if (response.questionId.includes('habit')) {
      improvements.habitConsistency = value
    } else if (response.questionId.includes('conflict')) {
      improvements.conflictRepairSpeed = value
    }
  })

  improvements.reflectionConsistency = Math.min(
    100,
    (currentScore.understand + 5)
  )
  improvements.progressOverTime = Math.min(100, (currentScore.elevate + 3))

  return calculateRISScore(
    {
      emotionalAwareness: improvements.emotionalAwareness ?? currentScore.understand,
      triggerRecognition: improvements.triggerRecognition ?? currentScore.understand,
      attachmentUnderstanding: currentScore.understand,
      reflectionConsistency: improvements.reflectionConsistency,
      communicationQuality: improvements.communicationQuality ?? currentScore.align,
      expectationClarity: currentScore.align,
      emotionalResponsiveness: currentScore.align,
      valueAlignment: currentScore.align,
      insightApplication: currentScore.elevate,
      habitConsistency: improvements.habitConsistency ?? currentScore.elevate,
      conflictRepairSpeed: improvements.conflictRepairSpeed ?? currentScore.elevate,
      progressOverTime: improvements.progressOverTime,
    },
    currentScore
  )
}

export function updateScoreFromAssessment(
  currentScore: RISScore,
  pillar: PillarType,
  assessmentScore: number
): RISScore {
  const newScore = { ...currentScore }

  switch (pillar) {
    case 'understand':
      newScore.understand = Math.round(
        (currentScore.understand * 0.7 + assessmentScore * 0.3)
      )
      break
    case 'align':
      newScore.align = Math.round(
        (currentScore.align * 0.7 + assessmentScore * 0.3)
      )
      break
    case 'elevate':
      newScore.elevate = Math.round(
        (currentScore.elevate * 0.7 + assessmentScore * 0.3)
      )
      break
  }

  const previousOverall = currentScore.overall
  newScore.overall = Math.round(
    newScore.understand * 0.35 +
      newScore.align * 0.35 +
      newScore.elevate * 0.3
  )
  newScore.delta = newScore.overall - previousOverall
  newScore.lastUpdated = new Date().toISOString()

  return newScore
}

export function getScoreLevel(score: number): {
  level: string
  color: string
  description: string
} {
  if (score >= 80) {
    return {
      level: 'Exceptional',
      color: 'oklch(0.72 0.12 75)',
      description: 'Your relationship intelligence is highly developed',
    }
  } else if (score >= 65) {
    return {
      level: 'Strong',
      color: 'oklch(0.65 0.09 195)',
      description: 'You demonstrate solid relationship skills',
    }
  } else if (score >= 50) {
    return {
      level: 'Developing',
      color: 'oklch(0.55 0.02 250)',
      description: 'You\'re building important relationship capabilities',
    }
  } else {
    return {
      level: 'Emerging',
      color: 'oklch(0.45 0.04 250)',
      description: 'This is your starting point for growth',
    }
  }
}
