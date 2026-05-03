import { LegalLayout } from '@/components/LegalLayout'

export function TermsPage() {
  return (
    <LegalLayout title="Terms of Service" lastUpdated="April 29, 2026">
      <section>
        <h2 className="text-2xl font-semibold text-foreground mb-3">1. Service Description</h2>
        <p>
          LoveSpark is an AI-powered relationship intelligence platform that provides personalized
          insights, assessments, and guidance to help individuals and couples build healthier, more
          fulfilling relationships. The platform includes AI-driven coaching, weekly check-ins,
          relationship intelligence scoring, and progress tracking tools (collectively, the
          "Service").
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-foreground mb-3">2. Acceptance of Terms</h2>
        <p>
          By accessing or using LoveSpark, you agree to be bound by these Terms of Service. If you
          do not agree to these terms, please do not use the Service. We reserve the right to update
          these terms at any time; continued use of the Service following any changes constitutes
          acceptance of those changes.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-foreground mb-3">3. Account Usage</h2>
        <p>
          You must be at least 18 years old to create an account. You are responsible for
          maintaining the confidentiality of your account credentials and for all activity that
          occurs under your account. You agree to provide accurate and complete information when
          registering and to keep your account information up to date. You may not transfer or share
          your account with any third party.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-foreground mb-3">4. Subscriptions and Billing</h2>
        <p>
          LoveSpark offers subscription plans billed on a recurring basis. All payments are
          processed securely through <strong>Paddle</strong>, our authorized reseller and payment
          processor. By subscribing, you authorize Paddle to charge your selected payment method on
          a recurring schedule according to your chosen plan.
        </p>
        <p className="mt-3">
          Paddle acts as the Merchant of Record for all LoveSpark transactions and is responsible
          for billing, invoicing, tax collection, and payment processing. Subscription fees are
          stated at the time of purchase and may be subject to applicable taxes depending on your
          jurisdiction.
        </p>
        <p className="mt-3">
          You may cancel your subscription at any time. Cancellation takes effect at the end of the
          current billing period, after which you will no longer be charged. See our Refund Policy
          for details on refund eligibility.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-foreground mb-3">5. Acceptable Use</h2>
        <p>You agree not to use the Service to:</p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>Violate any applicable laws or regulations</li>
          <li>Upload or transmit harmful, offensive, or unlawful content</li>
          <li>Attempt to gain unauthorized access to the platform or its infrastructure</li>
          <li>Resell, sublicense, or redistribute the Service without express written permission</li>
          <li>Use automated tools to scrape, crawl, or extract data from the platform</li>
        </ul>
        <p className="mt-3">
          We reserve the right to suspend or terminate accounts that violate these terms.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-foreground mb-3">6. AI Guidance Disclaimer</h2>
        <p>
          LoveSpark uses artificial intelligence to generate personalized insights, suggestions, and
          coaching guidance. AI-generated content is provided for informational and personal
          development purposes only. It is not a substitute for professional advice and may not
          always be accurate, complete, or applicable to your specific situation. You should
          exercise your own judgment when acting on any AI-generated content.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-foreground mb-3">7. No Medical, Therapy, or Legal Advice</h2>
        <p>
          LoveSpark is not a licensed healthcare provider, mental health service, therapist, or
          legal advisor. Nothing on the platform constitutes medical advice, psychological therapy,
          or legal counsel. If you are experiencing a mental health crisis, relationship abuse, or
          require professional therapeutic support, please contact a qualified professional or
          emergency services immediately.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-foreground mb-3">8. Cancellation</h2>
        <p>
          You may cancel your subscription at any time through your account settings or by
          contacting us. Upon cancellation, your access to paid features will continue until the end
          of your current billing period. We do not prorate or refund partial billing periods unless
          required by applicable law or outlined in our Refund Policy.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-foreground mb-3">9. Limitation of Liability</h2>
        <p>
          To the fullest extent permitted by law, LoveSpark and its affiliates, directors,
          employees, and agents shall not be liable for any indirect, incidental, special,
          consequential, or punitive damages arising from your use of or inability to use the
          Service. Our total liability to you for any claims arising from these terms or the Service
          shall not exceed the amount you paid to us in the twelve months preceding the claim.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-foreground mb-3">10. Intellectual Property</h2>
        <p>
          All content, branding, and technology on the LoveSpark platform are the intellectual
          property of LoveSpark or its licensors and are protected by applicable intellectual
          property laws. You may not copy, reproduce, or create derivative works from any platform
          content without our express written permission.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-foreground mb-3">11. Governing Law</h2>
        <p>
          These Terms of Service shall be governed by and construed in accordance with applicable
          law. Any disputes arising under these terms shall be resolved through binding arbitration
          or in courts of competent jurisdiction, as determined by applicable law.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-foreground mb-3">12. Contact</h2>
        <p>
          If you have any questions about these Terms of Service, please contact us at{' '}
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
