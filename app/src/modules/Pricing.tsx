import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { PricingCard } from '@/components/PricingCard'
import { PublicHeader } from '@/components/PublicHeader'
import { ArrowLeft, Sparkle } from '@phosphor-icons/react'
import { SubscriptionService } from '@/lib/subscription-service'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import type { AppView } from '@/App'
import type { Subscription, BillingCycle } from '@/lib/types'
import { getCurrentSubscription, upsertSubscription } from '@/lib/db/subscriptions'
import { authService } from '@/lib/auth-service'

interface PricingProps {
  onNavigate: (view: AppView) => void
}

export function Pricing({ onNavigate }: PricingProps) {
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
  const isAuthenticated = authService.isAuthenticated()

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <PublicHeader currentView="pricing" onNavigate={onNavigate} />

      <section className="relative overflow-hidden py-20 sm:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-align/5" />
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
          {isAuthenticated && (
            <div className="mb-8 flex justify-start">
              <Button
                variant="ghost"
                onClick={() => onNavigate('dashboard')}
                className="rounded-full border border-primary/10 bg-card/80 px-5 text-sm backdrop-blur-sm hover:bg-card"
              >
                <ArrowLeft className="mr-2" />
                Back to Dashboard
              </Button>
            </div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-4xl text-center"
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2">
              <Sparkle className="text-primary" size={20} weight="fill" />
              <span className="text-sm font-medium text-primary">
                AI-Powered Relationship Intelligence
              </span>
            </div>
            <h1 className="mb-6 text-5xl font-bold leading-tight text-foreground sm:text-6xl lg:text-7xl">
              Choose your{' '}
              <span className="bg-gradient-to-r from-primary via-secondary to-align bg-clip-text text-transparent">
                growth path
              </span>
            </h1>
            <p className="mx-auto mb-10 max-w-2xl text-xl leading-relaxed text-muted-foreground">
              Select the plan that best fits your relationship intelligence journey.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button
                size="lg"
                onClick={scrollToPlans}
                className="bg-gradient-to-r from-primary via-secondary to-align px-8 py-6 text-base shadow-[0_24px_60px_-30px_rgba(209,73,118,0.95)] transition-opacity hover:opacity-90"
              >
                View Plans
                <Sparkle className="ml-2" weight="fill" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="pricing-cards" className="pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-12 flex max-w-6xl justify-center">
            <div className="inline-flex flex-wrap items-center justify-center gap-3 rounded-full border border-primary/10 bg-card/80 p-2 shadow-[0_24px_60px_-40px_rgba(170,76,105,0.45)] backdrop-blur-sm">
              <Button
                type="button"
                onClick={() => setBillingCycle('monthly')}
                className={
                  billingCycle === 'monthly'
                    ? 'rounded-full bg-gradient-to-r from-primary via-secondary to-align px-5 text-primary-foreground hover:opacity-90'
                    : 'rounded-full bg-transparent px-5 text-foreground/70 shadow-none hover:bg-primary/5 hover:text-foreground'
                }
              >
                Monthly
              </Button>
              <Button
                type="button"
                onClick={() => setBillingCycle('yearly')}
                className={
                  billingCycle === 'yearly'
                    ? 'rounded-full bg-gradient-to-r from-primary via-secondary to-align px-5 text-primary-foreground hover:opacity-90'
                    : 'rounded-full bg-transparent px-5 text-foreground/70 shadow-none hover:bg-primary/5 hover:text-foreground'
                }
              >
                Yearly
              </Button>
              <motion.span
                key={billingCycle}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary"
              >
                Save up to 48%
              </motion.span>
            </div>
          </div>

          <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                className="h-full"
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

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="mx-auto mt-16 max-w-3xl text-center"
          >
            <div className="rounded-[28px] border border-primary/10 bg-gradient-to-br from-white/90 via-primary/5 to-secondary/10 p-8 shadow-[0_28px_80px_-48px_rgba(170,76,105,0.45)] backdrop-blur-sm md:p-10">
              <h3 className="mb-4 text-2xl font-bold text-foreground md:text-3xl">
                Not sure which plan is right for you?
              </h3>
              <p className="mb-6 text-lg leading-relaxed text-muted-foreground">
                Start with our free plan and upgrade anytime as your needs grow.
                All plans include our core RIS tracking and weekly check-ins.
              </p>
              <Button
                onClick={() => handleSelectPlan('plan-free')}
                size="lg"
                disabled={isProcessing || subscription?.planName === 'FREE'}
                className="bg-gradient-to-r from-primary via-secondary to-align px-10 py-6 text-base shadow-[0_24px_60px_-30px_rgba(209,73,118,0.95)] transition-opacity hover:opacity-90"
              >
                Start Free Today
                <Sparkle className="ml-2" weight="fill" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
