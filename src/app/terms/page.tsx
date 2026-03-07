import type { Metadata } from "next";
import PageWrapper from "@/components/layout/PageWrapper";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Mwalimu Wangu Terms of Service — please read before using our platform.",
};

export default function TermsPage() {
  return (
    <PageWrapper>
      <div className="bg-slate-900 text-white py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h1 className="text-3xl font-bold font-heading">Terms of Service</h1>
          <p className="text-slate-400 mt-2 text-sm">Last updated: February 2026</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 prose-custom">
        <p>
          Welcome to Mwalimu Wangu. By accessing or using our website and
          services, you agree to be bound by these Terms of Service. Please
          read them carefully.
        </p>

        <h2>1. Acceptance of Terms</h2>
        <p>
          By accessing mwalimuwangu.com, you confirm that you are at least 18
          years of age (or have parental consent) and that you agree to comply
          with these terms. If you do not agree, please do not use the platform.
        </p>

        <h2>2. Services Provided</h2>
        <p>
          Mwalimu Wangu is a marketplace that connects Swahili language learners
          with Swahili teachers. We do not directly provide tutoring services.
          All teaching arrangements are made between the student and teacher
          independently.
        </p>

        <h2>3. User Accounts and Registration</h2>
        <p>
          Contact and application forms require accurate personal information.
          You are responsible for the accuracy of the information you provide.
          We reserve the right to remove users who provide false information.
        </p>

        <h2>4. Teacher Applications</h2>
        <p>
          Teacher applications are reviewed at our discretion. Submitting an
          application does not guarantee acceptance. We may approve or reject
          applications without providing reasons. Approved teachers must
          maintain the quality standards described during onboarding.
        </p>

        <h2>5. Payment and Transactions</h2>
        <p>
          At this time, Mwalimu Wangu does not process payments. All financial
          arrangements are made directly between students and teachers. Mwalimu
          Wangu accepts no liability for payment disputes between students and
          teachers.
        </p>

        <h2>6. Acceptable Use</h2>
        <p>You agree not to:</p>
        <ul>
          <li>Submit false or misleading information</li>
          <li>Use the platform for any unlawful purpose</li>
          <li>Harass, threaten, or harm other users</li>
          <li>Attempt to scrape or harvest user data</li>
          <li>Circumvent any security measures on the platform</li>
        </ul>

        <h2>7. Intellectual Property</h2>
        <p>
          All content on this website — including text, images, logos, and
          design — is the property of Mwalimu Wangu or its licensors. You may
          not reproduce or redistribute our content without written permission.
        </p>

        <h2>8. Limitation of Liability</h2>
        <p>
          Mwalimu Wangu is provided on an &ldquo;as is&rdquo; basis. We make no
          warranties about the availability, accuracy, or reliability of our
          services. To the maximum extent permitted by law, we are not liable
          for any direct or indirect damages arising from your use of the
          platform.
        </p>

        <h2>9. Changes to Terms</h2>
        <p>
          We may update these terms at any time. Continued use of the platform
          after changes constitutes acceptance of the new terms. We will notify
          users of significant changes via email or a notice on the website.
        </p>

        <h2>10. Contact</h2>
        <p>
          For questions about these terms, please contact us at{" "}
          <a href="mailto:legal@mwalimuwangu.com">legal@mwalimuwangu.com</a>.
        </p>
      </div>
    </PageWrapper>
  );
}
