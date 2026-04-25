import { supabase } from '@/lib/supabase'
import type { OnboardingProfile } from '@/lib/types'
import type { OnboardingComposite } from '@/types/domain'
import { requireAuthenticatedUserId } from './auth'
import { setOnboardingCompleted } from './profiles'
import { triggerWeeklyInsightPipelineSafely } from './weekly-insight-pipeline'

const MODULE_SCOPE = 'lovespark'

const onboardingKeys: Array<keyof OnboardingComposite> = [
  'relationshipStatus',
  'relationshipGoal',
  'mainChallenge',
  'communicationStyle',
  'conflictStyle',
  'emotionalAwareness',
]

interface OnboardingResponseUpsertRow {
  user_id: string
  question_key: keyof OnboardingComposite
  response_value: string
  response_payload: Record<string, unknown>
  module_scope: string
}

interface OnboardingUpsertResult {
  data: Array<{ question_key: keyof OnboardingComposite; module_scope: string }> | null
  error: Error | null
  verificationSkipped?: boolean
}

function formatOnboardingWriteError(message: string): Error {
  const lower = message.toLowerCase()
  const rlsBlocked = lower.includes('row-level security')
    || lower.includes('permission denied')
    || lower.includes('not allowed')

  if (rlsBlocked) {
    return new Error(
      'Supabase RLS blocked onboarding_responses write. Add INSERT/UPDATE policies for auth.uid() = user_id and module_scope = lovespark.'
    )
  }

  return new Error(`Unable to save onboarding responses: ${message}`)
}

function mapCompositeToOnboardingRows(
  userId: string,
  answers: OnboardingComposite,
): OnboardingResponseUpsertRow[] {
  return onboardingKeys.map((questionKey) => {
    const responseValue = String(answers[questionKey] ?? '')
    return {
      user_id: userId,
      question_key: questionKey,
      response_value: responseValue,
      response_payload: {
        questionKey,
        responseValue,
      },
      module_scope: MODULE_SCOPE,
    }
  })
}

async function upsertOnboardingRows(rows: OnboardingResponseUpsertRow[]) {
  const scopedConflictKey = 'user_id,question_key,module_scope'
  const legacyConflictKey = 'user_id,question_key'

  const tryWrite = async (onConflict: string) => {
    const attempt = await supabase
      .from('onboarding_responses')
      .upsert(rows, { onConflict })

    return attempt.error
  }

  let writeError = await tryWrite(scopedConflictKey)
  if (writeError && isSchemaMissingError(writeError.message ?? '')) {
    console.error('[Onboarding] onboarding_responses schema mismatch', {
      message: writeError.message,
      hint: 'Ensure onboarding_responses has module_scope, response_payload, and a matching unique conflict key.',
    })
    return {
      data: null,
      error: new Error('Onboarding table schema is missing required columns. Apply the onboarding_responses migration first.'),
    } satisfies OnboardingUpsertResult
  }

  if (!writeError) {
    return verifyOnboardingRows(rows)
  }

  const message = writeError.message ?? ''
  const noScopedConstraint = message.includes('ON CONFLICT specification')
    || message.includes('constraint')

  if (!noScopedConstraint) {
    return {
      data: null,
      error: formatOnboardingWriteError(message),
    } satisfies OnboardingUpsertResult
  }

  console.warn('[Onboarding] Scoped upsert conflict unavailable; retrying legacy conflict key')
  writeError = await tryWrite(legacyConflictKey)
  if (writeError) {
    return {
      data: null,
      error: formatOnboardingWriteError(writeError.message),
    } satisfies OnboardingUpsertResult
  }

  return verifyOnboardingRows(rows)
}

async function verifyOnboardingRows(rows: OnboardingResponseUpsertRow[]): Promise<OnboardingUpsertResult> {
  const userId = rows[0]?.user_id
  const keys = rows.map((row) => row.question_key)

  // Best-effort read-back verification: do not fail the write when RLS denies selects.
  const { data, error } = await supabase
    .from('onboarding_responses')
    .select('question_key,module_scope')
    .eq('user_id', userId)
    .eq('module_scope', MODULE_SCOPE)
    .in('question_key', keys)

  if (error) {
    console.warn('[Onboarding] onboarding_responses read-back skipped', {
      message: error.message,
      details: error.details,
      hint: 'Add SELECT RLS policy for onboarding_responses if you want strict read-back verification.',
    })
    return {
      data: null,
      error: null,
      verificationSkipped: true,
    }
  }

  return {
    data: (data ?? []) as Array<{ question_key: keyof OnboardingComposite; module_scope: string }>,
    error: null,
  }
}

function isSchemaMissingError(message: string): boolean {
  return message.includes("column 'response_payload' does not exist")
    || message.includes('column "response_payload" does not exist')
    || message.includes("column 'module_scope' does not exist")
    || message.includes('column "module_scope" does not exist')
}

