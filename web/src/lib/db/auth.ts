import { supabase } from '@/lib/supabase'

export async function getAuthenticatedUserId(): Promise<string | null> {
  if (!supabase) {
    console.warn('[Auth] Supabase not initialized')
    return null
  }

  try {
    const { data, error } = await supabase.auth.getUser()
    if (error) {
      console.error('[Auth] Failed to get authenticated user:', error.message)
      return null
    }
    const userId = data.user?.id ?? null
    if (userId) {
      console.log('[Auth] Got authenticated user ID:', userId)
    }
    return userId
  } catch (error) {
    console.error('[Auth] Exception while getting user:', error)
    return null
  }
}

export async function requireAuthenticatedUserId(): Promise<string> {
  const userId = await getAuthenticatedUserId()
  if (!userId) {
    const message = 'You must be signed in to continue.'
    console.error('[Auth]', message)
    throw new Error(message)
  }
  return userId
}
