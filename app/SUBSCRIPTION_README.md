# LoveSpark Pricing & Subscription System

## Overview

Added a complete pricing page and subscription management system to the LoveSpark platform with mock payment processing ready for Stripe integration.

## What's New

### 1. **Pricing Page** (`/src/modules/Pricing.tsx`)
- Conversion-optimized design with hero section
- Three subscription tiers: FREE, PREMIUM, PREMIUM_COACHING
- Monthly/Yearly billing toggle with savings display
- Animated pricing cards with "Most Popular" badge
- Smooth scroll navigation and framer-motion animations

### 2. **Subscription Service** (`/src/lib/subscription-service.ts`)
- Centralized subscription and plan management
- Mock payment processing (ready for Stripe)
- Feature gating utilities
- Price calculation and savings computation
- Subscription creation, cancellation, and upgrade flows

### 3. **Type Definitions** (`/src/lib/types.ts`)
Extended with:
- `SubscriptionPlan` - Plan configuration
- `Subscription` - User subscription state
- `SubscriptionPlanName` - Plan identifiers (FREE, PREMIUM, PREMIUM_COACHING)
- `BillingCycle` - Monthly/Yearly billing
- `SubscriptionStatus` - Active, canceled, trial, expired
- `PaymentIntent` - Mock payment structure

### 4. **Components**
- **PricingCard** (`/src/components/PricingCard.tsx`) - Reusable pricing card with feature list
- Updated **ProfileSettings** - Added subscription management section with current plan display and upgrade button

### 5. **Application Integration**
- Added `'pricing'` view to App.tsx routing
- Onboarding now redirects to pricing page after completion
- Subscription state persisted using Spark KV API
- Bottom navigation excludes pricing page

## Subscription Plans

### FREE (€0/month)
- Limited AI coaching (5 messages/week)
- Basic relationship insights
- Weekly check-ins
- RIS Score tracking
- Individual mode only

### PREMIUM (€24/month or €149/year)
- Unlimited AI coaching
- Deep relationship insights
- Advanced pattern analysis
- Couple mode access
- Priority support
- All assessments unlocked
- Progress analytics

### PREMIUM + COACHING (€49/month or €349/year)
- Everything in Premium
- Monthly psychologist session
- Personalized growth protocols
- Relationship strategy planning
- Direct expert support
- Partner integration guidance

## User Flow

1. **Onboarding Completion** → Redirects to pricing page
2. **Plan Selection** → Mock payment processing (1.5s delay)
3. **Success** → Subscription saved to KV storage → Redirect to dashboard
4. **Management** → Users can view/upgrade from Profile Settings

## Data Persistence

All subscription data is stored using the Spark KV API:
- `lovespark-subscription` - Current user subscription

## Payment Integration

### Current: Mock Payment Service
- Simulates payment processing with 1.5s delay
- Always returns success for testing
- Generates mock payment intent IDs

### Future: Stripe Integration
The `SubscriptionService.createPaymentIntent` method is designed to be replaced with:

```typescript
// Future Stripe implementation
static async createPaymentIntent(amount: number, currency: string = 'eur'): Promise<PaymentIntent> {
  const response = await fetch('/api/create-payment-intent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount, currency })
  })
  return response.json()
}
```

## Feature Gating

Use `SubscriptionService` utilities to gate features:

```typescript
import { SubscriptionService } from '@/lib/subscription-service'

// Check if user has premium access
const hasPremium = SubscriptionService.canAccessPremiumFeatures(subscription)

// Check specific feature
const hasFeature = SubscriptionService.hasFeatureAccess(subscription, 'Unlimited AI coaching')

// Check coaching access
const hasCoaching = SubscriptionService.canAccessCoaching(subscription)
```

## Files Modified

- `/src/lib/types.ts` - Added subscription types
- `/src/App.tsx` - Added pricing route and onboarding flow
- `/src/modules/ProfileSettings.tsx` - Added subscription management card

## Files Created

- `/src/lib/subscription-service.ts` - Subscription business logic
- `/src/modules/Pricing.tsx` - Pricing page module
- `/src/components/PricingCard.tsx` - Pricing card component
- `SUBSCRIPTION_README.md` - This file

## Next Steps

1. **Implement Stripe Integration**
   - Create backend `/api/create-payment-intent` endpoint
   - Add Stripe Elements for card input
   - Handle webhooks for subscription events
   
2. **Add Feature Gates**
   - Limit AI messages for FREE users
   - Lock couple mode for FREE users
   - Restrict assessments by plan
   
3. **Subscription Management**
   - Add cancellation flow
   - Implement downgrade logic
   - Add billing history
   
4. **Analytics**
   - Track conversion rates
   - Monitor upgrade paths
   - A/B test pricing page variants

## Testing

To test the pricing system:

1. Complete onboarding (will redirect to pricing)
2. Select any plan and click "Upgrade Now"
3. Wait for mock payment processing
4. Verify redirect to dashboard
5. Check Profile Settings for subscription details
6. Click "Change Plan" to return to pricing

All plans can be selected multiple times for testing. Free plan is always available.
