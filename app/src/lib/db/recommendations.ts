import { supabase } from '@/lib/supabase'
import type { Insight, MicroAction, MicroActionCompletion } from '@/lib/types'
import { requireAuthenticatedUserId } from './auth'

const MODULE_SCOPE = 'lovespark'
const WEEKLY_MICRO_ACTION_TYPE = 'weekly_micro_action'

const DEFAULT_MICRO_ACTIONS: Array<{ title: string; description: string }> = [
  {
    title: 'Share one clear feeling',
    description: 'Tell your partner one honest feeling using simple, non-blaming language.',
  },
  {
    title: 'Ask one reflective question',
    description: 'Ask one open question that helps you understand their perspective better.',
  },
  {
    title: 'Pause before reacting',
    description: 'Take one short pause before responding during an emotional moment.',
  },
]

export interface WeeklyMicroAction {
  id: string
  user_id: string
  title: string
  description: string
  status: 'pending'
  module_scope: string
  priority: 'this_week'
  linked_insight_id: string
}

export interface DashboardRecommendation {
  id: string
  title: string
  description?: string
  status: string
  recommendationType?: string
  whyThis?: string
  estimatedTime?: string
  createdAt: string
}

export type RecommendationFeedbackValue = 'helpful' | 'neutral' | 'not_helpful'

function logDevQueryFailure(
  table: string,
  attemptedFilters: Record<string, unknown>,
  error: { code?: string; message?: string; details?: string | null; hint?: string | null }
) {
  if (!import.meta.env.DEV) {
    return
  }

  console.error('[Dashboard][DB] Query failed', {
    table,
    attemptedFilters,
    code: error.code,
    message: error.message,
    details: error.details,
    hint: error.hint,
  })
}

function detectPatternFromInsight(insight: {
  insight_type?: string | null
  title?: string | null
  content?: string | null
  reflection_question?: string | null
}): 'holds_back_expression' | 'emotional_bottleneck' | 'avoidance_vs_confrontation' | 'default' {
  const combined = [
    insight.insight_type ?? '',
    insight.title ?? '',
    insight.content ?? '',
    insight.reflection_question ?? '',
  ].join(' ').toLowerCase()

  if (combined.includes('holds back expression') || (combined.includes('listening') && combined.includes('express'))) {
    return 'holds_back_expression'
  }

  if (combined.includes('emotional bottleneck') || (combined.includes('stress') && combined.includes('communication'))) {
    return 'emotional_bottleneck'
  }

  if (combined.includes('avoidance vs confrontation') || (combined.includes('conflict') && (combined.includes('avoid') || combined.includes('confront')))) {
    return 'avoidance_vs_confrontation'
  }

  return 'default'
}

function buildMicroActions(pattern: ReturnType<typeof detectPatternFromInsight>): Array<{ title: string; description: string }> {
  if (pattern === 'holds_back_expression') {
    return [
      {
        title: 'Share one personal feeling',
        description: 'Share one honest feeling with your partner in a single clear sentence today.',
      },
      {
        title: 'Ask one reflective question',
        description: 'Ask your partner one reflective question about how they felt this week.',
      },
      {
        title: 'Pause before emotional reply',
        description: 'Take one deep breath before responding when you feel emotionally activated.',
      },
    ]
  }

  if (pattern === 'emotional_bottleneck') {
    return [
      {
        title: 'Name stress before talking',
        description: 'Before a hard conversation, say how stressed you feel using a 1 to 10 number.',
      },
      {
        title: 'Use one clear need statement',
        description: 'Use one sentence that starts with "I need" to communicate your core need.',
      },
      {
        title: 'Set a 10-minute reset',
        description: 'If tension rises, pause for 10 minutes and return to the same topic calmly.',
      },
    ]
  }

  if (pattern === 'avoidance_vs_confrontation') {
    return [
      {
        title: 'Address one small tension',
        description: 'Bring up one small unresolved issue within 24 hours instead of delaying it.',
      },
      {
        title: 'Start with curiosity',
        description: 'Open conflict talks with one curiosity question before sharing your position.',
      },
      {
        title: 'Use calm opening phrase',
        description: 'Start difficult topics with: "I want us to understand this together."',
      },
    ]
  }

  return DEFAULT_MICRO_ACTIONS
}

function formatMicroActionSaveError(message: string): Error {
  const lower = message.toLowerCase()

  if (lower.includes('row-level security') || lower.includes('permission denied')) {
    return new Error(
      'Supabase RLS blocked micro-actions write. Add INSERT policy for auth.uid() = user_id on recommendations.'
    )
  }

  if (lower.includes('column') && (lower.includes('linked_insight_id') || lower.includes('module_scope') || lower.includes('priority'))) {
    return new Error(
      'Recommendations table schema mismatch. Ensure linked_insight_id, module_scope, and priority columns exist.'
    )
  }

  return new Error(`Unable to save weekly micro-actions: ${message}`)
}

