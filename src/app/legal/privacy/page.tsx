import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Logo } from '@/components/Logo'

export const metadata = {
  title: 'Privacy Policy | Call Times',
  description: 'Privacy Policy for Call Times - Learn how we collect, use, and protect your data.',
}

export default function PrivacyPolicyPage() {
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
        <h1 className="text-5xl font-serif italic mb-4">Privacy Policy</h1>
        <p className="text-gray-400 mb-12">Last updated: October 18, 2025</p>

        <div className="prose prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold mb-4">1. Introduction</h2>
            <p className="text-gray-300 leading-relaxed">
              Welcome to Call Times ("we," "our," or "us"). We are committed to protecting your personal information 
              and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard 
              your information when you use our production management platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">2. Information We Collect</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              We collect information that you provide directly to us, including:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
              <li><strong>Account Information:</strong> Name, email address, password, and organization details</li>
              <li><strong>Profile Information:</strong> Job title, phone number, and profile picture</li>
              <li><strong>Project Data:</strong> Call sheets, contacts, files, and project information you create or upload</li>
              <li><strong>Usage Data:</strong> Information about how you use our service, including access times and features used</li>
              <li><strong>Device Information:</strong> Browser type, IP address, operating system, and device identifiers</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">3. How We Use Your Information</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
              <li>Provide, maintain, and improve our services</li>
              <li>Process your transactions and send related information</li>
              <li>Send you technical notices, updates, and support messages</li>
              <li>Respond to your comments, questions, and customer service requests</li>
              <li>Monitor and analyze trends, usage, and activities</li>
              <li>Detect, prevent, and address technical issues and security threats</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">4. Data Storage and Security</h2>
            <p className="text-gray-300 leading-relaxed">
              We use industry-standard security measures to protect your data, including encryption in transit and at rest. 
              Your data is stored on secure servers provided by Supabase, with automatic backups and redundancy. We implement 
              strict access controls and regularly audit our security practices.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">5. Data Sharing and Disclosure</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              We do not sell your personal information. We may share your information only in the following circumstances:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
              <li><strong>With your consent:</strong> When you explicitly authorize us to share information</li>
              <li><strong>Service providers:</strong> With third-party vendors who perform services on our behalf (e.g., hosting, email delivery)</li>
              <li><strong>Team members:</strong> With other members of your organization as configured in your account settings</li>
              <li><strong>Legal requirements:</strong> When required by law or to protect our rights</li>
              <li><strong>Business transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">6. Your Rights and Choices</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              You have the following rights regarding your personal information:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Correction:</strong> Update or correct inaccurate information</li>
              <li><strong>Deletion:</strong> Request deletion of your account and associated data</li>
              <li><strong>Export:</strong> Download your data in a portable format</li>
              <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
            </ul>
            <p className="text-gray-300 leading-relaxed mt-4">
              To exercise these rights, please contact us at privacy@calltimes.app
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">7. Data Retention</h2>
            <p className="text-gray-300 leading-relaxed">
              We retain your personal information for as long as necessary to provide our services and fulfill the purposes 
              outlined in this policy. When you delete your account, we will delete or anonymize your personal information 
              within 30 days, except where we are required to retain it for legal or regulatory purposes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">8. International Data Transfers</h2>
            <p className="text-gray-300 leading-relaxed">
              Your information may be transferred to and processed in countries other than your country of residence. 
              We ensure that such transfers comply with applicable data protection laws and implement appropriate safeguards.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">9. Children's Privacy</h2>
            <p className="text-gray-300 leading-relaxed">
              Our services are not directed to individuals under the age of 16. We do not knowingly collect personal 
              information from children. If you believe we have collected information from a child, please contact us 
              immediately.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">10. Changes to This Policy</h2>
            <p className="text-gray-300 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any material changes by posting 
              the new policy on this page and updating the "Last updated" date. Your continued use of our services after 
              such changes constitutes your acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">11. Contact Us</h2>
            <p className="text-gray-300 leading-relaxed">
              If you have any questions about this Privacy Policy or our data practices, please contact us at:
            </p>
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mt-4">
              <p className="text-gray-300">
                <strong>Email:</strong> privacy@calltimes.app<br />
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


