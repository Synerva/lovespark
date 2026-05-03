import { LegalLayout } from '@/components/LegalLayout'

export function PrivacyPage() {
  return (
    <LegalLayout title="Privacy Policy" lastUpdated="April 29, 2026">
      <section>
        <h2 className="text-2xl font-semibold text-foreground mb-3">1. Introduction</h2>
        <p>
          LoveSpark ("we", "us", or "our") is committed to protecting your personal information. This
          Privacy Policy explains how we collect, use, share, and safeguard data when you use our
          platform. By using LoveSpark, you agree to the practices described in this policy.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-foreground mb-3">2. Data We Collect</h2>
        <p>We collect the following categories of information:</p>
        <ul className="list-disc list-inside mt-2 space-y-2">
          <li>
            <strong>Account data:</strong> Name, email address, and authentication credentials
            provided during registration.
          </li>
          <li>
            <strong>Onboarding responses:</strong> Answers to relationship assessments, personality
            questions, and preference inputs provided during setup.
          </li>
          <li>
            <strong>Relationship inputs:</strong> Data entered during check-ins, reflections, and
            goal-setting activities within the platform.
          </li>
          <li>
            <strong>AI chat usage:</strong> Messages exchanged with the AI coach, including
            conversation history used to generate personalized guidance.
          </li>
          <li>
            <strong>Payment metadata:</strong> Billing records, subscription status, and
            transaction identifiers processed by Paddle. We do not store full payment card details.
          </li>
          <li>
            <strong>Usage data:</strong> Log data, device information, browser type, IP address,
            and interaction events used to maintain and improve the Service.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-foreground mb-3">3. Purpose of Processing</h2>
        <p>We use your data for the following purposes:</p>
        <ul className="list-disc list-inside mt-2 space-y-2">
          <li>
            <strong>Personalization:</strong> To generate your Relationship Intelligence Profile and
            tailor AI coaching insights to your unique situation.
          </li>
          <li>
            <strong>Service delivery:</strong> To provide the core features of the platform,
            including check-ins, assessments, and AI-driven recommendations.
          </li>
          <li>
            <strong>Service improvement:</strong> To analyze usage patterns, fix issues, and
            develop new features that better serve our users.
          </li>
          <li>
            <strong>Billing and account management:</strong> To process payments, manage
            subscriptions, and communicate about your account via our payment processor, Paddle.
          </li>
          <li>
            <strong>Legal compliance:</strong> To meet applicable legal and regulatory obligations.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-foreground mb-3">4. Third-Party Processors</h2>
        <p>
          We work with trusted third-party service providers who process data on our behalf. These
          processors are bound by data processing agreements and may only use your data as
          instructed by us:
        </p>
        <ul className="list-disc list-inside mt-2 space-y-2">
          <li>
            <strong>Supabase:</strong> Database and authentication infrastructure. Your account
            data and platform content are stored on Supabase-managed servers.
          </li>
          <li>
            <strong>Paddle:</strong> Payment processing, subscription management, tax handling, and
            billing. Paddle acts as Merchant of Record for all transactions.
          </li>
          <li>
            <strong>Hosting provider:</strong> Cloud infrastructure used to serve the LoveSpark
            application and associated assets.
          </li>
          <li>
            <strong>AI provider:</strong> Large language model infrastructure used to power
            AI-generated coaching responses. Conversation data may be transmitted to this provider
            to generate responses.
          </li>
        </ul>
        <p className="mt-3">
          We do not sell your personal data to third parties for advertising or marketing purposes.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-foreground mb-3">5. Data Security</h2>
        <p>
          We implement industry-standard technical and organizational measures to protect your
          personal data from unauthorized access, disclosure, alteration, or destruction. All data
          in transit is encrypted using TLS. Sensitive data at rest is encrypted using
          industry-standard encryption protocols. Access to personal data is restricted to
          authorized personnel on a need-to-know basis.
        </p>
        <p className="mt-3">
          While we take data security seriously, no method of transmission over the internet or
          electronic storage is completely secure. We cannot guarantee absolute security.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-foreground mb-3">6. Data Retention</h2>
        <p>
          We retain your personal data for as long as your account is active or as needed to provide
          the Service. If you delete your account, we will delete or anonymize your personal data
          within a reasonable period, except where we are required to retain it for legal or
          compliance purposes.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-foreground mb-3">7. Your Rights</h2>
        <p>
          Depending on your jurisdiction, you may have the following rights regarding your personal
          data:
        </p>
        <ul className="list-disc list-inside mt-2 space-y-2">
          <li>
            <strong>Access:</strong> You may request a copy of the personal data we hold about you.
          </li>
          <li>
            <strong>Correction:</strong> You may request that we correct inaccurate or incomplete
            data.
          </li>
          <li>
            <strong>Deletion:</strong> You may request deletion of your account and associated
            personal data, subject to applicable legal retention requirements.
          </li>
          <li>
            <strong>Portability:</strong> Where technically feasible, you may request your data in
            a structured, machine-readable format.
          </li>
          <li>
            <strong>Objection:</strong> You may object to certain types of processing, such as
            direct marketing.
          </li>
        </ul>
        <p className="mt-3">
          To exercise any of these rights, please contact us using the details below.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-foreground mb-3">8. Cookies</h2>
        <p>
          We use essential cookies and local storage to maintain your session and authentication
          state. We do not use advertising or tracking cookies. You may control cookie settings
          through your browser, though disabling essential cookies may affect Service functionality.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-foreground mb-3">9. Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. We will notify you of material
          changes by updating the "Last updated" date at the top of this page and, where
          appropriate, by notifying you via email. Your continued use of the Service after changes
          are posted constitutes acceptance of the updated policy.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-foreground mb-3">10. Contact</h2>
        <p>
          For privacy-related questions, requests, or concerns, please contact us at{' '}
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
