# Stripe Integration - Quick Start Guide

## 🚀 5-Minute Setup

### Step 1: Get Stripe Keys

1. Create a Stripe account at https://stripe.com (if you don't have one)
2. Go to https://dashboard.stripe.com/test/apikeys
3. Copy your keys:
   - **Publishable key** (starts with `pk_test_`)
   - **Secret key** (starts with `sk_test_`)

### Step 2: Configure Environment

Create a `.env` file in the project root:

```bash
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
```

⚠️ **Important**: Only add the publishable key to the frontend. The secret key should NEVER be in frontend code!

### Step 3: Create Stripe Products

1. Go to https://dashboard.stripe.com/test/products
2. Click "Add product"

**Create Premium Plan:**
- Name: "LoveSpark Premium"
- Add monthly price: $24.00 USD, recurring monthly
- Add yearly price: $149.00 USD, recurring yearly
- Copy both Price IDs (starts with `price_`)

**Create Premium + Coaching Plan:**
- Name: "LoveSpark Premium + Coaching"
- Add monthly price: $49.00 USD, recurring monthly
- Add yearly price: $349.00 USD, recurring yearly
- Copy both Price IDs

### Step 4: Update Price IDs

Edit `src/lib/stripe-service.ts` and update the Price IDs:

```typescript
const STRIPE_PRICE_IDS = {
  PREMIUM_MONTHLY: 'price_YOUR_PREMIUM_MONTHLY_ID',
  PREMIUM_YEARLY: 'price_YOUR_PREMIUM_YEARLY_ID',
  PREMIUM_COACHING_MONTHLY: 'price_YOUR_COACHING_MONTHLY_ID',
  PREMIUM_COACHING_YEARLY: 'price_YOUR_COACHING_YEARLY_ID',
} as const
```

### Step 5: Test It!

1. Start your app: `npm run dev`
2. Navigate to the pricing page
3. Select a plan and click "Upgrade"
4. You'll be redirected to Stripe Checkout
5. Use test card: `4242 4242 4242 4242`
6. Complete the payment

**That's it!** The frontend is fully integrated. 🎉

---

## 🔧 Backend Setup (Required for Production)

The frontend will try to call these API endpoints. You need to implement them:

### Minimal Backend Example (Node.js/Express)

```bash
npm install stripe express
```

```javascript
// server.js
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const app = express();

app.use(express.json());

// Create Checkout Session
app.post('/api/stripe/create-checkout-session', async (req, res) => {
  const { userId, email, priceId, successUrl, cancelUrl } = req.body;
  
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer_email: email,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl + '?session_id={CHECKOUT_SESSION_ID}',
    cancel_url: cancelUrl,
    client_reference_id: userId,
  });
  
  res.json({ id: session.id, url: session.url });
});

// Webhook Handler
app.post('/api/stripe/webhook', 
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const event = stripe.webhooks.constructEvent(
      req.body, 
      sig, 
      process.env.STRIPE_WEBHOOK_SECRET
    );
    
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      // TODO: Save subscription to your database
      console.log('Subscription created:', session);
    }
    
    res.json({ received: true });
  }
);

app.listen(3000, () => console.log('Server running on port 3000'));
```

### Environment Variables

```env
STRIPE_SECRET_KEY=sk_test_your_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

Get webhook secret from: https://dashboard.stripe.com/test/webhooks

---

## 📱 How It Works

1. **User clicks "Upgrade"** → Frontend calls your backend
2. **Backend creates checkout session** → Returns URL to frontend
3. **Frontend redirects to Stripe** → User enters payment details
4. **Stripe processes payment** → Redirects back to your app
5. **Stripe sends webhook** → Your backend activates subscription
6. **User gets premium features** → Access granted!

---

## 🧪 Testing with Test Cards

Use these test cards in Stripe Checkout:

| Card Number | Description |
|-------------|-------------|
| `4242 4242 4242 4242` | Successful payment |
| `4000 0000 0000 0002` | Card declined |
| `4000 0000 0000 9995` | Failed payment |

**For all cards:**
- Expiry: Any future date (e.g., 12/34)
- CVC: Any 3 digits (e.g., 123)
- ZIP: Any 5 digits (e.g., 12345)

---

## 🔍 Troubleshooting

### "Stripe not configured" warning
**Fix**: Set `VITE_STRIPE_PUBLISHABLE_KEY` in your `.env` file

### Nothing happens when clicking "Upgrade"
**Fix**: Check browser console for errors. Ensure backend is running.

### Redirects to Stripe but shows error
**Fix**: Verify Price IDs are correct in `stripe-service.ts`

### Payment succeeds but subscription not activated
**Fix**: Implement webhook handler to save subscription to database

---

## 📚 Full Documentation

For complete implementation details, see `STRIPE_INTEGRATION.md`

---

## 💡 Pro Tips

1. **Test thoroughly** in test mode before going live
2. **Monitor webhooks** in Stripe Dashboard under "Developers > Webhooks"
3. **Enable fraud detection** in Stripe Dashboard settings
4. **Set up email receipts** in Stripe Dashboard
5. **Use webhook retries** - Stripe will retry failed webhooks automatically

---

## 🆘 Need Help?

- Stripe Docs: https://stripe.com/docs
- Stripe Support: https://support.stripe.com
- Stripe Discord: https://discord.gg/stripe
