import { supabase } from '@/lib/supabase'
import { requireAuthenticatedUserId } from './auth'
import { generateWeeklyInsight } from './insights'
import { generateMicroActions } from './recommendations'

const WEEKLY_INSIGHT_TYPE = 'weekly'
const REGEN_COOLDOWN_MS = 24 * 60 * 60 * 1000

interface PipelineResult {
  skipped: boolean
  reason: 'cooldown' | 'generated' | 'error'
  insightId?: string
  microActionsInserted: number
  recommendationsInserted: number
}

interface TriggerWeeklyInsightPipelineOptions {
  forceRegenerate?: boolean
  source?: string
}

async function upsertWeeklyContentSnapshot(
  userId: string,
  source: string,
  payload: {
    insightId?: string
    microActionsInserted: number
    recommendationsInserted: number
  }
) {
  const snapshotPayload = {
    source,
    generatedAt: new Date().toISOString(),
    insightId: payload.insightId ?? null,
    microActionsInserted: payload.microActionsInserted,
    recommendationsInserted: payload.recommendationsInserted,
  }

  const { error } = await supabase
    .from('state_snapshots')
    .upsert(
      {
        user_id: userId,
        key: 'weekly_content_last_generated',
        payload: snapshotPayload,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,key' }
    )

  if (error) {
    console.error('[WeeklyPipeline] state snapshot upsert failed', {
      userId,
      source,
      code: error.code,
      message: error.message,
      details: error.details,
    })
    throw error
  }

  console.log('[WeeklyPipeline] state snapshot created', {
    userId,
    key: 'weekly_content_last_generated',
    source,
  })
}

export async function triggerWeeklyInsightPipeline(
  userId: string,
  options: TriggerWeeklyInsightPipelineOptions = {}
): Promise<PipelineResult> {
  const source = options.source ?? 'pipeline'

  const { data: latestWeeklyInsight, error: latestError } = await supabase
    .from('insights')
    .select('id,created_at')
    .eq('user_id', userId)
    .eq('insight_type', WEEKLY_INSIGHT_TYPE)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (latestError) {
    throw latestError
  }

  let insightId: string | undefined
  let microActionsInserted = 0

  if (!options.forceRegenerate && latestWeeklyInsight?.created_at) {
    const createdAtMs = new Date(latestWeeklyInsight.created_at).getTime()
    const elapsedMs = Date.now() - createdAtMs

    if (Number.isFinite(createdAtMs) && elapsedMs < REGEN_COOLDOWN_MS) {
      insightId = latestWeeklyInsight.id
      const microActions = await generateMicroActions(userId, latestWeeklyInsight.id)
      microActionsInserted = microActions.length

      await upsertWeeklyContentSnapshot(userId, source, {
        insightId,
        microActionsInserted,
        recommendationsInserted: 0,
      })

      return {
        skipped: true,
        reason: 'cooldown',
        insightId,
        microActionsInserted,
        recommendationsInserted: 0,
      }
    }
  }

  const insight = await generateWeeklyInsight(userId)
  insightId = insight.id
  console.log('[WeeklyPipeline] weekly insight inserted with id', {
    userId,
    insightId: insight.id,
  })

  const microActions = await generateMicroActions(userId, insight.id)
  microActionsInserted = microActions.length
  console.log('[WeeklyPipeline] micro-actions inserted count', {
    userId,
    count: microActionsInserted,
    insightId: insight.id,
  })

  await upsertWeeklyContentSnapshot(userId, source, {
    insightId,
    microActionsInserted,
    recommendationsInserted: 0,
  })

  return {
    skipped: false,
    reason: 'generated',
    insightId,
    microActionsInserted,
    recommendationsInserted: 0,
  }
}

export async function triggerWeeklyInsightPipelineSafely(userId: string, source: string): Promise<PipelineResult> {
  try {
    const result = await triggerWeeklyInsightPipeline(userId, { source })
    console.log('[WeeklyPipeline] completed', {
      userId,
      source,
      skipped: result.skipped,
      reason: result.reason,
      insightId: result.insightId,
      microActionsInserted: result.microActionsInserted,
      recommendationsInserted: result.recommendationsInserted,
    })
    return result
  } catch (error) {
    console.error('[WeeklyPipeline] failed', {
      userId,
      source,
      error,
    })

    return {
      skipped: true,
      reason: 'error',
      microActionsInserted: 0,
      recommendationsInserted: 0,
    }
  }
}

export async function backfillCurrentUserWeeklyContent() {
  const userId = await requireAuthenticatedUserId()
  const result = await triggerWeeklyInsightPipeline(userId, {
    forceRegenerate: true,
    source: 'manual_backfill',
  })

  console.log('[WeeklyPipeline] manual backfill completed', {
    userId,
    skipped: result.skipped,
    reason: result.reason,
    insightId: result.insightId,
    microActionsInserted: result.microActionsInserted,
    recommendationsInserted: result.recommendationsInserted,
  })

  return result
}
