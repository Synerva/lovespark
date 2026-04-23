import type { StripeCheckoutSession } from './stripe-service'

export class MockStripeAPI {
  static async createCheckoutSession(
    userId: string,
    userEmail: string,
    priceId: string,
    planName: string,
    successUrl: string,
    cancelUrl: string
  ): Promise<StripeCheckoutSession> {
    console.warn(
      '⚠️ Using Mock Stripe API - Configure real Stripe keys for production'
    )
    console.log('Mock Checkout Session Created:', {
      userId,
      userEmail,
      priceId,
      planName,
    })

    await new Promise((resolve) => setTimeout(resolve, 1000))

    return {
      id: `cs_mock_${Date.now()}`,
      url: null,
    }
  }

  static async createPortalSession(
    customerId: string,
    returnUrl: string
  ): Promise<{ url: string }> {
    console.warn('⚠️ Using Mock Stripe API - Configure real Stripe keys')

    await new Promise((resolve) => setTimeout(resolve, 500))

    return {
      url: returnUrl,
    }
  }

  static async getSubscription(subscriptionId: string) {
    console.warn('⚠️ Using Mock Stripe API')

    return {
      id: subscriptionId,
      customerId: 'cus_mock',
      priceId: 'price_mock',
      status: 'active' as const,
      currentPeriodEnd: Date.now() / 1000 + 2592000,
      cancelAtPeriodEnd: false,
    }
  }

  static async cancelSubscription(subscriptionId: string) {
    console.warn('⚠️ Using Mock Stripe API')

    return {
      id: subscriptionId,
      customerId: 'cus_mock',
      priceId: 'price_mock',
      status: 'canceled' as const,
      currentPeriodEnd: Date.now() / 1000 + 2592000,
      cancelAtPeriodEnd: true,
    }
  }
}
