export type JsonValue =
  | string
  | number
  | boolean
  | null
  | { [key: string]: JsonValue }
  | JsonValue[]

export type AssessmentType =
  | 'relationship_intelligence_score'
  | 'growth_mindset'
  | 'intimacy_connection'
  | 'attachment_style'
  | 'communication_pattern'
  | 'conflict_pattern'
  | 'custom'

export interface ProfileRow {
  id: string
  email: string | null
  full_name: string | null
  avatar_url: string | null
  onboarding_completed: boolean
  module_scope: string | null
  metadata: JsonValue | null
  created_at: string
  updated_at: string
}

export interface UserGoalRow {
  id: string
  user_id: string
  title: string
  status: string
  metadata: JsonValue | null
  created_at: string
  updated_at: string
}

export interface OnboardingResponseRow {
  id: string
  user_id: string
  question_key: string
  response_value: JsonValue
  response_payload: JsonValue | null
  module_scope: string
  created_at: string
  updated_at: string
}

export interface AssessmentRow {
  id: string
  user_id: string
  assessment_type: AssessmentType
  status: string
  version: string | null
  answers: JsonValue
  score_payload: JsonValue
  created_at: string
}

export interface CheckInRow {
  id: string
  user_id: string
  responses: JsonValue
  score_before: JsonValue
  score_after: JsonValue
  insights_generated: JsonValue
  week_number: number
  completed_at: string
  created_at: string
}

export interface InsightRow {
  id: string
  user_id: string
  insight_type: string
  pillar: string
  title: string
  content: string
  actionable: string | null
  read: boolean
  created_at: string
}

export interface RecommendationRow {
  id: string
  user_id: string
  title: string
  description: string
  pillar: string | null
  status: string
  source: string | null
  metadata: JsonValue | null
  created_at: string
  updated_at: string
}

export interface AIConversationRow {
  id: string
  user_id: string
  title: string | null
  created_at: string
  updated_at: string
}

export interface AIMessageRow {
  id: string
  conversation_id: string
  user_id: string
  role: 'user' | 'assistant'
  content: string
  context: JsonValue | null
  created_at: string
}

export interface SubscriptionRow {
  id: string
  user_id: string
  provider: 'paddle'
  plan_id: string
  plan_name: 'FREE' | 'PREMIUM'
  status: 'active' | 'canceled' | 'trial' | 'expired'
  billing_cycle: 'monthly' | 'yearly'
  renewal_date: string | null
  paddle_customer_id: string | null
  paddle_subscription_id: string | null
  paddle_price_id: string | null
  metadata: JsonValue | null
  created_at: string
  updated_at: string
}

export interface StateSnapshotRow {
  id: string
  user_id: string
  key: string
  payload: JsonValue
  created_at: string
  updated_at: string
}
