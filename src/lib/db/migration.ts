import type { AIMessage, CheckIn, Insight, OnboardingProfile, RISScore, Subscription, User } from '@/lib/types'

const migrationPrefix = 'lovespark-migration-complete'

declare global {
  interface Window {
    spark?: {
      kv: {
        get: <T>(key: string) => Promise<T | null>
        set: <T>(key: string, value: T) => Promise<void>
      }
    }
  }
}

function migrationKey(feature: string) {
  return `${migrationPrefix}:${feature}`
}

export function hasFeatureMigrationCompleted(feature: string): boolean {
  return localStorage.getItem(migrationKey(feature)) === 'true'
}

export function markFeatureMigrationCompleted(feature: string) {
  localStorage.setItem(migrationKey(feature), 'true')
}

async function readSparkKV<T>(keys: string[]): Promise<T | null> {
  if (!window.spark?.kv) {
    return null
  }

  for (const key of keys) {
    try {
      const value = await window.spark.kv.get<T>(key)
      if (value !== null && value !== undefined) {
        return value
      }
    } catch (error) {
      console.error(`Legacy migration read failed for key ${key}:`, error)
    }
  }

  return null
}

export async function loadLegacyOnboarding(userId: string) {
  return readSparkKV<OnboardingProfile>([
    `lovespark-onboarding-profile-${userId}`,
    'lovespark-onboarding-profile',
  ])
}

export async function loadLegacyRIS(userId: string) {
  return readSparkKV<RISScore>([`lovespark-ris-score-${userId}`, 'lovespark-ris-score'])
}

export async function loadLegacyUser(userId: string) {
  return readSparkKV<User>([`lovespark-user-${userId}`, 'lovespark-user'])
}

export async function loadLegacyMessages(userId: string) {
  return readSparkKV<AIMessage[]>([`lovespark-ai-messages-${userId}`, 'lovespark-ai-messages'])
}

export async function loadLegacyCheckIns() {
  return readSparkKV<CheckIn[]>(['lovespark-check-ins'])
}

export async function loadLegacyInsights() {
  return readSparkKV<Insight[]>(['lovespark-insights'])
}

export async function loadLegacySubscription() {
  return readSparkKV<Subscription>(['lovespark-subscription'])
}
