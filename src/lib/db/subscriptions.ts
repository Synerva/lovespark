import { supabase } from '@/lib/supabase'
import type { Subscription } from '@/lib/types'
import { requireAuthenticatedUserId } from './auth'

function mapRowToSubscription(row: any): Subscription {
  return {
    id: row.id,
    userId: row.user_id,
    planId: row.plan_id,
    planName: row.plan_name,
    status: row.status,
    billingCycle: row.billing_cycle,
    startDate: row.created_at,
    renewalDate: row.renewal_date ?? row.created_at,
    createdAt: row.created_at,
    paddleCustomerId: row.paddle_customer_id ?? undefined,
    paddleSubscriptionId: row.paddle_subscription_id ?? undefined,
    paddlePriceId: row.paddle_price_id ?? undefined,
  }
}

export async function getCurrentSubscription(): Promise<Subscription | null> {
  const userId = await requireAuthenticatedUserId()

  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .eq('provider', 'paddle')
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error('Failed loading subscription:', error)
    throw new Error('Unable to load subscription.')
  }

  return data ? mapRowToSubscription(data) : null
}

export async function upsertSubscription(subscription: Subscription): Promise<Subscription> {
  const userId = await requireAuthenticatedUserId()

  const { data, error } = await supabase
    .from('subscriptions')
    .upsert(
      {
        id: subscription.id,
        user_id: userId,
        provider: 'paddle',
        plan_id: subscription.planId,
        plan_name: subscription.planName,
        status: subscription.status,
        billing_cycle: subscription.billingCycle,
        renewal_date: subscription.renewalDate,
        paddle_customer_id: subscription.paddleCustomerId ?? null,
        paddle_subscription_id: subscription.paddleSubscriptionId ?? null,
        paddle_price_id: subscription.paddlePriceId ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    )
    .select('*')
    .single()

  if (error) {
    console.error('Failed writing subscription:', error)
    throw new Error('Unable to save subscription state.')
  }

  return mapRowToSubscription(data)
}
