import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { PricingCard } from '@/components/PricingCard'
import { ArrowLeft, Sparkle } from '@phosphor-icons/react'
import { SubscriptionService } from '@/lib/subscription-service'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import type { Subscription, BillingCycle } from '@/lib/types'
import { getCurrentSubscription, upsertSubscription } from '@/lib/db/subscriptions'
import { authService } from '@/lib/auth-service'
import { useEffect } from 'react'

export type AppView =
  | 'login'
  | 'register'
  | 'forgot-password'
  | 'reset-password'
  | 'onboarding'
  | 'dashboard'
  | 'ai-coach'
  | 'check-in'
  | 'check-in-history'
  | 'understand'
  | 'align'
  | 'elevate'
  | 'profile'
  | 'pricing'

interface PricingProps {
  onNavigate: (view: AppView) => void
  backButtonLabel?: string
  showBackButton?: boolean
  isMarketingPage?: boolean
}

export function Pricing({
  onNavigate,
  backButtonLabel = 'Back to Dashboard',
  showBackButton = true,
  isMarketingPage = false,
}: PricingProps) {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly')
  const [isProcessing, setIsProcessing] = useState(false)
  const [subscription, setSubscription] = useState<Subscription | null>(null)

  useEffect(() => {
    const loadSubscription = async () => {
      try {
        const current = await getCurrentSubscription()
        setSubscription(current)
      } catch (error) {
        console.error('Failed loading subscription in pricing view:', error)
      }
    }

    void loadSubscription()
  }, [])

  const plans = SubscriptionService.getPlans()

  const handleSelectPlan = async (planId: string) => {
    const user = authService.getSession()
    if (!user) {
      toast.error('Please log in to upgrade your plan')
      onNavigate('login')
      return
    }

    setIsProcessing(true)

    try {
      const newSubscription = await SubscriptionService.createSubscription(
        user.id,
        planId,
        billingCycle,
        user.email,
        true
      )

      const savedSubscription = await upsertSubscription(newSubscription)
      setSubscription(savedSubscription)

      const plan = SubscriptionService.getPlanById(planId)
      toast.success(
        plan?.priceMonthly === 0
          ? 'Welcome to LoveSpark!'
          : `Successfully upgraded to ${plan?.displayName}!`
      )

      setTimeout(() => {
        onNavigate('dashboard')
      }, 1000)
    } catch (error) {
      if (error instanceof Error && error.message === 'REDIRECTING_TO_PADDLE') {
        return
      }
      toast.error('Failed to process subscription. Please try again.')
      console.error('Subscription error:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const scrollToPlans = () => {
    document
      .getElementById('pricing-cards')
      ?.scrollIntoView({ behavior: 'smooth' })
  }

  const outerClasses = isMarketingPage ? 'py-12 pb-20' : 'min-h-screen bg-background'
  const containerClasses = isMarketingPage
    ? 'container mx-auto px-4 sm:px-6 lg:px-8'
    : 'container max-w-7xl mx-auto px-4 py-8'

  return (
    <div className={outerClasses}>
      <div className={containerClasses}>
        {showBackButton && (
          <Button
            variant="ghost"
            onClick={() => onNavigate('dashboard')}
            className="mb-6"
          >
            <ArrowLeft className="mr-2" />
            {backButtonLabel}
          </Button>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={isMarketingPage ? 'text-center max-w-3xl mx-auto mb-14' : 'text-center mb-16'}
        >
          {isMarketingPage ? (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
              <Sparkle className="text-primary" size={20} weight="fill" />
              <span className="text-sm font-medium text-primary">Pricing</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 mb-6">
              <Sparkle className="text-secondary" size={32} weight="fill" />
            </div>
          )}
          <h1 className={isMarketingPage ? 'text-5xl sm:text-6xl font-bold text-foreground mb-6 leading-tight' : 'text-4xl md:text-5xl font-bold text-foreground mb-6'}>
            Choose Your Growth Path
          </h1>
          <p className={isMarketingPage ? 'text-xl text-muted-foreground leading-relaxed' : 'text-xl text-muted-foreground max-w-2xl mx-auto mb-8'}>
            Select the plan that best fits your relationship intelligence
            journey
          </p>
          <Button
            onClick={scrollToPlans}
            variant="outline"
            size="lg"
            className={isMarketingPage ? 'group mt-8' : 'group'}
          >
            View Plans
            <motion.div
              animate={{ y: [0, 4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="ml-2"
            >
              ↓
            </motion.div>
          </Button>
        </motion.div>

        <div id="pricing-cards" className={isMarketingPage ? 'mb-14' : 'mb-12'}>
          <div className="flex items-center justify-center gap-4 mb-10">
            <span
              className={
                billingCycle === 'monthly'
                  ? 'text-foreground font-semibold'
                  : 'text-muted-foreground'
              }
            >
              Monthly
            </span>
            <Switch
              checked={billingCycle === 'yearly'}
              onCheckedChange={(checked) =>
                setBillingCycle(checked ? 'yearly' : 'monthly')
              }
            />
            <span
              className={
                billingCycle === 'yearly'
                  ? 'text-foreground font-semibold'
                  : 'text-muted-foreground'
              }
            >
              Yearly
            </span>
            {billingCycle === 'yearly' && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-secondary font-semibold text-sm ml-2"
              >
                Save up to 48%
              </motion.span>
            )}
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <PricingCard
                  plan={plan}
                  billingCycle={billingCycle}
                  savings={SubscriptionService.calculateSavings(plan.id)}
                  isCurrentPlan={subscription?.planId === plan.id}
                  onSelect={() => handleSelectPlan(plan.id)}
                  isLoading={isProcessing}
                />
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="max-w-3xl mx-auto text-center"
        >
          <div className={isMarketingPage ? 'bg-card rounded-2xl border border-border/50 p-8 md:p-10 shadow-xl' : 'bg-accent/10 border border-accent/20 rounded-xl p-8'}>
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Not sure which plan is right for you?
            </h3>
            <p className="text-muted-foreground mb-6">
              Start with our free plan and upgrade anytime as your needs grow.
              All plans include our core RIS tracking and weekly check-ins.
            </p>
            <Button
              onClick={() => handleSelectPlan('plan-free')}
              variant="outline"
              size="lg"
              disabled={
                isProcessing || subscription?.planName === 'FREE'
              }
            >
              Start Free Today
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
