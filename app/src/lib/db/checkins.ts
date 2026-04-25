import { supabase } from '@/lib/supabase'
import type { CheckIn } from '@/lib/types'
import { requireAuthenticatedUserId } from './auth'
import { triggerWeeklyInsightPipeline } from './weekly-insight-pipeline'

export async function saveCheckIn(checkIn: CheckIn) {
  const userId = await requireAuthenticatedUserId()

  const { data, error } = await supabase
    .from('check_ins')
    .insert({
      user_id: userId,
      responses: checkIn.responses,
      score_before: checkIn.risScoreBefore,
      score_after: checkIn.risScoreAfter,
      insights_generated: checkIn.insightsGenerated,
      week_number: checkIn.weekNumber,
      completed_at: checkIn.completedAt,
    })
    .select('*')
    .single()

  if (error) {
    console.error('Failed saving check-in:', error)
    throw new Error('Unable to save check-in.')
  }

  console.log('[WeeklyPipeline] check-in saved', {
    userId,
    checkInId: data.id,
    completedAt: data.completed_at,
  })

  await triggerWeeklyInsightPipeline(userId, {
    forceRegenerate: true,
    source: 'weekly_check_in_completion',
  })

  return data
}

export async function loadCheckIns(): Promise<CheckIn[]> {
  const userId = await requireAuthenticatedUserId()

  const { data, error } = await supabase
    .from('check_ins')
    .select('*')
    .eq('user_id', userId)
    .order('completed_at', { ascending: true })

  if (error) {
    console.error('Failed loading check-ins:', error)
    throw new Error('Unable to load check-in history.')
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    userId: row.user_id,
    responses: (row.responses ?? []) as CheckIn['responses'],
    risScoreBefore: row.score_before as CheckIn['risScoreBefore'],
    risScoreAfter: row.score_after as CheckIn['risScoreAfter'],
    insightsGenerated: (row.insights_generated ?? []) as string[],
    completedAt: row.completed_at,
    weekNumber: row.week_number,
  }))
}
