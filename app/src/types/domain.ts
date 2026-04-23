import type { AIMessage, CheckIn, Insight, OnboardingProfile, RISScore, Subscription } from '@/lib/types'

export type CanonicalAssessmentType =
  | 'relationship_intelligence_score'
  | 'growth_mindset'
  | 'intimacy_connection'
  | 'attachment_style'
  | 'communication_pattern'
  | 'conflict_pattern'
  | 'custom'

export interface OnboardingComposite {
  relationshipStatus: string
  relationshipGoal: string
  mainChallenge: string
  communicationStyle: string
  conflictStyle: string
  emotionalAwareness: string
}

export interface AssessmentSaveInput {
  type: CanonicalAssessmentType
  status?: 'completed'
  version?: string
  answers: Record<string, unknown>
  scorePayload: Record<string, unknown>
}

export interface ChatHistory {
  conversationId: string
  messages: AIMessage[]
}

export interface LegacyMigrationResult {
  migrated: boolean
  reason?: string
}

export interface DashboardData {
  risScore: RISScore | null
  checkIns: CheckIn[]
  insights: Insight[]
  subscription: Subscription | null
  onboardingProfile: OnboardingProfile | null
  aiMessages: AIMessage[]
}
