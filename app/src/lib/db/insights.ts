import { supabase } from '@/lib/supabase'
import type { Insight } from '@/lib/types'
import { requireAuthenticatedUserId } from './auth'

const MODULE_SCOPE = 'lovespark'
const WEEKLY_INSIGHT_TYPE = 'weekly'

interface WeeklyInsightRecord {
  id: string
  title: string
  body: string
  reflection_question: string
  created_at: string
  module_scope: string
  insight_type: string
}

export interface DashboardWeeklyInsight {
  id: string
  title: string
  content: string
  reflectionQuestion?: string
  whyThis?: string
  confidence?: number
  read: boolean
  createdAt: string
}

function logDevQueryFailure(
  table: string,
  attemptedFilters: Record<string, unknown>,
  error: { code?: string; message?: string; details?: string | null }
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
  })
}

function clampTo100(value: number): number {
  if (Number.isNaN(value)) {
    return 0
  }

  if (value < 0) {
    return 0
  }

  if (value > 100) {
    return 100
  }

  return value
}

function normalizeScore(raw: number): number {
  if (raw <= 5) {
    return clampTo100(raw * 20)
  }

  if (raw <= 10) {
    return clampTo100(raw * 10)
  }

  return clampTo100(raw)
}

function asNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }

  if (typeof value === 'string') {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) {
      return parsed
    }
  }

  return null
}

function average(values: number[]): number | null {
  if (values.length === 0) {
    return null
  }

  const total = values.reduce((sum, value) => sum + value, 0)
  return total / values.length
}

function getQuestionAverage(checkInRows: any[], questionId: string): number | null {
  const values: number[] = []

  for (const row of checkInRows) {
    const responses = Array.isArray(row?.responses) ? row.responses : []
    for (const response of responses) {
      if (response?.questionId !== questionId) {
        continue
      }

      const numeric = asNumber(response?.value)
      if (numeric === null) {
        continue
      }

      values.push(normalizeScore(numeric))
    }
  }

  return average(values)
}

function walkJson(
  value: unknown,
  visit: (key: string, node: unknown) => void,
  parentKey = ''
) {
  if (Array.isArray(value)) {
    for (const item of value) {
      walkJson(item, visit, parentKey)
    }
    return
  }

  if (!value || typeof value !== 'object') {
    return
  }

  for (const [key, node] of Object.entries(value as Record<string, unknown>)) {
    const path = parentKey ? `${parentKey}.${key}` : key
    visit(path, node)
    walkJson(node, visit, path)
  }
}

function collectAssessmentSignals(assessmentRows: any[]) {
  const stressScores: number[] = []
  const communicationScores: number[] = []
  const conflictTexts: string[] = []

  const stressKeyPattern = /stress|anxious|anxiety|overwhelm|trigger|reactivity/i
  const communicationKeyPattern = /communication|clarity|listen|listening|express|expression/i
  const conflictKeyPattern = /conflict|argument|fight|avoid|confront|withdraw|stonewall/i

  for (const row of assessmentRows) {
    const sources = [row?.answers, row?.score_payload]
    for (const source of sources) {
      walkJson(source, (key, node) => {
        const numeric = asNumber(node)
        if (numeric !== null) {
          if (stressKeyPattern.test(key)) {
            stressScores.push(normalizeScore(numeric))
          }
          if (communicationKeyPattern.test(key)) {
            communicationScores.push(normalizeScore(numeric))
          }
        }

        if (typeof node === 'string' && conflictKeyPattern.test(node)) {
          conflictTexts.push(node)
        }

        if (conflictKeyPattern.test(key) && typeof node === 'string' && node.trim().length > 0) {
          conflictTexts.push(node)
        }
      })
    }

    const assessmentType = String(row?.assessment_type ?? '')
    if (assessmentType === 'conflict_pattern') {
      conflictTexts.push('conflict_pattern_assessment')
    }
  }

  return {
    stressAverage: average(stressScores),
    communicationAverage: average(communicationScores),
    conflictSignals: conflictTexts,
  }
}

function includesConflictSignal(value: string): boolean {
  return /conflict|argument|fight|avoid|confront|withdraw|stonewall|shutdown/i.test(value)
}

function getLatestPillarOpportunity(latestRis: Record<string, unknown> | null): string {
  if (!latestRis) {
    return 'communication clarity and emotional timing'
  }

  const understand = asNumber(latestRis.understand)
  const align = asNumber(latestRis.align)
  const elevate = asNumber(latestRis.elevate)

  const candidates = [
    { value: understand, label: 'emotional self-awareness' },
    { value: align, label: 'communication clarity and emotional timing' },
    { value: elevate, label: 'consistent weekly growth rituals' },
  ].filter((candidate) => candidate.value !== null) as Array<{ value: number; label: string }>

  if (candidates.length === 0) {
    return 'communication clarity and emotional timing'
  }

  candidates.sort((a, b) => a.value - b.value)
  return candidates[0].label
}

