# Stripe Payment Integration Guide

## Overview

This LoveSpark application now includes **real Stripe payment processing** integration. The frontend is fully configured and ready to connect to Stripe Checkout for subscription payments.

## ✅ What's Implemented (Frontend)

### 1. Stripe Service (`src/lib/stripe-service.ts`)
- **Stripe.js Integration**: Uses `@stripe/stripe-js` for secure payment processing
- **Checkout Session Creation**: Creates Stripe Checkout sessions for subscriptions
- **Customer Portal**: Manages subscription updates and cancellations
- **Price ID Mapping**: Maps plan names to Stripe Price IDs
- **Configuration Detection**: Checks if Stripe is properly configured

### 2. Updated Subscription Service (`src/lib/subscription-service.ts`)
- **Stripe Integration**: Automatically redirects to Stripe Checkout for paid plans
- **Fallback Mode**: Falls back to mock payment if Stripe not configured
- **Email Support**: Passes user email to Stripe for customer creation

### 3. Updated Pricing Page (`src/modules/Pricing.tsx`)
- **Stripe Checkout Flow**: Handles Stripe redirect gracefully
- **Error Handling**: Catches and handles Stripe-specific errors
- **Loading States**: Shows processing state during payment

## 🔧 Backend Requirements

You need to implement the following backend API endpoints to complete the integration:

### Required Endpoints

#### 1. Create Checkout Session
```
POST /api/stripe/create-checkout-session
```

**Request Body:**
```json
{
  "userId": "string",
  "email": "string",
  "priceId": "string",
  "planName": "string",
  "successUrl": "string",
  "cancelUrl": "string"
}
```

**Response:**
```json
{
  "id": "cs_test_...",
  "url": "https://checkout.stripe.com/c/pay/..."
}
```

**Implementation Example (Node.js):**
```javascript
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

app.post('/api/stripe/create-checkout-session', async (req, res) => {
  try {
    const { userId, email, priceId, planName, successUrl, cancelUrl } = req.body;

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer_email: email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl + '?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: cancelUrl,
      client_reference_id: userId,
      metadata: {
        userId,
        planName,
      },
      subscription_data: {
        metadata: {
          userId,
          planName,
        },
      },
    });

    res.json({ id: session.id, url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});
```

#### 2. Create Customer Portal Session
```
POST /api/stripe/create-portal-session
```

**Request Body:**
```json
{
  "customerId": "cus_...",
  "returnUrl": "string"
}
```

**Response:**
```json
{
  "url": "https://billing.stripe.com/p/session/..."
}
```

**Implementation Example:**
```javascript
app.post('/api/stripe/create-portal-session', async (req, res) => {
  try {
    const { customerId, returnUrl } = req.body;

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Stripe portal error:', error);
    res.status(500).json({ error: 'Failed to create portal session' });
  }
});
```

#### 3. Webhook Handler (Critical for Production)
```
POST /api/stripe/webhook
```

Handle these events:
- `checkout.session.completed` - Activate subscription
- `customer.subscription.updated` - Update subscription status
- `customer.subscription.deleted` - Cancel subscription
- `invoice.payment_succeeded` - Confirm payment
- `invoice.payment_failed` - Handle failed payment

**Implementation Example:**
```javascript
app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      const userId = session.client_reference_id;
      const customerId = session.customer;
      const subscriptionId = session.subscription;
      
      // Save subscription to your database
      await saveSubscription({
        userId,
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscriptionId,
        status: 'active',
        planName: session.metadata.planName,
      });
      break;

    case 'customer.subscription.updated':
      const subscription = event.data.object;
      await updateSubscription(subscription.id, {
        status: subscription.status,
      });
      break;

    case 'customer.subscription.deleted':
      const deletedSub = event.data.object;
      await updateSubscription(deletedSub.id, {
        status: 'canceled',
      });
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});
```

## 🔑 Environment Variables

Create a `.env` file (or configure in your deployment platform):

```env
# Stripe Keys (Get from https://dashboard.stripe.com/apikeys)
STRIPE_SECRET_KEY=sk_test_... # Backend only - NEVER expose to frontend
STRIPE_WEBHOOK_SECRET=whsec_... # For webhook signature verification

# Frontend (add to your build process)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_... # Frontend - safe to expose
```

## 💳 Stripe Dashboard Setup

### 1. Create Products and Prices

