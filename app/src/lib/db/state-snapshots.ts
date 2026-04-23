import { supabase } from '@/lib/supabase'
import { requireAuthenticatedUserId } from './auth'

export async function getStateSnapshot<T>(key: string): Promise<T | null> {
  const userId = await requireAuthenticatedUserId()
  const { data, error } = await supabase
    .from('state_snapshots')
    .select('payload')
    .eq('user_id', userId)
    .eq('key', key)
    .maybeSingle()

  if (error) {
    console.error('Failed loading state snapshot:', error)
    throw new Error('Unable to load app state.')
  }

  return (data?.payload as T | undefined) ?? null
}

export async function upsertStateSnapshot<T>(key: string, payload: T) {
  const userId = await requireAuthenticatedUserId()
  const { error } = await supabase
    .from('state_snapshots')
    .upsert(
      {
        user_id: userId,
        key,
        payload,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,key' }
    )

  if (error) {
    console.error('Failed saving state snapshot:', error)
    throw new Error('Unable to persist app state.')
  }
}
