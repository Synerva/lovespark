import { supabase } from '@/lib/supabase'
import type { Insight } from '@/lib/types'
import { requireAuthenticatedUserId } from './auth'

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
