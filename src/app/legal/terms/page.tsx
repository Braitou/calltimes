import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Logo } from '@/components/Logo'

export const metadata = {
  title: 'Terms of Service | Call Times',
  description: 'Terms of Service for Call Times - Read our terms and conditions for using our platform.',
}

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Simple Header */}
      <nav className="border-b border-gray-800 py-6 px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Logo size="small" />
          <Link href="/" className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-5xl font-serif italic mb-4">Terms of Service</h1>
        <p className="text-gray-400 mb-12">Last updated: October 18, 2025</p>

        <div className="prose prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-300 leading-relaxed">
              By accessing or using Call Times ("Service"), you agree to be bound by these Terms of Service ("Terms"). 
              If you do not agree to these Terms, do not use the Service. We reserve the right to modify these Terms 
              at any time, and your continued use of the Service constitutes acceptance of any changes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">2. Description of Service</h2>
            <p className="text-gray-300 leading-relaxed">
              Call Times is a cloud-based production management platform that provides tools for creating call sheets, 
              managing contacts, organizing project files, and collaborating with team members. The Service is provided 
              "as is" and "as available" without warranties of any kind.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">3. Account Registration</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              To use the Service, you must:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
              <li>Be at least 16 years of age</li>
              <li>Provide accurate and complete registration information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Promptly update your account information if it changes</li>
              <li>Accept responsibility for all activities under your account</li>
            </ul>
            <p className="text-gray-300 leading-relaxed mt-4">
              You are responsible for maintaining the confidentiality of your password and for all activities that 
              occur under your account.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">4. Acceptable Use</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              You agree not to use the Service to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
              <li>Violate any laws or regulations</li>
              <li>Infringe on intellectual property rights</li>
              <li>Upload malicious code, viruses, or harmful content</li>
              <li>Harass, abuse, or harm other users</li>
              <li>Attempt to gain unauthorized access to the Service or other accounts</li>
              <li>Interfere with or disrupt the Service or servers</li>
              <li>Use the Service for any illegal or unauthorized purpose</li>
              <li>Scrape, copy, or reverse engineer any part of the Service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">5. User Content</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              You retain all rights to the content you upload to the Service ("User Content"). By uploading User Content, 
              you grant us a limited license to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
              <li>Store and process your User Content to provide the Service</li>
              <li>Display your User Content to users you authorize</li>
              <li>Make backup copies for disaster recovery</li>
            </ul>
            <p className="text-gray-300 leading-relaxed mt-4">
              You represent and warrant that you have all necessary rights to upload User Content and that it does not 
              violate any laws or third-party rights.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">6. Subscription and Payment</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              <strong>Free Plan:</strong> The free plan is provided at no cost with limited features and storage.
            </p>
            <p className="text-gray-300 leading-relaxed mb-4">
              <strong>Paid Plans:</strong> Paid subscriptions are billed monthly or annually in advance. By subscribing, 
              you authorize us to charge your payment method on a recurring basis.
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
              <li>Prices are subject to change with 30 days' notice</li>
              <li>Refunds are provided only as required by law</li>
              <li>You may cancel your subscription at any time</li>
              <li>Upon cancellation, access continues until the end of the billing period</li>
              <li>Storage limits apply to each plan tier</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">7. Intellectual Property</h2>
            <p className="text-gray-300 leading-relaxed">
              The Service, including its design, code, features, and content (excluding User Content), is owned by 
              Call Times and protected by copyright, trademark, and other intellectual property laws. You may not 
              copy, modify, distribute, or create derivative works without our express written permission.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">8. Data Backup and Loss</h2>
            <p className="text-gray-300 leading-relaxed">
              While we implement regular backups and redundancy measures, you are responsible for maintaining your own 
              backups of critical data. We are not liable for any data loss, corruption, or unavailability, except as 
              required by law.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">9. Service Availability</h2>
            <p className="text-gray-300 leading-relaxed">
              We strive to maintain high availability but do not guarantee uninterrupted access to the Service. We may 
              perform maintenance, updates, or experience downtime without prior notice. We are not liable for any 
              damages resulting from service interruptions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">10. Termination</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              We may suspend or terminate your account if:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
              <li>You violate these Terms</li>
              <li>Your payment fails or your account is past due</li>
              <li>We are required to do so by law</li>
              <li>We discontinue the Service (with 30 days' notice)</li>
            </ul>
            <p className="text-gray-300 leading-relaxed mt-4">
              Upon termination, you will have 30 days to export your data before it is permanently deleted.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">11. Limitation of Liability</h2>
            <p className="text-gray-300 leading-relaxed">
              To the maximum extent permitted by law, Call Times shall not be liable for any indirect, incidental, 
              special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly 
              or indirectly, or any loss of data, use, goodwill, or other intangible losses resulting from:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4 mt-4">
              <li>Your use or inability to use the Service</li>
              <li>Any unauthorized access to or use of our servers</li>
              <li>Any interruption or cessation of the Service</li>
              <li>Any bugs, viruses, or harmful code transmitted through the Service</li>
              <li>Any errors or omissions in any content</li>
            </ul>
            <p className="text-gray-300 leading-relaxed mt-4">
              Our total liability shall not exceed the amount you paid us in the 12 months preceding the claim.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">12. Indemnification</h2>
            <p className="text-gray-300 leading-relaxed">
              You agree to indemnify and hold harmless Call Times and its officers, directors, employees, and agents 
              from any claims, damages, losses, liabilities, and expenses (including legal fees) arising from your use 
              of the Service, your User Content, or your violation of these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">13. Dispute Resolution</h2>
            <p className="text-gray-300 leading-relaxed">
              These Terms shall be governed by the laws of the State of California, United States, without regard to 
              conflict of law provisions. Any disputes shall be resolved through binding arbitration in Los Angeles, 
              California, except that either party may seek injunctive relief in court.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">14. Changes to Terms</h2>
            <p className="text-gray-300 leading-relaxed">
              We reserve the right to modify these Terms at any time. We will notify you of material changes by email 
              or through the Service. Your continued use after such notice constitutes acceptance of the modified Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">15. Contact Information</h2>
            <p className="text-gray-300 leading-relaxed">
              For questions about these Terms, please contact us at:
            </p>
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mt-4">
              <p className="text-gray-300">
                <strong>Email:</strong> legal@calltimes.app<br />
                <strong>Address:</strong> Call Times, Inc.<br />
                123 Production Street<br />
                Los Angeles, CA 90001<br />
                United States
              </p>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8 px-6 mt-16">
        <div className="max-w-4xl mx-auto text-center text-sm text-gray-500">
          <p>© 2025 Call Times. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}


