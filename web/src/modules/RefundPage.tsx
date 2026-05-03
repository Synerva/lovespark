import { LegalLayout } from '@/components/LegalLayout'

export function RefundPage() {
  return (
    <LegalLayout title="Refund Policy" lastUpdated="April 29, 2026">
      <section>
        <h2 className="text-2xl font-semibold text-foreground mb-3">1. Digital Subscription Product</h2>
        <p>
          LoveSpark is a digital subscription service that provides immediate access to AI-powered
          relationship intelligence tools, assessments, and coaching features upon activation. Because
          our product is entirely digital and access is granted immediately, our refund policy
          reflects the nature of digital goods.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-foreground mb-3">2. Cancellation</h2>
        <p>
          You may cancel your LoveSpark subscription at any time through your account settings or
          by contacting our support team. Cancellation is effective immediately in terms of stopping
          future charges; however, you will retain full access to all paid features through the end
          of your current billing period.
        </p>
        <p className="mt-3">
          No partial refunds are issued for unused time remaining in a billing period unless
          required by applicable law.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-foreground mb-3">3. Access After Cancellation</h2>
        <p>
          After cancellation, your subscription remains active until the last day of the paid
          billing period. At that point, your account will revert to a free tier (if available) or
          become inactive. You will not be charged again after the cancellation date.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-foreground mb-3">4. Refund Eligibility — First Purchase</h2>
        <p>
          If you are unsatisfied with LoveSpark, you may submit a refund request within{' '}
          <strong>7 days of your first subscription payment</strong>. Refund requests submitted
          within this window will be reviewed on a case-by-case basis. To request a refund, please
          contact us at{' '}
          <a href="mailto:support@lovespark.ai" className="text-primary hover:underline">
            support@lovespark.ai
          </a>{' '}
          with your account email and reason for the request.
        </p>
        <p className="mt-3">
          We reserve the right to decline refund requests where we determine that the Service was
          used excessively or where a refund is otherwise not warranted.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-foreground mb-3">5. Renewal Charges</h2>
        <p>
          Subscription renewals (monthly or annual) are generally non-refundable once the renewal
          charge has been processed. We recommend cancelling your subscription before the renewal
          date if you do not wish to continue. You can find your next renewal date in your account
          settings.
        </p>
        <p className="mt-3">
          Exceptions may apply where required by consumer protection laws in your jurisdiction.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-foreground mb-3">6. Billing and Refund Processing via Paddle</h2>
        <p>
          All billing, invoicing, tax collection, and payment processing for LoveSpark is handled
          by <strong>Paddle</strong>, who acts as our authorized reseller and Merchant of Record.
          Refunds, where approved, are processed through Paddle and may take 5–10 business days to
          appear on your statement depending on your bank or card issuer.
        </p>
        <p className="mt-3">
          Paddle may contact you directly regarding billing disputes or chargebacks in accordance
          with their policies.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-foreground mb-3">7. Statutory Rights</h2>
        <p>
          Nothing in this Refund Policy limits or excludes your statutory rights under applicable
          consumer protection laws. If you are located in a jurisdiction that grants additional
          rights (such as the European Union or certain US states), those rights apply in addition
          to this policy.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-foreground mb-3">8. Contact</h2>
        <p>
          To request a refund or for any billing-related questions, please contact us at{' '}
          <a
            href="mailto:support@lovespark.ai"
            className="text-primary hover:underline"
          >
            support@lovespark.ai
          </a>
          .
        </p>
      </section>
    </LegalLayout>
  )
}
