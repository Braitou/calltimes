import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Logo } from '@/components/Logo'

export const metadata = {
  title: 'Cookie Policy | Call Times',
  description: 'Cookie Policy for Call Times - Learn how we use cookies and similar technologies.',
}

export default function CookiePolicyPage() {
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
        <h1 className="text-5xl font-serif italic mb-4">Cookie Policy</h1>
        <p className="text-gray-400 mb-12">Last updated: October 18, 2025</p>

        <div className="prose prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold mb-4">1. What Are Cookies?</h2>
            <p className="text-gray-300 leading-relaxed">
              Cookies are small text files that are placed on your device when you visit a website. They are widely 
              used to make websites work more efficiently and provide information to website owners. Cookies help us 
              remember your preferences, understand how you use our service, and improve your experience.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">2. How We Use Cookies</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              Call Times uses cookies for the following purposes:
            </p>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold mb-2 text-green-500">Essential Cookies</h3>
                <p className="text-gray-300 leading-relaxed">
                  These cookies are necessary for the Service to function properly. They enable core functionality such 
                  as security, authentication, and session management. Without these cookies, the Service cannot work correctly.
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-300 ml-4 mt-2">
                  <li>Authentication tokens</li>
                  <li>Session identifiers</li>
                  <li>Security cookies</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-bold mb-2 text-blue-500">Functional Cookies</h3>
                <p className="text-gray-300 leading-relaxed">
                  These cookies enable enhanced functionality and personalization. They remember your preferences and 
                  choices to provide a better user experience.
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-300 ml-4 mt-2">
                  <li>Language preferences</li>
                  <li>UI customization settings</li>
                  <li>Recently viewed items</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-bold mb-2 text-orange-500">Analytics Cookies</h3>
                <p className="text-gray-300 leading-relaxed">
                  These cookies help us understand how visitors interact with our Service by collecting and reporting 
                  information anonymously. This helps us improve the Service.
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-300 ml-4 mt-2">
                  <li>Page views and navigation patterns</li>
                  <li>Feature usage statistics</li>
                  <li>Performance metrics</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">3. Third-Party Cookies</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              We use services from trusted third parties that may set cookies on your device:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
              <li><strong>Supabase:</strong> For authentication and database services</li>
              <li><strong>Postmark:</strong> For email delivery tracking</li>
              <li><strong>Analytics providers:</strong> For understanding service usage (anonymized)</li>
            </ul>
            <p className="text-gray-300 leading-relaxed mt-4">
              These third parties have their own privacy policies governing their use of cookies.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">4. Cookie Duration</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              Cookies can be either "session" or "persistent":
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
              <li><strong>Session cookies:</strong> Temporary cookies that expire when you close your browser</li>
              <li><strong>Persistent cookies:</strong> Remain on your device for a set period or until you delete them</li>
            </ul>
            <p className="text-gray-300 leading-relaxed mt-4">
              Most of our cookies are session cookies. Authentication cookies may persist for up to 30 days for 
              your convenience.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">5. Managing Cookies</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              You have several options for managing cookies:
            </p>
            
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-4">
              <h3 className="text-lg font-bold mb-3">Browser Settings</h3>
              <p className="text-gray-300 leading-relaxed mb-3">
                Most browsers allow you to control cookies through their settings. You can:
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-300 ml-4">
                <li>View and delete cookies</li>
                <li>Block third-party cookies</li>
                <li>Block all cookies</li>
                <li>Delete cookies when you close your browser</li>
              </ul>
            </div>

            <p className="text-gray-300 leading-relaxed">
              <strong>Important:</strong> If you block or delete essential cookies, some features of the Service may 
              not work correctly, and you may not be able to access certain areas.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">6. Browser-Specific Instructions</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              For detailed instructions on managing cookies in your browser:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
              <li><strong>Chrome:</strong> Settings → Privacy and security → Cookies and other site data</li>
              <li><strong>Firefox:</strong> Settings → Privacy & Security → Cookies and Site Data</li>
              <li><strong>Safari:</strong> Preferences → Privacy → Manage Website Data</li>
              <li><strong>Edge:</strong> Settings → Cookies and site permissions → Manage and delete cookies</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">7. Do Not Track</h2>
            <p className="text-gray-300 leading-relaxed">
              Some browsers include a "Do Not Track" (DNT) feature. Currently, there is no industry standard for 
              responding to DNT signals. We do not track users across third-party websites and therefore do not 
              respond to DNT signals.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">8. Updates to This Policy</h2>
            <p className="text-gray-300 leading-relaxed">
              We may update this Cookie Policy from time to time to reflect changes in our practices or for legal 
              reasons. We will notify you of any material changes by posting the updated policy on this page with 
              a new "Last updated" date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">9. Contact Us</h2>
            <p className="text-gray-300 leading-relaxed">
              If you have questions about our use of cookies, please contact us at:
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


