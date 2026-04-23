import type { 
  BillingCycle, 
  SubscriptionPlanName 
} from './types'

declare global {
  interface Window {
    Paddle: any
  }
}

const PADDLE_ENVIRONMENT = import.meta.env.VITE_PADDLE_ENVIRONMENT || 'sandbox'
const PADDLE_CLIENT_TOKEN = import.meta.env.VITE_PADDLE_CLIENT_TOKEN || ''

const PADDLE_PRICE_IDS = {
  PREMIUM_MONTHLY: import.meta.env.VITE_PADDLE_PREMIUM_MONTHLY || 'pri_premium_monthly',
  PREMIUM_YEARLY: import.meta.env.VITE_PADDLE_PREMIUM_YEARLY || 'pri_premium_yearly',
  PREMIUM_COACHING_MONTHLY: import.meta.env.VITE_PADDLE_COACHING_MONTHLY || 'pri_coaching_monthly',
  PREMIUM_COACHING_YEARLY: import.meta.env.VITE_PADDLE_COACHING_YEARLY || 'pri_coaching_yearly',
} as const

export interface PaddleCheckoutOptions {
  items: Array<{
    priceId: string
    quantity: number
  }>
  customData?: {
    userId: string
    planName: string
  }
  customer?: {
    email?: string
  }
}

export interface PaddleSubscription {
  id: string
  customerId: string
  priceId: string
  status: 'active' | 'canceled' | 'past_due' | 'paused' | 'trialing'
  currentPeriodEnd: string
  canceledAt?: string
}

let paddleInitialized = false

export class PaddleService {
  static async initialize(): Promise<void> {
    if (paddleInitialized) return

    return new Promise((resolve, reject) => {
      if (window.Paddle) {
        this.setupPaddle()
        paddleInitialized = true
        resolve()
        return
      }

      const script = document.createElement('script')
      script.src = 'https://cdn.paddle.com/paddle/v2/paddle.js'
      script.async = true
      
      script.onload = () => {
        this.setupPaddle()
        paddleInitialized = true
        resolve()
      }
      
      script.onerror = () => {
        reject(new Error('Failed to load Paddle SDK'))
      }

      document.head.appendChild(script)
    })
  }

  private static setupPaddle(): void {
    if (!window.Paddle) {
      console.error('Paddle SDK not loaded')
      return
    }

    try {
      window.Paddle.Environment.set(PADDLE_ENVIRONMENT)
      
      if (PADDLE_CLIENT_TOKEN) {
        window.Paddle.Initialize({
          token: PADDLE_CLIENT_TOKEN,
          eventCallback: (data: any) => {
            console.log('Paddle event:', data)
            
            if (data.name === 'checkout.completed') {
              this.handleCheckoutCompleted(data)
            } else if (data.name === 'checkout.closed') {
              this.handleCheckoutClosed(data)
            }
          },
        })
      }
    } catch (error) {
      console.error('Paddle initialization error:', error)
    }
  }

  private static handleCheckoutCompleted(data: any): void {
    console.log('Checkout completed:', data)
    
    const event = new CustomEvent('paddle-checkout-completed', {
      detail: data,
    })
    window.dispatchEvent(event)
  }

  private static handleCheckoutClosed(data: any): void {
    console.log('Checkout closed:', data)
    
    const event = new CustomEvent('paddle-checkout-closed', {
      detail: data,
    })
    window.dispatchEvent(event)
  }

  static getPriceId(planName: SubscriptionPlanName, billingCycle: BillingCycle): string | null {
    if (planName === 'FREE') return null

    if (planName === 'PREMIUM') {
      return billingCycle === 'monthly' 
        ? PADDLE_PRICE_IDS.PREMIUM_MONTHLY 
        : PADDLE_PRICE_IDS.PREMIUM_YEARLY
    }

    if (planName === 'PREMIUM_COACHING') {
      return billingCycle === 'monthly'
        ? PADDLE_PRICE_IDS.PREMIUM_COACHING_MONTHLY
        : PADDLE_PRICE_IDS.PREMIUM_COACHING_YEARLY
    }

    return null
  }

  static async openCheckout(
    userId: string,
    userEmail: string,
    priceId: string,
    planName: string
  ): Promise<void> {
    await this.initialize()

    if (!window.Paddle) {
      throw new Error('Paddle SDK not initialized')
    }

    const options: PaddleCheckoutOptions = {
      items: [
        {
          priceId,
          quantity: 1,
        },
      ],
      customData: {
        userId,
        planName,
      },
    }

    if (userEmail) {
      options.customer = {
        email: userEmail,
      }
    }

    try {
      window.Paddle.Checkout.open(options)
    } catch (error) {
      console.error('Paddle checkout error:', error)
      throw error
    }
  }

  static async updatePaymentMethod(subscriptionId: string): Promise<void> {
    await this.initialize()

    if (!window.Paddle) {
      throw new Error('Paddle SDK not initialized')
    }

    try {
      window.Paddle.Checkout.open({
        settings: {
          displayMode: 'overlay',
          theme: 'light',
        },
        transactionId: subscriptionId,
      })
    } catch (error) {
      console.error('Paddle update payment method error:', error)
      throw error
    }
  }

  static isPaddleConfigured(): boolean {
    return PADDLE_CLIENT_TOKEN !== '' && PADDLE_CLIENT_TOKEN.length > 0
  }

  static getEnvironment(): string {
    return PADDLE_ENVIRONMENT
  }

  static async cancelSubscription(subscriptionId: string): Promise<void> {
    console.warn('Paddle subscription cancellation should be handled via webhook or Paddle dashboard')
    throw new Error('Cancellation must be processed server-side or via Paddle dashboard')
  }

  static formatPaddleDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  static onCheckoutCompleted(callback: (data: any) => void): () => void {
    const handler = (event: Event) => {
      callback((event as CustomEvent).detail)
    }
    
    window.addEventListener('paddle-checkout-completed', handler)
    
    return () => {
      window.removeEventListener('paddle-checkout-completed', handler)
    }
  }

  static onCheckoutClosed(callback: (data: any) => void): () => void {
    const handler = (event: Event) => {
      callback((event as CustomEvent).detail)
    }
    
    window.addEventListener('paddle-checkout-closed', handler)
    
    return () => {
      window.removeEventListener('paddle-checkout-closed', handler)
    }
  }
}
