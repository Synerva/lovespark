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
    <Card
      className={cn(
        'relative overflow-hidden transition-all duration-300 group hover:scale-105',
        plan.isPopular
          ? 'border-accent shadow-lg scale-105 bg-gradient-to-b from-card to-accent/5'
          : 'border-border hover:border-accent/50 hover:shadow-md'
      )}
    >
      {plan.isPopular && (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-accent/20 via-secondary/15 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-gradient-shift" />
          <div className="absolute top-0 right-0 bg-secondary text-secondary-foreground text-xs font-semibold px-4 py-1.5 rounded-bl-lg z-10">
            MOST POPULAR
          </div>
        </>
      )}
      
      {!plan.isPopular && (
        <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-primary/5 to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-gradient-pulse" />
      )}

      <div className="p-8">
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-foreground mb-2">
            {plan.displayName}
          </h3>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold text-foreground">
              €{displayPrice}
            </span>
            {!isFree && (
              <span className="text-muted-foreground">/month</span>
            )}
          </div>
          {billingCycle === 'yearly' && !isFree && savings > 0 && (
            <p className="text-sm text-secondary font-medium mt-1">
              Save {savings}% with yearly billing
            </p>
          )}
          {billingCycle === 'yearly' && !isFree && (
            <p className="text-xs text-muted-foreground mt-1">
              €{price} billed annually
            </p>
          )}
        </div>

        <Button
          onClick={onSelect}
          disabled={isCurrentPlan || isLoading}
          className={cn(
            'w-full mb-6',
            plan.isPopular
              ? 'bg-accent hover:bg-accent/90 text-accent-foreground'
              : ''
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

        <div className="space-y-3">
          {plan.features.map((feature, index) => (
            <div key={index} className="flex items-start gap-3">
              <Check
                className="text-accent flex-shrink-0 mt-0.5"
                weight="bold"
              />
              <span className="text-sm text-foreground">{feature}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}