In your Stripe Dashboard (https://dashboard.stripe.com/test/products):

#### Premium Plan
- **Product Name**: "LoveSpark Premium"
- **Monthly Price**: 
  - Create Price → `$24.00` → Recurring: Monthly
  - Copy Price ID → Update `PREMIUM_MONTHLY` in `stripe-service.ts`
- **Yearly Price**: 
  - Create Price → `$149.00` → Recurring: Yearly
  - Copy Price ID → Update `PREMIUM_YEARLY` in `stripe-service.ts`

#### Premium + Coaching Plan
- **Product Name**: "LoveSpark Premium + Coaching"
- **Monthly Price**: 
  - Create Price → `$49.00` → Recurring: Monthly
  - Copy Price ID → Update `PREMIUM_COACHING_MONTHLY` in `stripe-service.ts`
- **Yearly Price**: 
  - Create Price → `$349.00` → Recurring: Yearly
  - Copy Price ID → Update `PREMIUM_COACHING_YEARLY` in `stripe-service.ts`

### 2. Update Price IDs

Edit `src/lib/stripe-service.ts`:

```typescript
const STRIPE_PRICE_IDS = {
  PREMIUM_MONTHLY: 'price_1ABC...', // Your actual Price ID
  PREMIUM_YEARLY: 'price_1DEF...',  // Your actual Price ID
  PREMIUM_COACHING_MONTHLY: 'price_1GHI...', // Your actual Price ID
  PREMIUM_COACHING_YEARLY: 'price_1JKL...',  // Your actual Price ID
} as const
```

### 3. Configure Webhooks

1. Go to https://dashboard.stripe.com/test/webhooks
2. Click "Add endpoint"
3. Enter your webhook URL: `https://yourdomain.com/api/stripe/webhook`
4. Select events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy the webhook signing secret → Set as `STRIPE_WEBHOOK_SECRET`

## 🧪 Testing

### Test Mode

Use Stripe test cards: https://stripe.com/docs/testing

**Successful payment:**
```
Card Number: 4242 4242 4242 4242
Expiry: Any future date
CVC: Any 3 digits
ZIP: Any 5 digits
```

**Failed payment:**
```
Card Number: 4000 0000 0000 0002
```

### Test Workflow

1. Start your backend server with Stripe keys configured
2. Navigate to `/pricing` in the app
3. Select a paid plan
4. Click "Upgrade" button
5. You should be redirected to Stripe Checkout
6. Complete the test payment
7. Stripe will redirect back to your success URL
8. Your webhook should activate the subscription

## 🚀 Production Deployment

### Checklist

- [ ] Replace test keys with live keys in production
- [ ] Configure production webhook endpoint
- [ ] Test webhook delivery in production
- [ ] Set up Stripe webhook monitoring/alerts
- [ ] Implement proper error logging
- [ ] Add subscription status sync cronjob
- [ ] Configure Stripe email receipts
- [ ] Set up Stripe fraud detection
- [ ] Enable 3D Secure for European customers (SCA compliance)

### Security Best Practices

1. **Never expose secret keys** - Keep `STRIPE_SECRET_KEY` on backend only
2. **Verify webhook signatures** - Always verify webhook events
3. **Use HTTPS** - Required for PCI compliance
4. **Validate on backend** - Never trust client-side data
5. **Log all transactions** - Keep audit trail
6. **Handle errors gracefully** - Don't expose internal errors to users

## 📊 Database Schema Extension

Add these fields to your subscription table:

```sql
ALTER TABLE subscriptions ADD COLUMN stripe_customer_id VARCHAR(255);
ALTER TABLE subscriptions ADD COLUMN stripe_subscription_id VARCHAR(255);
ALTER TABLE subscriptions ADD COLUMN stripe_price_id VARCHAR(255);
ALTER TABLE subscriptions ADD COLUMN current_period_end TIMESTAMP;
ALTER TABLE subscriptions ADD COLUMN cancel_at_period_end BOOLEAN DEFAULT FALSE;

CREATE INDEX idx_stripe_customer ON subscriptions(stripe_customer_id);
CREATE INDEX idx_stripe_subscription ON subscriptions(stripe_subscription_id);
```

## 🔄 Subscription Flow Diagram

```
User clicks "Upgrade"
    ↓
Frontend: SubscriptionService.createSubscription()
    ↓
Frontend: StripeService.createCheckoutSession()
    ↓
Backend: POST /api/stripe/create-checkout-session
    ↓
Stripe: Create checkout session
    ↓
Frontend: Redirect to Stripe Checkout
    ↓
User: Enter payment details
    ↓
Stripe: Process payment
    ↓
Stripe: Redirect to success URL
    ↓
Stripe: Send webhook to your backend
    ↓
Backend: Webhook handler activates subscription
    ↓
Database: Save subscription details
    ↓
User: Can now access premium features
```

## 📞 Support

- **Stripe Documentation**: https://stripe.com/docs
- **Stripe Dashboard**: https://dashboard.stripe.com
- **Stripe Support**: https://support.stripe.com

## 🐛 Common Issues

### "Stripe not configured" error
- Check `VITE_STRIPE_PUBLISHABLE_KEY` is set correctly
- Ensure the key starts with `pk_test_` or `pk_live_`

### Redirect not working
- Verify success/cancel URLs are correct
- Check browser console for errors
- Ensure CORS is configured on backend

### Webhook not receiving events
- Verify webhook URL is publicly accessible
- Check webhook signing secret is correct
- View webhook logs in Stripe Dashboard

### Payment succeeds but subscription not activated
- Check webhook handler is implemented
- Verify webhook events are being processed
- Check database for subscription record

## 🎯 Next Steps

1. Implement the backend API endpoints
2. Configure Stripe products and prices
3. Set up webhook endpoint
4. Test the complete flow
5. Deploy to production
6. Monitor webhook delivery and payment success rates
