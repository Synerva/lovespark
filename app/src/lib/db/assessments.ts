import { supabase } from '@/lib/supabase'
import type { RISScore } from '@/lib/types'
import type { AssessmentSaveInput } from '@/types/domain'
import { requireAuthenticatedUserId } from './auth'
import { triggerWeeklyInsightPipelineSafely } from './weekly-insight-pipeline'

const LEGACY_TO_CANONICAL_ASSESSMENT_TYPE: Record<string, AssessmentSaveInput['type']> = {
  relationship_intelligence_score: 'relationship_intelligence_score',
  growth_mindset_assessment: 'growth_mindset',
  intimacy_connection_assessment: 'intimacy_connection',
  emotional_reaction_assessment: 'attachment_style',
  communication_timing_assessment: 'custom',
  compatibility_assessment: 'conflict_pattern',
  communication_patterns_assessment: 'communication_pattern',
}

function normalizeAssessmentType(type: string): AssessmentSaveInput['type'] {
  return LEGACY_TO_CANONICAL_ASSESSMENT_TYPE[type] ?? (type as AssessmentSaveInput['type'])
}

function formatAssessmentSaveError(errorMessage: string): Error {
  const lower = errorMessage.toLowerCase()
  const schemaMismatch = lower.includes('column') && (lower.includes('status') || lower.includes('version'))
  const rlsBlocked = lower.includes('row-level security') || lower.includes('permission denied')

  if (schemaMismatch) {
    return new Error(
      'Assessments table schema mismatch. Ensure columns status and version exist in public.assessments.'
    )
  }

  if (rlsBlocked) {
    return new Error(
      'Supabase RLS blocked assessment save. Add INSERT policy for auth.uid() = user_id on public.assessments.'
    )
  }

  return new Error(`Unable to save assessment result: ${errorMessage}`)
}

export async function saveAssessment(input: AssessmentSaveInput) {
  const userId = await requireAuthenticatedUserId()
  const assessmentType = normalizeAssessmentType(input.type)
  const status = input.status ?? 'completed'
  const version = input.version ?? 'v1'

  console.log('[Assessment] started', {
    assessmentType,
    inputType: input.type,
  })
  console.log('[Assessment] payload mapped', {
    assessmentType,
    status,
    version,
    answerKeys: Object.keys(input.answers || {}),
  })

  console.log('[Assessment][DB] Insert start', {
    userId,
    assessmentType,
  })

  const { data, error } = await supabase
    .from('assessments')
    .insert({
      user_id: userId,
      assessment_type: assessmentType,
      status,
      version,
      answers: input.answers,
      score_payload: input.scorePayload,
    })
    .select('*')
    .single()

  if (error) {
    console.error('[Assessment][DB] insert failure', {
      assessmentType,
      message: error.message,
      details: error.details,
      hint: error.hint,
    })
    throw formatAssessmentSaveError(error.message)
  }

  console.log('[Assessment][DB] Insert success', {
    userId,
    assessmentType,
    assessmentId: data.id,
  })

  await triggerWeeklyInsightPipelineSafely(userId, 'assessments_insert')

  return data
}

export async function loadLatestAssessmentByType(type: string) {
  const userId = await requireAuthenticatedUserId()
  const canonicalType = normalizeAssessmentType(type)
  const queryTypes = Array.from(new Set([type, canonicalType]))

  const { data, error } = await supabase
    .from('assessments')
    .select('*')
    .eq('user_id', userId)
    .in('assessment_type', queryTypes)
    .eq('status', 'completed')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error('Failed loading latest assessment:', error)
    throw new Error('Unable to load assessment.')
  }

  return data
}

export async function loadLatestRISScore(): Promise<RISScore | null> {
  const assessment = await loadLatestAssessmentByType('relationship_intelligence_score')
  if (!assessment || !assessment.score_payload) {
    return null
  }

  const payload = assessment.score_payload as Record<string, unknown>
  const direct = payload as Partial<RISScore>

  if (
    typeof direct.overall === 'number' &&
    typeof direct.understand === 'number' &&
    typeof direct.align === 'number' &&
    typeof direct.elevate === 'number'
  ) {
    return {
      overall: direct.overall,
      understand: direct.understand,
      align: direct.align,
      elevate: direct.elevate,
      delta: typeof direct.delta === 'number' ? direct.delta : undefined,
      lastUpdated: String(direct.lastUpdated ?? assessment.created_at),
    }
  }

  if (typeof payload.score === 'number') {
    const score = payload.score
    return {
      overall: score,
      understand: score,
      align: score,
      elevate: score,
      lastUpdated: assessment.created_at,
    }
  }

  return null
}

export async function saveRelationshipIntelligenceScore(
  answers: Record<string, unknown>,
  scorePayload: RISScore & Record<string, unknown>
) {
  return saveAssessment({
    type: 'relationship_intelligence_score',
    status: 'completed',
    version: 'v1',
    answers,
    scorePayload,
  })
}
