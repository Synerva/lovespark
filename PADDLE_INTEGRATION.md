# Paddle Billing Integration Guide

## Overview

LoveSpark now uses **Paddle Billing** for subscription payments. This integration uses Paddle's browser-based checkout overlay, which works seamlessly in the Spark runtime environment without requiring a traditional backend.

## ✅ What's Implemented

### 1. Paddle Service (`src/lib/paddle-service.ts`)
- **Paddle.js SDK Integration**: Dynamically loads and initializes Paddle's checkout SDK
- **Checkout Overlay**: Opens Paddle's secure checkout in an overlay modal
- **Event Handling**: Listens for checkout completion and closure events
- **Price ID Mapping**: Maps subscription plans to Paddle Price IDs
- **Environment Detection**: Supports both Sandbox and Production modes

### 2. Updated Subscription Service (`src/lib/subscription-service.ts`)
- **Paddle Integration**: Automatically opens Paddle checkout for paid plans
- **Fallback Mode**: Falls back to mock payment if Paddle not configured
- **Email Support**: Passes user email to Paddle for customer creation

### 3. Updated Pricing Page (`src/modules/Pricing.tsx`)
- **Paddle Checkout Flow**: Opens Paddle overlay when users select a plan
- **Error Handling**: Gracefully handles Paddle-specific errors
- **Loading States**: Shows processing state during checkout

## 🚀 Quick Start

### Step 1: Create Paddle Account

