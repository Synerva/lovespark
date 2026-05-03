import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import type { SubscriptionPlan, BillingCycle } from '@/lib/types'

interface PricingCardProps {
  plan: SubscriptionPlan
  billingCycle: BillingCycle
  savings: number
  isCurrentPlan?: boolean
  onSelect: () => void
  isLoading?: boolean
}

export function PricingCard({
  plan,
  billingCycle,
  savings,
  isCurrentPlan,
  onSelect,
  isLoading,
}: PricingCardProps) {
  const price = billingCycle === 'monthly' ? plan.priceMonthly : plan.priceYearly
  const displayPrice = billingCycle === 'monthly' ? price : Math.round(price / 12)
  const isFree = price === 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: 'spring',
        stiffness: 260,
        damping: 24,
        mass: 0.9,
      }}
      whileHover={{
        y: -8,
        transition: {
          type: 'spring',
          stiffness: 320,
          damping: 20,
        },
      }}
      whileTap={{
        y: -2,
        transition: {
          type: 'spring',
          stiffness: 420,
          damping: 28,
        },
      }}
    >
      <Card
        className={cn(
          'relative flex h-full flex-col overflow-hidden rounded-[28px] border bg-card/90 shadow-[0_28px_80px_-48px_rgba(170,76,105,0.45)] backdrop-blur-sm transition-all duration-300',
          plan.isPopular
            ? 'border-primary/25 bg-gradient-to-b from-white via-primary/5 to-secondary/10 shadow-[0_32px_90px_-44px_rgba(209,73,118,0.55)]'
            : 'border-primary/10'
        )}
      >
      {plan.isPopular && (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/10 to-align/10 opacity-80" />
          <div className="absolute right-6 top-6 z-10 rounded-full bg-gradient-to-r from-primary via-secondary to-align px-4 py-1.5 text-xs font-semibold tracking-[0.18em] text-primary-foreground shadow-[0_18px_40px_-20px_rgba(209,73,118,0.85)]">
            MOST POPULAR
          </div>
        </>
      )}
      
      {!plan.isPopular && (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/6 via-secondary/6 to-align/6 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      )}

      <div className="relative flex h-full flex-col p-8 md:p-9">
        <div className="mb-8">
          <h3 className="mb-3 text-2xl font-bold text-foreground md:text-3xl">
            {plan.displayName}
          </h3>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-bold leading-none text-foreground md:text-5xl">
              €{displayPrice}
            </span>
            {!isFree && (
              <span className="pb-1 text-sm font-medium text-muted-foreground">/month</span>
            )}
          </div>
          {billingCycle === 'yearly' && !isFree && savings > 0 && (
            <p className="mt-2 text-sm font-medium text-primary">
              Save {savings}% with yearly billing
            </p>
          )}
          {billingCycle === 'yearly' && !isFree && (
            <p className="mt-1 text-xs text-muted-foreground">
              €{price} billed annually
            </p>
          )}
        </div>

        <Button
          onClick={onSelect}
          disabled={isCurrentPlan || isLoading}
          className={cn(
            'mb-8 h-auto w-full rounded-full px-8 py-6 text-base font-semibold shadow-[0_24px_50px_-28px_rgba(209,73,118,0.9)] transition-opacity',
            plan.isPopular
              ? 'bg-gradient-to-r from-primary via-secondary to-align text-primary-foreground hover:opacity-90'
              : isCurrentPlan
              ? 'bg-primary/10 text-primary hover:bg-primary/10'
              : 'bg-gradient-to-r from-primary via-secondary to-align text-primary-foreground hover:opacity-90'
          )}
          size="lg"
        >
          {isLoading
            ? 'Processing...'
            : isCurrentPlan
            ? 'Current Plan'
            : isFree
            ? 'Start Free'
            : 'Upgrade Now'}
        </Button>

        <div className="mt-auto space-y-4">
          {plan.features.map((feature, index) => (
            <div key={index} className="flex items-start gap-3">
              <Check
                className="mt-0.5 flex-shrink-0 text-primary"
                weight="bold"
              />
              <span className="text-sm leading-6 text-foreground/88">{feature}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
    </motion.div>
  )
}
