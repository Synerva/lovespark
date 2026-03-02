export type UserMode = 'individual' | 'couple'

export type OnboardingStep = 'welcome' | 'mode-selection' | 'attachment' | 'communication' | 'history' | 'processing' | 'reveal'

export type PillarType = 'understand' | 'align' | 'elevate'

export interface RISScore {
  overall: number
  understand: number
  align: number
  elevate: number
  delta?: number
  lastUpdated: string
}

export interface AuthUser {
  id: string
  email: string
  name: string
  createdAt: string
  provider?: 'email' | 'google' | 'github'
  avatarUrl?: string
}

export interface User {
  id: string
  name: string
  email: string
  avatarUrl?: string
  mode: UserMode
  partnerId?: string
  onboardingCompleted: boolean
  createdAt: string
}

export interface OnboardingProfile {
  userId: string
  relationshipStatus: string
  relationshipGoal: string
  mainChallenge: string
  communicationStyle: string
  conflictStyle: string
  emotionalAwareness: string
  intelligenceScore: number
  primaryPattern: string
  strengths: string[]
  growthEdge: string
  createdAt: string
}

export interface AttachmentStyle {
  primary: 'secure' | 'anxious' | 'avoidant' | 'fearful-avoidant'
  score: number
  description: string
}

export interface AssessmentResponse {
  questionId: string
  value: number | string | string[]
  timestamp: string
}

export interface Assessment {
  id: string
  type: 'attachment' | 'communication' | 'relationship-pattern' | 'emotional-intelligence' | 'compatibility'
  pillar: PillarType
  title: string
  description: string
  questions: AssessmentQuestion[]
  completed: boolean
  completedAt?: string
  responses?: AssessmentResponse[]
  result?: AssessmentResult
}

export interface AssessmentQuestion {
  id: string
  type: 'slider' | 'multiple-choice' | 'text' | 'scale'
  question: string
  options?: string[]
  min?: number
  max?: number
  labels?: { min: string; max: string }
}

export interface AssessmentResult {
  score: number
  category?: string
  insights: string[]
  visualData?: any
}

export interface Insight {
  id: string
  type: 'pattern' | 'suggestion' | 'warning' | 'celebration'
  pillar: PillarType
  title: string
  content: string
  actionable?: string
  createdAt: string
  read: boolean
}

export interface CheckIn {
  id: string
  userId: string
  responses: AssessmentResponse[]
  risScoreBefore: RISScore
  risScoreAfter: RISScore
  insightsGenerated: string[]
  completedAt: string
  weekNumber: number
}

export interface Protocol {
  id: string
  title: string
  description: string
  pillar: PillarType
  durationDays: number
  dailyActions: string[]
  active: boolean
  startedAt?: string
  currentDay?: number
  completedDays?: number[]
}

export interface AIMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  context?: {
    risScore?: number
    activePillar?: PillarType
    recentCheckIn?: boolean
  }
}

export interface WeeklyBrief {
  id: string
  weekNumber: number
  generatedAt: string
  risChange: number
  highlights: string[]
  focusArea: PillarType
  suggestedProtocols: string[]
  insights: string[]
}

export interface CoupleAlignment {
  overallScore: number
  communicationScore: number
  valueAlignmentScore: number
  expectationClarityScore: number
  gaps: AlignmentGap[]
  strengths: string[]
}

export interface AlignmentGap {
  area: string
  partner1Response: string
  partner2Response: string
  severity: 'low' | 'medium' | 'high'
  recommendation: string
}

export interface PsychologistSession {
  id: string
  scheduledAt: string
  psychologistName: string
  focus: string
  notes?: string
  completed: boolean
}

export type SubscriptionPlanName = 'FREE' | 'PREMIUM' | 'PREMIUM_COACHING'

export type BillingCycle = 'monthly' | 'yearly'

export type SubscriptionStatus = 'active' | 'canceled' | 'trial' | 'expired'

export interface SubscriptionPlan {
  id: string
  name: SubscriptionPlanName
  displayName: string
  priceMonthly: number
  priceYearly: number
  features: string[]
  isPopular?: boolean
  isActive: boolean
}

export interface Subscription {
  id: string
  userId: string
  planId: string
  planName: SubscriptionPlanName
  status: SubscriptionStatus
  billingCycle: BillingCycle
  startDate: string
  renewalDate: string
  createdAt: string
  stripeCustomerId?: string
  stripeSubscriptionId?: string
  stripePriceId?: string
  cancelAtPeriodEnd?: boolean
}

export interface PaymentIntent {
  id: string
  amount: number
  currency: string
  status: 'pending' | 'succeeded' | 'failed'
}

export interface ScoreHistory {
  id: string
  userId: string
  score: number
  understand: number
  align: number
  elevate: number
  recordedAt: string
  source: 'check-in' | 'assessment' | 'manual'
}

export interface WeeklyInsight {
  id: string
  userId: string
  weekNumber: number
  generatedAt: string
  patternObservation: string
  microAction: string
  reflectionQuestion: string
  read: boolean
  pillarFocus: PillarType
}

export interface MicroAction {
  id: string
  label: string
  description: string
  pillar: PillarType
  order: number
}

export interface MicroActionCompletion {
  id: string
  userId: string
  microActionId: string
  weekNumber: number
  completedAt: string
}

export interface RecurringPattern {
  id: string
  userId: string
  pattern: string
  frequency: number
  firstDetected: string
  lastDetected: string
  pillar: PillarType
  relatedMessageIds: string[]
  acknowledged: boolean
}

export type UserStage = 'understand' | 'align' | 'elevate'

export interface ProgressSnapshot {
  scoreEvolution: ScoreHistory[]
  currentStage: UserStage
  weeklyInsight: WeeklyInsight | null
  microActionsThisWeek: MicroActionCompletion[]
  recurringPatterns: RecurringPattern[]
}
