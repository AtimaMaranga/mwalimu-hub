import type { Metadata } from "next";
import PageWrapper from "@/components/layout/PageWrapper";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Swahili Tutors Privacy Policy — how we collect, use, and protect your personal information.",
};

export default function PrivacyPage() {
  return (
    <PageWrapper>
      <div className="bg-slate-900 text-white py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h1 className="text-3xl font-bold font-heading">Privacy Policy</h1>
          <p className="text-slate-400 mt-2 text-sm">Last updated: February 2026</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 prose-custom">
        <p>
          At Swahili Tutors, we take your privacy seriously. This policy explains
          what personal data we collect, why we collect it, and how we use and
          protect it.
        </p>

        <h2>1. Data We Collect</h2>
        <p>We collect the following types of personal data:</p>
        <ul>
          <li>
            <strong>Contact form data:</strong> name, email, phone (optional),
            message
          </li>
          <li>
            <strong>Teacher applications:</strong> name, email, phone,
            experience, qualifications
          </li>
          <li>
            <strong>Student inquiries:</strong> name, email, message, experience
            level
          </li>
          <li>
            <strong>Technical data:</strong> IP address, browser type, pages
            visited (via analytics)
          </li>
        </ul>

        <h2>2. How We Use Your Data</h2>
        <p>We use your data to:</p>
        <ul>
          <li>Respond to contact form submissions</li>
          <li>Process and review teacher applications</li>
          <li>Forward student inquiries to the relevant teacher</li>
          <li>Send confirmation emails</li>
          <li>Improve our website and services</li>
        </ul>

        <h2>3. Legal Basis (GDPR)</h2>
        <p>
          For users in the European Economic Area, we process your personal data
          on the following legal bases:
        </p>
        <ul>
          <li>
            <strong>Contract performance:</strong> to fulfil requests you make
            to us
          </li>
          <li>
            <strong>Legitimate interests:</strong> to operate and improve our
            platform
          </li>
          <li>
            <strong>Consent:</strong> where you have explicitly agreed (e.g.,
            newsletter)
          </li>
        </ul>

        <h2>4. Data Sharing</h2>
        <p>We do not sell your personal data. We may share data with:</p>
        <ul>
          <li>
            <strong>Teachers:</strong> when you submit an inquiry about a
            specific teacher
          </li>
          <li>
            <strong>Email service providers:</strong> to send transactional
            emails (e.g., Resend)
          </li>
          <li>
            <strong>Supabase:</strong> our database provider, for storing form
            submissions
          </li>
          <li>
            <strong>Vercel:</strong> our hosting provider, for serving the
            website
          </li>
        </ul>
        <p>
          All third-party services are GDPR-compliant and process data according
          to their own privacy policies.
        </p>

        <h2>5. Data Retention</h2>
        <p>
          We retain personal data for as long as necessary to fulfil the
          purposes described in this policy, or as required by law. Contact form
          submissions are retained for up to 2 years. Teacher applications are
          retained for up to 3 years.
        </p>

        <h2>6. Your Rights (GDPR)</h2>
        <p>You have the right to:</p>
        <ul>
          <li>Access the personal data we hold about you</li>
          <li>Correct inaccurate personal data</li>
          <li>Request deletion of your personal data</li>
          <li>Object to processing of your personal data</li>
          <li>Request a copy of your data in a portable format</li>
        </ul>
        <p>
          To exercise any of these rights, email us at{" "}
          <a href="mailto:privacy@swahili-tutors.com">
            privacy@swahili-tutors.com
          </a>
          .
        </p>

        <h2>7. Cookies</h2>
        <p>
          We use minimal, privacy-respecting analytics. We do not use
          advertising or tracking cookies. Essential cookies (for login
          sessions) are used only in the admin dashboard.
        </p>

        <h2>8. Security</h2>
        <p>
          We use industry-standard security measures including HTTPS, row-level
          security in our database, and secure API key management. However, no
          internet transmission is 100% secure, and we cannot guarantee
          absolute security.
        </p>

        <h2>9. Contact</h2>
        <p>
          For privacy-related questions or to exercise your rights, contact us
          at{" "}
          <a href="mailto:privacy@swahili-tutors.com">
            privacy@swahili-tutors.com
          </a>
          .
        </p>
      </div>
    </PageWrapper>
  );
}
