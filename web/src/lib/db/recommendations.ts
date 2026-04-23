import { supabase } from '@/lib/supabase'
import type { Insight, MicroAction, MicroActionCompletion } from '@/lib/types'
import { requireAuthenticatedUserId } from './auth'

export async function saveRecommendationsFromInsights(insights: Insight[]) {
  const userId = await requireAuthenticatedUserId()
  const actionableInsights = insights.filter((insight) => Boolean(insight.actionable))

  if (actionableInsights.length === 0) {
    return
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

  const { error } = await supabase.from('recommendations').insert(rows)
  if (error) {
    console.error('Failed saving recommendations from insights:', error)
    throw new Error('Unable to save recommendations.')
  }
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