export async function generateWeeklyInsight(userId: string): Promise<WeeklyInsightRecord> {
  const weekAgoIso = new Date(Date.now() - (7 * 24 * 60 * 60 * 1000)).toISOString()

  const { data: onboardingRowsRaw, error: onboardingError } = await supabase
    .from('onboarding_responses')
    .select('question_key,response_value')
    .eq('user_id', userId)
    .eq('module_scope', MODULE_SCOPE)

  if (onboardingError) {
    logDevQueryFailure('onboarding_responses', { user_id: userId, module_scope: MODULE_SCOPE }, onboardingError)
  }

  const onboardingRows = onboardingError ? [] : (onboardingRowsRaw ?? [])

  const { data: assessmentRowsRaw, error: assessmentError } = await supabase
    .from('assessments')
    .select('assessment_type,answers,score_payload,created_at')
    .eq('user_id', userId)
    .eq('status', 'completed')
    .order('created_at', { ascending: false })
    .limit(5)

  if (assessmentError) {
    logDevQueryFailure(
      'assessments',
      { user_id: userId, status: 'completed', order: 'created_at desc', limit: 5 },
      assessmentError
    )
  }

  const assessmentRows = assessmentError ? [] : (assessmentRowsRaw ?? [])

  const { data: checkInRowsRaw, error: checkInError } = await supabase
    .from('check_ins')
    .select('responses,completed_at')
    .eq('user_id', userId)
    .gte('completed_at', weekAgoIso)
    .order('completed_at', { ascending: false })

  if (checkInError) {
    logDevQueryFailure(
      'check_ins',
      { user_id: userId, completed_at_gte: weekAgoIso, order: 'completed_at desc' },
      checkInError
    )
  }

  const checkInRows = checkInError ? [] : (checkInRowsRaw ?? [])

  const { data: latestRisAssessment, error: latestRisError } = await supabase
    .from('assessments')
    .select('score_payload,created_at')
    .eq('user_id', userId)
    .eq('assessment_type', 'relationship_intelligence_score')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (latestRisError) {
    logDevQueryFailure(
      'assessments',
      { user_id: userId, assessment_type: 'relationship_intelligence_score', order: 'created_at desc', limit: 1 },
      latestRisError
    )
  }

  const { data: scoreHistorySnapshotRow, error: scoreHistorySnapshotError } = await supabase
    .from('state_snapshots')
    .select('payload')
    .eq('user_id', userId)
    .eq('key', 'score_history')
    .maybeSingle()

  if (scoreHistorySnapshotError) {
    logDevQueryFailure('state_snapshots', { user_id: userId, key: 'score_history' }, scoreHistorySnapshotError)
  }

  const latestScoreFromSnapshot = Array.isArray(scoreHistorySnapshotRow?.payload)
    ? (scoreHistorySnapshotRow.payload as Array<Record<string, unknown>>).slice(-1)[0]
    : null

  const latestRisPayload = (latestRisAssessment?.score_payload as Record<string, unknown> | undefined) ?? latestScoreFromSnapshot ?? null

  const onboardingByKey = new Map<string, string>(
    onboardingRows.map((row) => [String(row.question_key), String(row.response_value ?? '')])
  )

  const activeListeningAvg = getQuestionAverage(checkInRows, 'active-listening')
  const emotionalExpressionAvg = getQuestionAverage(checkInRows, 'emotional-expression')
  const communicationClarityAvg = getQuestionAverage(checkInRows, 'communication-clarity')

  const assessmentSignals = collectAssessmentSignals(assessmentRows)
  const stressAverage = assessmentSignals.stressAverage
  const communicationSignalAverage = average(
    [communicationClarityAvg, assessmentSignals.communicationAverage].filter(
      (value): value is number => typeof value === 'number'
    )
  )

  const holdsBackExpression =
    activeListeningAvg !== null
    && emotionalExpressionAvg !== null
    && activeListeningAvg - emotionalExpressionAvg >= 10

  const emotionalBottleneck =
    stressAverage !== null
    && communicationSignalAverage !== null
    && stressAverage >= 65
    && communicationSignalAverage <= 45

  const onboardingConflictSignals = [
    onboardingByKey.get('conflictStyle') ?? '',
    onboardingByKey.get('mainChallenge') ?? '',
  ].filter((value) => includesConflictSignal(value))

  const hasConflictSignal = onboardingConflictSignals.length > 0 || assessmentSignals.conflictSignals.length > 0
  const pillarOpportunity = getLatestPillarOpportunity(latestRisPayload)

  let body = `Your relationship state this week suggests the biggest opportunity is to improve ${pillarOpportunity}.`
  let reflectionQuestion = 'What one conversation this week would benefit most from a calmer and clearer opening?'

  if (holdsBackExpression) {
    body = 'Pattern detected: you are listening more than expressing. Your weekly check-ins show high presence for listening and lower scores for emotional expression, which can create invisible needs and delayed tension.'
    reflectionQuestion = 'What is one important feeling or need you can express directly this week instead of holding it back?'
  } else if (emotionalBottleneck) {
    body = 'Pattern detected: emotional bottleneck. Recent assessment signals indicate elevated stress while communication clarity is low, which can compress emotional processing and make conversations feel harder than necessary.'
    reflectionQuestion = 'What simple communication ritual could lower stress before your next important conversation?'
  } else if (hasConflictSignal) {
    body = 'Pattern detected: avoidance vs confrontation tension. Your onboarding and/or assessment conflict signals suggest friction around how conflict is approached, which can cause either shutdown or escalation cycles.'
    reflectionQuestion = 'When conflict appears, what would a balanced first response look like for you: neither avoidance nor attack?'
  }

  const createdAt = new Date().toISOString()

  const deleteAttempts = [
    {
      attemptedFilters: { user_id: userId, module_scope: MODULE_SCOPE, insight_type: WEEKLY_INSIGHT_TYPE },
      run: () => supabase
        .from('insights')
        .delete()
        .eq('user_id', userId)
        .eq('module_scope', MODULE_SCOPE)
        .eq('insight_type', WEEKLY_INSIGHT_TYPE),
    },
    {
      attemptedFilters: { user_id: userId, insight_type: WEEKLY_INSIGHT_TYPE },
      run: () => supabase
        .from('insights')
        .delete()
        .eq('user_id', userId)
        .eq('insight_type', WEEKLY_INSIGHT_TYPE),
    },
  ]

  for (const attempt of deleteAttempts) {
    const { error } = await attempt.run()
    if (!error) {
      break
    }

    logDevQueryFailure('insights', attempt.attemptedFilters, error)
  }

  const insertAttempts = [
    {
      attemptedFields: ['user_id', 'title', 'content', 'reflection_question', 'created_at', 'module_scope', 'insight_type', 'source', 'pillar', 'actionable', 'read'],
      payload: {
        user_id: userId,
        title: 'Weekly Insight',
        content: body,
        reflection_question: reflectionQuestion,
        created_at: createdAt,
        module_scope: MODULE_SCOPE,
        insight_type: WEEKLY_INSIGHT_TYPE,
        source: 'weekly_checkin',
        pillar: 'align',
        actionable: reflectionQuestion,
        read: false,
      },
    },
    {
      attemptedFields: ['user_id', 'title', 'content', 'reflection_question', 'created_at', 'module_scope', 'insight_type', 'pillar', 'actionable', 'read'],
      payload: {
        user_id: userId,
        title: 'Weekly Insight',
        content: body,
        reflection_question: reflectionQuestion,
        created_at: createdAt,
        module_scope: MODULE_SCOPE,
        insight_type: WEEKLY_INSIGHT_TYPE,
        pillar: 'align',
        actionable: reflectionQuestion,
        read: false,
      },
    },
    {
      attemptedFields: ['user_id', 'title', 'content', 'reflection_question', 'created_at', 'insight_type', 'pillar', 'actionable', 'read'],
      payload: {
        user_id: userId,
        title: 'Weekly Insight',
        content: body,
        reflection_question: reflectionQuestion,
        created_at: createdAt,
        insight_type: WEEKLY_INSIGHT_TYPE,
        pillar: 'align',
        actionable: reflectionQuestion,
        read: false,
      },
    },
    {
      attemptedFields: ['user_id', 'title', 'content', 'created_at'],
      payload: {
        user_id: userId,
        title: 'Weekly Insight',
        content: body,
        created_at: createdAt,
      },
    },
  ]

  let createdRow: any | null = null
  let insertError: { code?: string; message?: string; details?: string | null } | null = null

  for (const attempt of insertAttempts) {
    const { data, error } = await supabase
      .from('insights')
      .insert(attempt.payload)
      .select('*')
      .single()

    if (error) {
      logDevQueryFailure('insights', { insertFields: attempt.attemptedFields }, error)
      insertError = error
      continue
    }

    createdRow = data
    insertError = null
    break
  }

  if (!createdRow || insertError) {
    console.error('Failed inserting weekly insight:', insertError)
    throw new Error('Unable to save weekly insight.')
  }

  return {
    id: String(createdRow.id),
    title: String(createdRow.title ?? 'Weekly Insight'),
    body: String(createdRow.content ?? body),
    reflection_question: String(createdRow.reflection_question ?? reflectionQuestion),
    created_at: String(createdRow.created_at ?? createdAt),
    module_scope: String(createdRow.module_scope ?? MODULE_SCOPE),
    insight_type: String(createdRow.insight_type ?? WEEKLY_INSIGHT_TYPE),
  }
}

