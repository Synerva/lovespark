import { loadStripe, Stripe, StripeElements } from '@stripe/stripe-js'
import type { 
  BillingCycle, 
  SubscriptionPlanName 
} from './types'

const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_key_here'

let stripePromise: Promise<Stripe | null> | null = null

const STRIPE_PRICE_IDS = {
  PREMIUM_MONTHLY: 'price_premium_monthly',
  PREMIUM_YEARLY: 'price_premium_yearly',
  PREMIUM_COACHING_MONTHLY: 'price_coaching_monthly',
  PREMIUM_COACHING_YEARLY: 'price_coaching_yearly',
} as const

export interface StripeCheckoutSession {
  id: string
  url: string | null
}

export interface StripeCustomer {
  id: string
  email: string
  name?: string
}

export interface StripeSubscription {
  id: string
  customerId: string
  priceId: string
  status: 'active' | 'canceled' | 'past_due' | 'unpaid' | 'incomplete'
  currentPeriodEnd: number
  cancelAtPeriodEnd: boolean
}

export class StripeService {
  static async getStripe(): Promise<Stripe | null> {
    if (!stripePromise) {
      stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY)
    }
    return stripePromise
  }

  static getPriceId(planName: SubscriptionPlanName, billingCycle: BillingCycle): string | null {
    if (planName === 'FREE') return null

    if (planName === 'PREMIUM') {
      return billingCycle === 'monthly' 
        ? STRIPE_PRICE_IDS.PREMIUM_MONTHLY 
        : STRIPE_PRICE_IDS.PREMIUM_YEARLY
    }

    if (planName === 'PREMIUM_COACHING') {
      return billingCycle === 'monthly'
        ? STRIPE_PRICE_IDS.PREMIUM_COACHING_MONTHLY
        : STRIPE_PRICE_IDS.PREMIUM_COACHING_YEARLY
    }

    return null
  }

  static async createCheckoutSession(
    userId: string,
    userEmail: string,
    priceId: string,
    planName: string
  ): Promise<StripeCheckoutSession> {
    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          email: userEmail,
          priceId,
          planName,
          successUrl: `${window.location.origin}/subscription/success`,
          cancelUrl: `${window.location.origin}/pricing`,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create checkout session')
      }

      const session = await response.json()
      return session
    } catch (error) {
      console.error('Stripe checkout session error:', error)
      throw error
    }
  }

  static async redirectToCheckout(checkoutUrl: string): Promise<void> {
    window.location.href = checkoutUrl
  }

  static async createCustomerPortalSession(customerId: string): Promise<{ url: string }> {
    try {
      const response = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId,
          returnUrl: `${window.location.origin}/profile`,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create portal session')
      }

      const session = await response.json()
      return session
    } catch (error) {
      console.error('Stripe portal session error:', error)
      throw error
    }
  }

  static async getSubscription(subscriptionId: string): Promise<StripeSubscription> {
    try {
      const response = await fetch(`/api/stripe/subscription/${subscriptionId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch subscription')
      }

      const subscription = await response.json()
      return subscription
    } catch (error) {
      console.error('Stripe get subscription error:', error)
      throw error
    }
  }

  static async cancelSubscription(subscriptionId: string): Promise<StripeSubscription> {
    try {
      const response = await fetch(`/api/stripe/subscription/${subscriptionId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to cancel subscription')
      }

      const subscription = await response.json()
      return subscription
    } catch (error) {
      console.error('Stripe cancel subscription error:', error)
      throw error
    }
  }

  static isStripeConfigured(): boolean {
    return STRIPE_PUBLISHABLE_KEY !== 'pk_test_your_key_here' && 
           STRIPE_PUBLISHABLE_KEY.startsWith('pk_')
  }

  static formatStripeAmount(amount: number): string {
    return (amount / 100).toFixed(2)
  }

  static formatStripeDate(timestamp: number): string {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }
}