export async function saveOnboardingResponse(questionKey: keyof OnboardingComposite, responseValue: unknown) {
  const userId = await requireAuthenticatedUserId()
  const value = String(responseValue ?? '')
  const rows = [
    {
      user_id: userId,
      question_key: questionKey,
      response_value: value,
      response_payload: {
        questionKey,
        responseValue: value,
      },
      module_scope: MODULE_SCOPE,
    },
  ]
  const { error } = await upsertOnboardingRows(rows)

  if (error) {
    console.error('[Onboarding] onboarding_responses upsert failure', error)
    throw error
  }

  console.log('[Onboarding][DB] Response saved', {
    userId,
    questionKey,
    moduleScope: MODULE_SCOPE,
  })

  await triggerWeeklyInsightPipelineSafely(userId, 'onboarding_responses_upsert_single')
}

export async function saveOnboardingComposite(answers: OnboardingComposite) {
  const userId = await requireAuthenticatedUserId()
  console.log('[Onboarding] save started', { userId, moduleScope: MODULE_SCOPE })

  const rows = mapCompositeToOnboardingRows(userId, answers)
  console.log('[Onboarding] answers mapped', {
    rowCount: rows.length,
    questionKeys: rows.map((row) => row.question_key),
  })

  const { data, error, verificationSkipped } = await upsertOnboardingRows(rows)

  if (error) {
    console.error('[Onboarding] onboarding_responses upsert failure', error)
    throw error
  }

  if (!verificationSkipped) {
    const persisted = new Set((data ?? []).map((row) => row.question_key as keyof OnboardingComposite))
    const missingKeys = onboardingKeys.filter((key) => !persisted.has(key))
    if (missingKeys.length > 0) {
      console.error('[Onboarding] onboarding_responses verification failure', {
        expectedKeys: onboardingKeys,
        persistedKeys: Array.from(persisted),
        missingKeys,
      })
      throw new Error('Onboarding write verification failed.')
    }
  }

  console.log('[Onboarding] onboarding_responses upsert success', {
    rowCount: data?.length ?? rows.length,
    moduleScope: MODULE_SCOPE,
    verificationSkipped: Boolean(verificationSkipped),
  })

  await triggerWeeklyInsightPipelineSafely(userId, 'onboarding_responses_upsert_composite')
}

export async function loadOnboardingComposite(): Promise<OnboardingComposite | null> {
  const userId = await requireAuthenticatedUserId()

  const { data, error } = await supabase
    .from('onboarding_responses')
    .select('question_key,response_value')
    .eq('user_id', userId)
    .eq('module_scope', MODULE_SCOPE)

  if (error) {
    console.error('Failed loading onboarding responses:', error)
    throw new Error('Unable to load onboarding responses.')
  }

  if (!data || data.length === 0) {
    return null
  }

  const byKey = new Map(data.map((row) => [row.question_key, row.response_value]))

  const composite: OnboardingComposite = {
    relationshipStatus: String(byKey.get('relationshipStatus') ?? ''),
    relationshipGoal: String(byKey.get('relationshipGoal') ?? ''),
    mainChallenge: String(byKey.get('mainChallenge') ?? ''),
    communicationStyle: String(byKey.get('communicationStyle') ?? ''),
    conflictStyle: String(byKey.get('conflictStyle') ?? ''),
    emotionalAwareness: String(byKey.get('emotionalAwareness') ?? ''),
  }

  return composite
}

export async function saveOnboardingProfile(profile: OnboardingProfile) {
  await saveOnboardingComposite({
    relationshipStatus: profile.relationshipStatus,
    relationshipGoal: profile.relationshipGoal,
    mainChallenge: profile.mainChallenge,
    communicationStyle: profile.communicationStyle,
    conflictStyle: profile.conflictStyle,
    emotionalAwareness: profile.emotionalAwareness,
  })

  await saveRISAssessment({
    score: profile.intelligenceScore,
    primaryPattern: profile.primaryPattern,
    strengths: profile.strengths,
    growthEdge: profile.growthEdge,
    createdAt: profile.createdAt,
  })
}

export async function completeOnboarding(profile?: OnboardingProfile) {
  if (profile) {
    await saveOnboardingProfile(profile)
  }
  console.log('[Onboarding] profiles.onboarding_completed update started')
  const updatedProfile = await setOnboardingCompleted(true)
  if (!updatedProfile?.onboarding_completed) {
    console.error('[Onboarding] profiles.onboarding_completed verification failure', {
      updatedProfile,
    })
    throw new Error('Failed to verify onboarding completion update.')
  }
  console.log('[Onboarding] profiles.onboarding_completed update success')
}

async function saveRISAssessment(payload: Record<string, unknown>) {
  const userId = await requireAuthenticatedUserId()
  console.log('[Onboarding][DB] Saving RIS assessment from onboarding', { userId })
  const { error } = await supabase.from('assessments').insert({
    user_id: userId,
    assessment_type: 'relationship_intelligence_score',
    answers: {},
    score_payload: payload,
  })

  if (error) {
    console.error('Failed saving RIS assessment from onboarding:', error)
    throw new Error('Unable to save onboarding assessment.')
  }

  console.log('[Onboarding][DB] RIS assessment saved from onboarding', { userId })
}