export async function generateMicroActions(userId: string, insightId: string): Promise<WeeklyMicroAction[]> {
  const { data: insightRow, error: insightError } = await supabase
    .from('insights')
    .select('id,insight_type,title,content,reflection_question')
    .eq('id', insightId)
    .eq('user_id', userId)
    .maybeSingle()

  if (insightError) {
    logDevQueryFailure('insights', { id: insightId, user_id: userId }, insightError)
  }

  let actions = DEFAULT_MICRO_ACTIONS

  try {
    const pattern = insightRow ? detectPatternFromInsight(insightRow) : 'default'
    const builtActions = buildMicroActions(pattern).slice(0, 3)
    if (builtActions.length === 3) {
      actions = builtActions
    }
  } catch (error) {
    console.error('[WeeklyPipeline] micro-action generation fallback', {
      userId,
      insightId,
      error,
    })
  }

  console.log('[DEBUG] micro-actions to insert:', actions)

  const createdAt = new Date().toISOString()
  const richPayload = actions.map((action) => ({
    user_id: userId,
    module_scope: MODULE_SCOPE,
    recommendation_type: WEEKLY_MICRO_ACTION_TYPE,
    title: action.title,
    description: action.description,
    status: 'pending',
    linked_insight_id: insightId,
    created_at: createdAt,
  }))
  const minimalPayload = actions.map((action) => ({
    user_id: userId,
    module_scope: MODULE_SCOPE,
    recommendation_type: WEEKLY_MICRO_ACTION_TYPE,
    title: action.title,
  }))

  const { error: deleteExistingError } = await supabase
    .from('recommendations')
    .delete()
    .eq('user_id', userId)
    .eq('module_scope', MODULE_SCOPE)
    .eq('recommendation_type', WEEKLY_MICRO_ACTION_TYPE)

  if (deleteExistingError) {
    console.error('[WeeklyPipeline] recommendation cleanup failed', {
      userId,
      insightId,
      errorCode: deleteExistingError.code,
      errorMessage: deleteExistingError.message,
      errorDetails: deleteExistingError.details,
      errorHint: deleteExistingError.hint,
    })
  }

  let createdRowsData: any[] | null = null

  const richInsert = await supabase
    .from('recommendations')
    .insert(richPayload)
    .select('*')

  if (richInsert.error) {
    logDevQueryFailure(
      'recommendations',
      {
        insertFields: [
          'user_id',
          'module_scope',
          'recommendation_type',
          'title',
          'description',
          'status',
          'linked_insight_id',
          'created_at',
        ],
      },
      richInsert.error
    )
    console.error('[WeeklyPipeline] recommendation insert failed', {
      payload: richPayload,
      errorCode: richInsert.error.code,
      errorMessage: richInsert.error.message,
      errorDetails: richInsert.error.details,
      errorHint: richInsert.error.hint,
    })

    const minimalInsert = await supabase
      .from('recommendations')
      .insert(minimalPayload)
      .select('*')

    if (minimalInsert.error) {
      logDevQueryFailure(
        'recommendations',
        { insertFields: ['user_id', 'module_scope', 'recommendation_type', 'title'] },
        minimalInsert.error
      )
      console.error('[WeeklyPipeline] recommendation insert failed', {
        payload: minimalPayload,
        errorCode: minimalInsert.error.code,
        errorMessage: minimalInsert.error.message,
        errorDetails: minimalInsert.error.details,
        errorHint: minimalInsert.error.hint,
      })
      throw formatMicroActionSaveError(minimalInsert.error.message ?? 'Unknown insert failure')
    }

    createdRowsData = (minimalInsert.data ?? []) as any[]
  } else {
    createdRowsData = (richInsert.data ?? []) as any[]
  }

  const createdRows = createdRowsData ?? []
  if (createdRows.length !== 3) {
    console.error('[DEBUG] inserted recommendations unexpected count:', {
      inserted: createdRows.length,
    })
    throw new Error(`Unable to save weekly micro-actions: expected 3 rows, got ${createdRows.length}`)
  }

  console.log('[DEBUG] inserted recommendations:', createdRows)

  const { data: verifyRows, error: verifyError } = await supabase
    .from('recommendations')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(5)

  if (verifyError) {
    console.error('[WeeklyPipeline] recommendation verify failed', {
      userId,
      errorCode: verifyError.code,
      errorMessage: verifyError.message,
      errorDetails: verifyError.details,
      errorHint: verifyError.hint,
    })
  }

  console.log('[WeeklyPipeline] recommendations verify rows', verifyRows)

  return createdRows.slice(0, 3).map((row) => ({
    id: String(row.id),
    user_id: String(row.user_id),
    title: String(row.title ?? 'Micro-Action'),
    description: String(row.description ?? row.body ?? row.content ?? ''),
    status: String(row.status ?? 'pending') as 'pending',
    module_scope: String(row.module_scope ?? MODULE_SCOPE),
    priority: 'this_week',
    linked_insight_id: String((row as { linked_insight_id?: string | null }).linked_insight_id ?? insightId),
  }))
}