1. Sign up at [paddle.com](https://paddle.com)
2. Complete business verification
3. Navigate to Developer Tools in your Paddle Dashboard

### Step 2: Create Products & Prices

In your Paddle Dashboard, create these products:

#### Product 1: LoveSpark Premium
- **Name**: LoveSpark Premium
- **Description**: Full access to AI coaching and advanced insights
- **Prices**:
  - Monthly: $24.00 USD (recurring monthly)
  - Yearly: $149.00 USD (recurring yearly)

#### Product 2: LoveSpark Premium + Coaching
- **Name**: LoveSpark Premium + Coaching
- **Description**: Premium features plus monthly psychologist sessions
- **Prices**:
  - Monthly: $49.00 USD (recurring monthly)
  - Yearly: $349.00 USD (recurring yearly)

### Step 3: Get Your Credentials

From Paddle Dashboard → Developer Tools → Authentication:

1. **Client Token**: Used for frontend Paddle.js initialization
2. **API Key**: (Optional) For server-side operations
3. **Webhook Secret**: For verifying webhook signatures

### Step 4: Configure Environment Variables

Create a `.env.local` file in your project root:

```env
# Paddle Environment (sandbox or production)
VITE_PADDLE_ENVIRONMENT=sandbox

# Paddle Client Token (get from Paddle Dashboard)
VITE_PADDLE_CLIENT_TOKEN=live_xxx or test_xxx

# Paddle Price IDs (copy from your products in Paddle Dashboard)
VITE_PADDLE_PREMIUM_MONTHLY=pri_xxx
VITE_PADDLE_PREMIUM_YEARLY=pri_xxx
VITE_PADDLE_COACHING_MONTHLY=pri_xxx
VITE_PADDLE_COACHING_YEARLY=pri_xxx
```

## 📋 Price ID Configuration

After creating products in Paddle, copy the Price IDs:

1. Go to **Paddle Dashboard** → **Products & Prices**
2. Click on each product
3. View the prices and copy their IDs (format: `pri_xxxxxxxxx`)
4. Update your `.env.local` file with the correct Price IDs

## 🔄 How It Works

### Checkout Flow

```
User visits /pricing page
    ↓
User selects a plan
    ↓
PaddleService.openCheckout() is called
    ↓
Paddle SDK loads (if not already loaded)
    ↓
Paddle checkout overlay opens
    ↓
User enters payment details
    ↓
Paddle processes payment
    ↓
Checkout completed event fires
    ↓
User subscription is activated
    ↓
User redirected to dashboard
```

### Event Handling

The Paddle service listens for these events:

- **checkout.completed**: Payment succeeded, subscription activated
- **checkout.closed**: User closed the checkout (cancelled)

You can listen to these events in your components:

```typescript
import { PaddleService } from '@/lib/paddle-service'

// Listen for successful checkout
const unsubscribe = PaddleService.onCheckoutCompleted((data) => {
  console.log('Checkout completed:', data)
  // Update subscription state, redirect user, etc.
})

// Clean up when component unmounts
return () => unsubscribe()
```

## 🧪 Testing

### Test Mode (Sandbox)

Set `VITE_PADDLE_ENVIRONMENT=sandbox` in your `.env.local`

Paddle Sandbox test cards:
- **Successful payment**: 4242 4242 4242 4242
- **Declined payment**: 4000 0000 0000 0002

### Test Workflow

1. Start your development server
2. Navigate to `/pricing`
3. Click "Upgrade" on any paid plan
4. Paddle checkout overlay should open
5. Use test card details:
   - Card: 4242 4242 4242 4242
   - Expiry: Any future date
   - CVC: Any 3 digits
   - ZIP: Any valid code
6. Complete payment
7. Checkout should close automatically
8. User subscription should be activated

## 🎯 Production Deployment

### Checklist

- [ ] Switch to Production environment in `.env`
- [ ] Replace sandbox client token with production token
- [ ] Update Price IDs to production IDs
- [ ] Configure Paddle webhooks (see below)
- [ ] Test the complete flow in production
- [ ] Set up Paddle email notifications
- [ ] Configure tax settings in Paddle Dashboard
- [ ] Enable fraud detection features

### Environment Variables for Production

```env
VITE_PADDLE_ENVIRONMENT=production
VITE_PADDLE_CLIENT_TOKEN=live_xxx
VITE_PADDLE_PREMIUM_MONTHLY=pri_production_xxx
VITE_PADDLE_PREMIUM_YEARLY=pri_production_xxx
VITE_PADDLE_COACHING_MONTHLY=pri_production_xxx
VITE_PADDLE_COACHING_YEARLY=pri_production_xxx
```

## 🔔 Webhooks (Optional)

For production use, you should handle Paddle webhooks to sync subscription status changes. Since this is a Spark application, you would need to:

### Option 1: Use Paddle Retain (Recommended for Spark)
Paddle Retain automatically handles subscription management and customer portal access without requiring webhooks.

### Option 2: External Webhook Handler
Set up a separate service to handle webhooks and update subscription status:

```javascript
// Example webhook handler (would need separate service)
app.post('/paddle/webhook', async (req, res) => {
  const signature = req.headers['paddle-signature']
  
  // Verify webhook signature
  const isValid = verifyPaddleSignature(req.body, signature)
  
  if (!isValid) {
    return res.status(400).send('Invalid signature')
  }
  
  const event = req.body
  
  switch (event.event_type) {
    case 'subscription.created':
      // Update user subscription status
      await updateSubscription(event.data.custom_data.userId, {
        status: 'active',
        paddleSubscriptionId: event.data.subscription_id,
        paddleCustomerId: event.data.customer_id
      })
      break
      
    case 'subscription.updated':
      // Handle subscription updates
      break
      
    case 'subscription.canceled':
      // Handle cancellation
      break
      
    case 'transaction.completed':
      // Handle successful payment
      break
  }
  
  res.status(200).send('OK')
})
```

### Webhook Events to Handle

- `subscription.created` - New subscription started
- `subscription.updated` - Subscription modified
- `subscription.canceled` - Subscription cancelled
- `subscription.paused` - Subscription paused
- `subscription.resumed` - Subscription resumed
- `transaction.completed` - Payment succeeded
- `transaction.payment_failed` - Payment failed

## 💳 Customer Portal

Paddle provides a customer portal where users can:
- Update payment methods
- Change subscription plans
- Cancel subscriptions
- View billing history

To link users to the customer portal:

```typescript
// In your ProfileSettings or similar component
const handleManageSubscription = () => {
  // Paddle will automatically open the customer portal
  // when the user has an active subscription
  window.Paddle.Checkout.open({
    transactionId: subscriptionId
  })
}
```

## 🔐 Security Best Practices

1. **Never expose API keys**: Only use client tokens in frontend code
2. **Verify webhooks**: Always verify webhook signatures
3. **Use HTTPS**: Required for production
4. **Custom data**: Use Paddle's `custom_data` to link subscriptions to users
5. **Validate server-side**: Never trust client-side subscription status

## 🌍 International Support

Paddle handles:
- ✅ Multiple currencies (automatic conversion)
- ✅ VAT/sales tax collection
- ✅ Compliance (GDPR, PSD2, etc.)
- ✅ Local payment methods
- ✅ Multi-language checkout

No additional configuration needed!

## 📊 Pricing Plans

Current LoveSpark subscription tiers:

| Plan | Monthly | Yearly | Savings |
|------|---------|--------|---------|
| Free | $0 | $0 | - |
| Premium | $24 | $149 | 48% |
| Premium + Coaching | $49 | $349 | 41% |

## 🐛 Troubleshooting

### Paddle SDK not loading
- Check browser console for errors
- Verify internet connection
- Ensure no ad blockers are interfering

### "Paddle not configured" error
- Verify `VITE_PADDLE_CLIENT_TOKEN` is set
- Check token format (should start with `live_` or `test_`)
- Restart development server after changing .env

### Checkout not opening
- Check browser console for errors
- Verify Price IDs are correct
- Ensure Paddle SDK loaded successfully
- Check that products are active in Paddle Dashboard

### Payment succeeds but subscription not activated
- Check browser console for events
- Verify `paddle-checkout-completed` event fires
- Ensure subscription state updates in `useKV`
- Check Paddle Dashboard for transaction details

## 🔄 Migration from Stripe

If you're migrating from Stripe:

1. **Export customer data** from Stripe Dashboard
2. **Recreate products** in Paddle with same pricing
3. **Update environment variables** to use Paddle
4. **Test thoroughly** in sandbox mode
5. **Communicate with users** about the change
6. **Cancel old Stripe subscriptions** (if any)

The code automatically uses Paddle instead of Stripe - no manual migration needed in the codebase.

## 📞 Support Resources

- **Paddle Documentation**: https://developer.paddle.com
- **Paddle Dashboard**: https://vendors.paddle.com
- **Paddle Support**: support@paddle.com
- **Paddle Status**: https://status.paddle.com

## 🎉 Benefits of Paddle

- **No backend required**: Perfect for Spark applications
- **Global compliance**: Handles VAT, taxes automatically
- **Merchant of record**: Paddle handles payments, taxes, invoicing
- **Higher approval rates**: Optimized payment processing
- **Customer support**: Paddle handles customer inquiries
- **Simplified accounting**: Single payout, complete reports

## 🚀 Next Steps

1. Create Paddle account
2. Set up products and prices
3. Configure environment variables
4. Test in sandbox mode
5. Go live with production credentials!

Your LoveSpark subscription system is now powered by Paddle! 🎊
