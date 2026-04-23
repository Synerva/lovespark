import { supabase } from '@/lib/supabase'
import type { User } from '@/lib/types'
import { getAuthenticatedUserId } from './auth'

export async function getOrCreateProfile(defaults?: Partial<User>) {
  if (!supabase) {
    const message = 'Supabase not initialized. Cannot load profile.'
    console.error('[Profiles]', message)
    throw new Error(message)
  }

  const userId = await getAuthenticatedUserId()
  if (!userId) {
    const message = 'No authenticated user. Cannot load profile.'
    console.error('[Profiles]', message)
    throw new Error(message)
  }

  console.log('[Profiles] Checking for existing profile:', userId)

  const { data: existing, error: selectError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()

  if (selectError) {
    console.error('[Profiles] Failed loading profile:', selectError.message)
    throw new Error('Unable to load profile: ' + selectError.message)
  }

  if (existing) {
    console.log('[Profiles] Profile found:', { id: existing.id, email: existing.email })
    return existing
  }

  console.log('[Profiles] No existing profile found, creating new one')

  const { data, error } = await supabase
    .from('profiles')
    .insert({
      id: userId,
      email: defaults?.email ?? null,
      full_name: defaults?.name ?? null,
      avatar_url: defaults?.avatarUrl ?? null,
      onboarding_completed: false,
      module_scope: 'lovespark',
      metadata: {},
    })
    .select('*')
    .single()

  if (error) {
    console.error('[Profiles] Failed creating profile:', error.message)
    throw new Error('Unable to create profile: ' + error.message)
  }

  if (!data) {
    const message = 'Profile creation succeeded but no data returned'
    console.error('[Profiles]', message)
    throw new Error(message)
  }

  console.log('[Profiles] Profile created successfully:', { id: data.id, email: data.email })
  return data
}

export async function updateProfile(values: {
  full_name?: string
  avatar_url?: string
  onboarding_completed?: boolean
  metadata?: Record<string, unknown>
}) {
  if (!supabase) {
    throw new Error('Supabase not initialized.')
  }

  const userId = await getAuthenticatedUserId()
  if (!userId) {
    throw new Error('No authenticated user.')
  }

  console.log('[Profiles] Updating profile:', userId)

  const { data, error } = await supabase
    .from('profiles')
    .update({ ...values, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select('*')
    .single()

  if (error) {
    console.error('[Profiles] Failed updating profile:', error.message)
    throw new Error('Unable to update profile.')
  }

  console.log('[Profiles] Profile updated successfully')
  return data
}

export async function setOnboardingCompleted(completed: boolean) {
  console.log('[Profiles] Setting onboarding_completed:', completed)
  return updateProfile({ onboarding_completed: completed })
}