export async function saveRecommendationsFromInsights(insights: Insight[]): Promise<number> {
  const userId = await requireAuthenticatedUserId()
  const actionableInsights = insights.filter((insight) => Boolean(insight.actionable))

  if (actionableInsights.length === 0) {
    return 0
  }

  const rows = actionableInsights.map((insight) => ({
    user_id: userId,
    title: insight.title,
    description: insight.actionable || insight.content,
    pillar: insight.pillar,
    status: 'pending',
    source: 'insight_action',
    metadata: {
      insightId: insight.id,
      insightType: insight.type,
      module_scope: 'lovespark',
    },
  }))

  const { data, error } = await supabase.from('recommendations').insert(rows).select('id')
  if (error) {
    console.error('Failed saving recommendations from insights:', error)
    throw new Error('Unable to save recommendations.')
  }

  const insertedCount = (data ?? []).length
  console.log('[WeeklyPipeline] recommendations inserted count', {
    userId,
    count: insertedCount,
  })

  return insertedCount
}

export async function upsertMicroActions(actions: MicroAction[], weekNumber: number) {
  const userId = await requireAuthenticatedUserId()
  const rows = actions.map((action) => ({
    user_id: userId,
    title: action.label,
    description: action.description,
    pillar: action.pillar,
    status: 'pending',
    source: 'micro_action',
    metadata: {
      microActionId: action.id,
      order: action.order,
      weekNumber,
      module_scope: 'lovespark',
    },
  }))

  const { error } = await supabase.from('recommendations').insert(rows)
  if (error) {
    console.error('Failed creating micro-action recommendations:', error)
    throw new Error('Unable to save micro-actions.')
  }
}

export async function loadMicroActionCompletions(weekNumber: number): Promise<MicroActionCompletion[]> {
  const userId = await requireAuthenticatedUserId()
  const { data, error } = await supabase
    .from('recommendations')
    .select('*')
    .eq('user_id', userId)
    .eq('source', 'micro_action')
    .eq('status', 'completed')

  if (error) {
    console.error('Failed loading micro-action completions:', error)
    throw new Error('Unable to load micro-action completions.')
  }

  return (data ?? [])
    .filter((row) => {
      const meta = row.metadata as Record<string, unknown> | null
      return Number(meta?.weekNumber) === weekNumber
    })
    .map((row) => {
      const meta = row.metadata as Record<string, unknown> | null
      return {
        id: row.id,
        userId: row.user_id,
        microActionId: String(meta?.microActionId ?? row.id),
        weekNumber,
        completedAt: row.updated_at,
      }
    })
}

export async function loadRecommendations(userId?: string): Promise<DashboardRecommendation[]> {
  const resolvedUserId = userId ?? await requireAuthenticatedUserId()
  const attempts: Array<{
    attemptedFilters: Record<string, unknown>
    build: () => any
  }> = [
    {
      attemptedFilters: {
        user_id: resolvedUserId,
        module_scope: MODULE_SCOPE,
        source: 'insight_action',
        order: 'created_at desc',
        limit: 5,
      },
      build: () => supabase
        .from('recommendations')
        .select('*')
        .eq('user_id', resolvedUserId)
        .eq('module_scope', MODULE_SCOPE)
        .eq('source', 'insight_action')
        .order('created_at', { ascending: false })
        .limit(5),
    },
    {
      attemptedFilters: {
        user_id: resolvedUserId,
        source: 'insight_action',
        order: 'created_at desc',
        limit: 5,
      },
      build: () => supabase
        .from('recommendations')
        .select('*')
        .eq('user_id', resolvedUserId)
        .eq('source', 'insight_action')
        .order('created_at', { ascending: false })
        .limit(5),
    },
    {
      attemptedFilters: {
        user_id: resolvedUserId,
        order: 'created_at desc',
        limit: 5,
      },
      build: () => supabase
        .from('recommendations')
        .select('*')
        .eq('user_id', resolvedUserId)
        .order('created_at', { ascending: false })
        .limit(5),
    },
  ]

  let rows: any[] = []
  let lastError: { code?: string; message?: string; details?: string | null } | null = null

  for (const attempt of attempts) {
    const { data, error } = await attempt.build()

    if (error) {
      logDevQueryFailure('recommendations', attempt.attemptedFilters, error)
      lastError = error
      continue
    }

    rows = (data ?? []) as any[]
    lastError = null

    if (rows.length > 0 || attempt === attempts[attempts.length - 1]) {
      break
    }
  }

  if (lastError) {
    console.error('Failed loading recommendations:', lastError)
    throw new Error('Unable to load recommendations.')
  }

  if (import.meta.env.DEV) {
    console.debug('[Dashboard] recommendations loaded', { count: rows.length })
    if (rows.length === 0) {
      console.debug('[Dashboard] recommendations loaded: 0 rows')
    }
  }

  return rows.map((row) => {
    const metadata = (row.metadata as Record<string, unknown> | null) ?? {}
    return {
      id: String(row.id),
      title: String(row.title ?? 'Recommendation'),
      description: row.description ? String(row.description) : undefined,
      status: String(row.status ?? 'pending'),
      recommendationType: row.recommendation_type ? String(row.recommendation_type) : undefined,
      whyThis: typeof metadata.why_this === 'string' ? metadata.why_this : undefined,
      estimatedTime: typeof metadata.estimated_time === 'string' ? metadata.estimated_time : '2-3 minutes',
      createdAt: String(row.created_at),
    }
  })
}