export async function saveInsights(insights: Insight[]) {
  if (insights.length === 0) {
    return
  }

  const userId = await requireAuthenticatedUserId()

  const rows = insights.map((insight) => ({
    id: insight.id,
    user_id: userId,
    insight_type: insight.type,
    pillar: insight.pillar,
    title: insight.title,
    content: insight.content,
    actionable: insight.actionable ?? null,
    read: insight.read,
    created_at: insight.createdAt,
  }))

  const { error } = await supabase.from('insights').upsert(rows)

  if (error) {
    console.error('Failed saving insights:', error)
    throw new Error('Unable to save insights.')
  }
}

export async function loadInsights(): Promise<Insight[]> {
  const userId = await requireAuthenticatedUserId()

  const { data, error } = await supabase
    .from('insights')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Failed loading insights:', error)
    throw new Error('Unable to load insights.')
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    type: row.insight_type,
    pillar: row.pillar,
    title: row.title,
    content: row.content,
    actionable: row.actionable ?? undefined,
    createdAt: row.created_at,
    read: row.read,
  }))
}

export async function loadLatestWeeklyInsight(userId?: string): Promise<DashboardWeeklyInsight | null> {
  const resolvedUserId = userId ?? await requireAuthenticatedUserId()

  const preferred = await supabase
    .from('insights')
    .select('*')
    .eq('user_id', resolvedUserId)
    .eq('module_scope', MODULE_SCOPE)
    .eq('insight_type', WEEKLY_INSIGHT_TYPE)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (preferred.error) {
    logDevQueryFailure(
      'insights',
      { user_id: resolvedUserId, module_scope: MODULE_SCOPE, insight_type: WEEKLY_INSIGHT_TYPE, order: 'created_at desc', limit: 1 },
      preferred.error
    )
  }

  let data = preferred.data
  let unrecoverableError = preferred.error ?? null

  if (!data) {
    const byTypeFallback = await supabase
      .from('insights')
      .select('*')
      .eq('user_id', resolvedUserId)
      .eq('insight_type', WEEKLY_INSIGHT_TYPE)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (byTypeFallback.error) {
      logDevQueryFailure(
        'insights',
        { user_id: resolvedUserId, insight_type: WEEKLY_INSIGHT_TYPE, order: 'created_at desc', limit: 1 },
        byTypeFallback.error
      )
    } else {
      data = byTypeFallback.data
      unrecoverableError = null
    }
  }

  if (!data) {
    const userOnlyFallback = await supabase
      .from('insights')
      .select('*')
      .eq('user_id', resolvedUserId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (userOnlyFallback.error) {
      logDevQueryFailure(
        'insights',
        { user_id: resolvedUserId, order: 'created_at desc', limit: 1 },
        userOnlyFallback.error
      )
      unrecoverableError = userOnlyFallback.error
    } else {
      data = userOnlyFallback.data
      unrecoverableError = null
    }
  }

  if (unrecoverableError) {
    console.error('Failed loading latest weekly insight:', unrecoverableError)
    throw new Error('Unable to load weekly insight.')
  }

  if (!data) {
    if (import.meta.env.DEV) {
      console.debug('[Dashboard] weekly insight loaded: 0 rows')
    }
    return null
  }

  const metadata = (data.metadata as Record<string, unknown> | null) ?? {}

  if (import.meta.env.DEV) {
    console.debug('[Dashboard] weekly insight loaded', { id: data.id })
  }

  return {
    id: String(data.id),
    title: String(data.title ?? 'Weekly Insight'),
    content: String(data.content ?? ''),
    reflectionQuestion: typeof data.reflection_question === 'string' ? data.reflection_question : undefined,
    whyThis: typeof metadata.why_this === 'string' ? metadata.why_this : undefined,
    confidence: typeof metadata.confidence === 'number' ? metadata.confidence : undefined,
    read: Boolean(data.read),
    createdAt: String(data.created_at),
  }
}

export async function markWeeklyInsightAsRead(insightId: string) {
  const resolvedUserId = await requireAuthenticatedUserId()
  const { error } = await supabase
    .from('insights')
    .update({ read: true })
    .eq('id', insightId)
    .eq('user_id', resolvedUserId)

  if (error) {
    console.error('Failed marking weekly insight as read:', error)
    throw new Error('Unable to update weekly insight status.')
  }
}
