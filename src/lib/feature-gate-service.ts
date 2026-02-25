import type { Subscription, User } from './types'
import { SubscriptionService } from './subscription-service'

export interface UsageLimits {
  aiMessagesPerWeek: number
  currentWeekMessages: number
  weekStartDate: string
  assessmentsCompleted: number
  maxAssessments: number
  canAccessCoupleMode: boolean
  canAccessCoaching: boolean
  canAccessAdvancedAnalytics: boolean
}

export class FeatureGateService {
  private static readonly FREE_AI_MESSAGES_PER_WEEK = 5
  private static readonly FREE_MAX_ASSESSMENTS = 2

  static getUsageLimits(
    subscription: Subscription | null,
    messageCount: number,
    weekStartDate: string,
    assessmentsCompleted: number
  ): UsageLimits {
    const isPremium = SubscriptionService.canAccessPremiumFeatures(subscription)
    const hasCoaching = SubscriptionService.canAccessCoaching(subscription)

    return {
      aiMessagesPerWeek: isPremium ? -1 : this.FREE_AI_MESSAGES_PER_WEEK,
      currentWeekMessages: messageCount,
      weekStartDate,
      assessmentsCompleted,
      maxAssessments: isPremium ? -1 : this.FREE_MAX_ASSESSMENTS,
      canAccessCoupleMode: isPremium,
      canAccessCoaching: hasCoaching,
      canAccessAdvancedAnalytics: isPremium,
    }
  }

  static canSendAIMessage(subscription: Subscription | null, currentWeekMessages: number): boolean {
    const isPremium = SubscriptionService.canAccessPremiumFeatures(subscription)
    if (isPremium) return true

    return currentWeekMessages < this.FREE_AI_MESSAGES_PER_WEEK
  }

  static getRemainingAIMessages(subscription: Subscription | null, currentWeekMessages: number): number {
    const isPremium = SubscriptionService.canAccessPremiumFeatures(subscription)
    if (isPremium) return -1

    const remaining = this.FREE_AI_MESSAGES_PER_WEEK - currentWeekMessages
    return Math.max(0, remaining)
  }

  static canAccessAssessment(subscription: Subscription | null, assessmentsCompleted: number): boolean {
    const isPremium = SubscriptionService.canAccessPremiumFeatures(subscription)
    if (isPremium) return true

    return assessmentsCompleted < this.FREE_MAX_ASSESSMENTS
  }

  static canAccessCoupleMode(subscription: Subscription | null): boolean {
    return SubscriptionService.canAccessPremiumFeatures(subscription)
  }

  static canAccessCoaching(subscription: Subscription | null): boolean {
    return SubscriptionService.canAccessCoaching(subscription)
  }

  static canAccessAdvancedAnalytics(subscription: Subscription | null): boolean {
    return SubscriptionService.canAccessPremiumFeatures(subscription)
  }

  static getWeekStartDate(): string {
    const now = new Date()
    const dayOfWeek = now.getDay()
    const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1
    const monday = new Date(now)
    monday.setDate(now.getDate() - diff)
    monday.setHours(0, 0, 0, 0)
    return monday.toISOString()
  }

  static isNewWeek(lastWeekStartDate: string): boolean {
    const currentWeekStart = this.getWeekStartDate()
    return currentWeekStart !== lastWeekStartDate
  }

  static resetWeeklyLimits(): { messageCount: number; weekStartDate: string } {
    return {
      messageCount: 0,
      weekStartDate: this.getWeekStartDate(),
    }
  }
}