export async function updateRecommendationStatus(recommendationId: string, status: string) {
  const userId = await requireAuthenticatedUserId()
  const { error } = await supabase
    .from('recommendations')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', recommendationId)
    .eq('user_id', userId)

  if (error) {
    console.error('Failed updating recommendation status:', error)
    throw new Error('Unable to update recommendation status.')
  }
}

export async function saveRecommendationFeedback(
  recommendationId: string,
  feedback: RecommendationFeedbackValue
) {
  const userId = await requireAuthenticatedUserId()
  const createdAt = new Date().toISOString()

  const attempts = [
    {
      attemptedFields: ['user_id', 'recommendation_id', 'feedback', 'created_at'],
      payload: {
        user_id: userId,
        recommendation_id: recommendationId,
        feedback,
        created_at: createdAt,
      },
    },
    {
      attemptedFields: ['user_id', 'recommendation_id', 'feedback'],
      payload: {
        user_id: userId,
        recommendation_id: recommendationId,
        feedback,
      },
    },
  ]

  for (const attempt of attempts) {
    const { error } = await supabase
      .from('recommendation_feedback')
      .insert(attempt.payload)

    if (!error) {
      return
    }

    logDevQueryFailure(
      'recommendation_feedback',
      { insertFields: attempt.attemptedFields, recommendation_id: recommendationId },
      error
    )

    const message = String(error.message ?? '').toLowerCase()
    const details = String(error.details ?? '').toLowerCase()
    const relationMissing =
      message.includes('does not exist')
      || message.includes('relation')
      || details.includes('does not exist')

    if (relationMissing) {
      break
    }
  }

  const storageKey = 'lovespark.recommendation_feedback_fallback'
  const fallbackPayload = {
    recommendationId,
    feedback,
    userId,
    createdAt,
  }

  try {
    const raw = localStorage.getItem(storageKey)
    const parsed = raw ? JSON.parse(raw) : []
    const next = Array.isArray(parsed) ? [...parsed, fallbackPayload] : [fallbackPayload]
    localStorage.setItem(storageKey, JSON.stringify(next))
  } catch (storageError) {
    console.warn('Unable to save recommendation feedback fallback locally:', storageError)
  }

  console.log('[Recommendations] feedback saved locally (fallback)', fallbackPayload)
}

export async function setMicroActionCompletion(
  action: MicroAction,
  weekNumber: number,
  completed: boolean
) {
  const userId = await requireAuthenticatedUserId()

  const { data: existing, error: findError } = await supabase
    .from('recommendations')
    .select('id')
    .eq('user_id', userId)
    .eq('source', 'micro_action')
    .contains('metadata', { microActionId: action.id, weekNumber })
    .maybeSingle()

  if (findError) {
    console.error('Failed querying micro-action completion:', findError)
    throw new Error('Unable to update micro-action state.')
  }

  if (!existing) {
    const { error: insertError } = await supabase.from('recommendations').insert({
      user_id: userId,
      title: action.label,
      description: action.description,
      pillar: action.pillar,
      status: completed ? 'completed' : 'pending',
      source: 'micro_action',
      metadata: { microActionId: action.id, weekNumber, module_scope: 'lovespark' },
    })

    if (insertError) {
      console.error('Failed creating micro-action completion row:', insertError)
      throw new Error('Unable to update micro-action state.')
    }

    return
  }

  const { error } = await supabase
    .from('recommendations')
    .update({ status: completed ? 'completed' : 'pending', updated_at: new Date().toISOString() })
    .eq('id', existing.id)

  if (error) {
    console.error('Failed updating micro-action completion row:', error)
    throw new Error('Unable to update micro-action state.')
  }
}
