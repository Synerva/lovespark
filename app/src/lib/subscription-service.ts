import type { 
  SubscriptionPlan, 
  Subscription, 
  SubscriptionPlanName, 
  BillingCycle, 
  PaymentIntent 
} from './types'
import { PaddleService } from './paddle-service'

const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'plan-free',
    name: 'FREE',
    displayName: 'Free',
    priceMonthly: 0,
    priceYearly: 0,
    features: [
      'Limited AI coaching (5 messages/week)',
      'Basic relationship insights',
      'Weekly check-ins',
      'RIS Score tracking',
      'Individual mode only',
      'Limited assessments (2 max)',
    ],
    isActive: true,
  },
  {
    id: 'plan-premium',
    name: 'PREMIUM',
    displayName: 'Premium',
    priceMonthly: 24,
    priceYearly: 149,
    features: [
      'Unlimited AI coaching',
      'Deep relationship insights',
      'Advanced pattern analysis',
      'Priority support',
      'All assessments unlocked',
      'Progress analytics',
    ],
    isPopular: true,
    isActive: true,
  },
]

export class SubscriptionService {
  static getPlans(): SubscriptionPlan[] {
    return SUBSCRIPTION_PLANS.filter(plan => plan.isActive)
  }

  static getPlanById(planId: string): SubscriptionPlan | undefined {
    return SUBSCRIPTION_PLANS.find(plan => plan.id === planId)
  }

  static getPlanByName(planName: SubscriptionPlanName): SubscriptionPlan | undefined {
    return SUBSCRIPTION_PLANS.find(plan => plan.name === planName)
  }

  static calculatePrice(planId: string, billingCycle: BillingCycle): number {
    const plan = this.getPlanById(planId)
    if (!plan) return 0
    return billingCycle === 'monthly' ? plan.priceMonthly : plan.priceYearly
  }

  static calculateSavings(planId: string): number {
    const plan = this.getPlanById(planId)
    if (!plan) return 0
    const yearlyMonthly = plan.priceYearly / 12
    const monthlyCost = plan.priceMonthly
    if (monthlyCost === 0) return 0
    return Math.round(((monthlyCost - yearlyMonthly) / monthlyCost) * 100)
  }

  static async createPaymentIntent(
    amount: number,
    currency: string = 'eur'
  ): Promise<PaymentIntent> {
    await new Promise(resolve => setTimeout(resolve, 1500))

    return {
      id: `pi_mock_${Date.now()}`,
      amount,
      currency,
      status: 'succeeded',
    }
  }

  static async createSubscription(
    userId: string,
    planId: string,
    billingCycle: BillingCycle,
    userEmail?: string,
    usePaddle: boolean = true
  ): Promise<Subscription> {
    const plan = this.getPlanById(planId)
    if (!plan) {
      throw new Error('Invalid plan')
    }

    const amount = this.calculatePrice(planId, billingCycle)

    if (amount > 0 && usePaddle && PaddleService.isPaddleConfigured() && userEmail) {
      const priceId = PaddleService.getPriceId(plan.name, billingCycle)
      
      if (priceId) {
        await PaddleService.openCheckout(
          userId,
          userEmail,
          priceId,
          plan.displayName
        )
        
        throw new Error('REDIRECTING_TO_PADDLE')
      }
    } else if (amount > 0) {
      const paymentIntent = await this.createPaymentIntent(amount)
      if (paymentIntent.status !== 'succeeded') {
        throw new Error('Payment failed')
      }
    }

    const startDate = new Date()
    const renewalDate = new Date(startDate)
    if (billingCycle === 'monthly') {
      renewalDate.setMonth(renewalDate.getMonth() + 1)
    } else {
      renewalDate.setFullYear(renewalDate.getFullYear() + 1)
    }

    const subscription: Subscription = {
      id: `sub_${Date.now()}`,
      userId,
      planId: plan.id,
      planName: plan.name,
      status: 'active',
      billingCycle,
      startDate: startDate.toISOString(),
      renewalDate: renewalDate.toISOString(),
      createdAt: startDate.toISOString(),
    }

    return subscription
  }

  static async cancelSubscription(subscription: Subscription): Promise<Subscription> {
    await new Promise(resolve => setTimeout(resolve, 500))

    return {
      ...subscription,
      status: 'canceled',
    }
  }

  static hasFeatureAccess(
    subscription: Subscription | null,
    feature: string
  ): boolean {
    if (!subscription || subscription.status !== 'active') {
      const freePlan = this.getPlanByName('FREE')
      return freePlan?.features.includes(feature) || false
    }

    const plan = this.getPlanById(subscription.planId)
    if (!plan) return false

    return plan.features.includes(feature)
  }

  static canAccessPremiumFeatures(subscription: Subscription | null): boolean {
    if (!subscription || subscription.status !== 'active') {
      return false
    }

    const plan = this.getPlanById(subscription.planId)
    return plan?.name === 'PREMIUM' || false
  }
}
