import Link from 'next/link'
import { ArrowRight, CheckCircle2, FolderOpen, Users, FileText, Zap, Shield, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/Logo'
import { StructuredData } from '@/components/landing/StructuredData'
import { ContactsDirectoryMockup, ProjectHubMockup, CallSheetEditorMockup } from '@/components/landing/Mockups'

export const metadata = {
  title: 'Call Times - Your New Best Friend as a Producer',
  description: 'Call Times is a global production assistant app that helps you manage your shooting faster and smoother. Create call sheets, manage contacts, and collaborate with your team in real-time.',
  keywords: 'call sheet, production management, film production, video production, crew management, call times, production assistant, shooting schedule, crew list',
  openGraph: {
    title: 'Call Times - Your New Best Friend as a Producer',
    description: 'Manage your film and video productions with ease. Create call sheets, organize contacts, and collaborate with your team.',
    type: 'website',
    url: 'https://calltimes.app',
  },
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <StructuredData />
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-lg border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Logo className="text-lg" />
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-gray-400 hover:text-white transition-colors">
              Features
            </a>
            <a href="#pricing" className="text-sm text-gray-400 hover:text-white transition-colors">
              Pricing
            </a>
            <a href="#faq" className="text-sm text-gray-400 hover:text-white transition-colors">
              FAQ
            </a>
            <Link href="/auth/login" className="text-sm text-gray-400 hover:text-white transition-colors">
              Sign In
            </Link>
            <Link href="/auth/signup">
              <Button className="bg-green-500 hover:bg-green-600 text-black font-bold">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            {/* Logo */}
            <div className="mb-8 flex justify-center">
              <Logo className="text-7xl" />
            </div>
            <h1 className="text-4xl md:text-5xl font-serif italic mb-6 leading-tight">
              Your new best friend as a producer
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 mb-12 font-sans">
              Call Times is a global production assistant app that helps you manage your shooting faster and smoother.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signup">
                <Button size="lg" className="bg-green-500 hover:bg-green-600 text-black font-bold text-lg px-8 py-6">
                  Start Free Trial
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <a href="#demo">
                <Button size="lg" variant="outline" className="border-gray-700 hover:bg-gray-900 text-lg px-8 py-6">
                  Watch Demo
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-12 border-y border-gray-800">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-gray-500 text-sm uppercase tracking-wider mb-8">
            Trusted by production teams worldwide
          </p>
          <div className="flex flex-wrap justify-center items-center gap-12 opacity-50">
            <div className="text-2xl font-bold text-gray-600">PRODUCTION CO.</div>
            <div className="text-2xl font-bold text-gray-600">STUDIO NAME</div>
            <div className="text-2xl font-bold text-gray-600">AGENCY</div>
            <div className="text-2xl font-bold text-gray-600">BRAND</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="section-header mb-4">EVERYTHING YOU NEED</h2>
            <p className="page-title">Powerful features for modern producers</p>
          </div>

          {/* Feature 1: Smart Directory */}
          <div className="grid md:grid-cols-2 gap-16 items-center mb-32">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-8 h-8 text-blue-500" />
                <h3 className="text-3xl font-serif italic">Smart Contact Directory</h3>
              </div>
              <p className="text-xl text-gray-400 mb-6">
                Organize your entire crew in one intelligent directory. Sort by department, role, or project. 
                Import contacts from CSV/Excel in seconds.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                  <span className="text-gray-300">Automatic categorization by department</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                  <span className="text-gray-300">Bulk import from CSV/Excel files</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                  <span className="text-gray-300">Quick search and filtering</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                  <span className="text-gray-300">Reusable across all your projects</span>
                </li>
              </ul>
            </div>
            <div className="relative">
              <div className="rounded-2xl overflow-hidden border border-gray-800 shadow-2xl" style={{ height: '700px' }}>
                <ContactsDirectoryMockup />
              </div>
            </div>
          </div>

          {/* Feature 2: Project Hub */}
          <div className="grid md:grid-cols-[1.5fr_1fr] gap-12 items-center mb-32">
            <div className="order-2 md:order-1 relative">
              <div className="rounded-2xl overflow-hidden border border-gray-800 shadow-2xl" style={{ height: '700px' }}>
                <ProjectHubMockup />
              </div>
            </div>
            <div className="order-1 md:order-2">
              <div className="flex items-center gap-3 mb-4">
                <FolderOpen className="w-8 h-8 text-green-500" />
                <h3 className="text-3xl font-serif italic">Collaborative Project Hub</h3>
              </div>
              <p className="text-xl text-gray-400 mb-6">
                Centralize all your production documents in one cloud-based hub. Share with your team and external collaborators 
                with granular permissions.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                  <span className="text-gray-300">Desktop-like file management (drag & drop)</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                  <span className="text-gray-300">Preview PDFs, images, videos, Excel files</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                  <span className="text-gray-300">Invite team members and guests with custom roles</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                  <span className="text-gray-300">Private zone for sensitive documents</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                  <span className="text-gray-300">Real-time synchronization</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Feature 3: Call Sheet Editor */}
          <div className="grid md:grid-cols-[1fr_1.5fr] gap-12 items-center">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <FileText className="w-8 h-8 text-orange-500" />
                <h3 className="text-3xl font-serif italic">Professional Call Sheet Editor</h3>
              </div>
              <p className="text-xl text-gray-400 mb-6">
                Create beautiful, professional call sheets in minutes. Live preview, automatic formatting, 
                and one-click PDF generation.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                  <span className="text-gray-300">Real-time A4 preview as you type</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                  <span className="text-gray-300">Auto-save every change</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                  <span className="text-gray-300">Import crew from your contact directory</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                  <span className="text-gray-300">Duplicate for multi-day shoots</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                  <span className="text-gray-300">Generate & email PDFs instantly</span>
                </li>
              </ul>
            </div>
            <div className="relative">
              <div className="rounded-2xl overflow-hidden border border-gray-800 shadow-2xl" style={{ height: '700px' }}>
                <CallSheetEditorMockup />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Call Times */}
      <section className="py-32 px-6 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="section-header mb-4">WHY CALL TIMES</h2>
            <p className="page-title">Built for modern production workflows</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Zap className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-xl font-bold mb-3">Lightning Fast</h3>
              <p className="text-gray-400">
                Create call sheets in minutes, not hours. Auto-save, templates, and smart imports save you time.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-xl font-bold mb-3">Secure & Private</h3>
              <p className="text-gray-400">
                Enterprise-grade security with granular permissions. Your data is encrypted and isolated.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Globe className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-xl font-bold mb-3">Work Anywhere</h3>
              <p className="text-gray-400">
                Cloud-based and accessible from any device. Real-time sync keeps your team aligned.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="section-header mb-4">PRICING</h2>
            <p className="page-title">Choose the plan that fits your needs</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Free Plan */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 hover:border-gray-700 transition-colors">
              <h3 className="text-2xl font-bold mb-2">Free</h3>
              <p className="text-gray-400 mb-6">Perfect for trying out Call Times</p>
              <div className="mb-6">
                <span className="text-4xl font-bold">$0</span>
                <span className="text-gray-400">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                  <span className="text-gray-300">1 project</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                  <span className="text-gray-300">50 MB storage</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                  <span className="text-gray-300">1 organization member</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                  <span className="text-gray-300">Unlimited contacts</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                  <span className="text-gray-300">Basic call sheets</span>
                </li>
              </ul>
              <Link href="/auth/signup">
                <Button variant="outline" className="w-full border-gray-700 hover:bg-gray-800">
                  Get Started
                </Button>
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="bg-gradient-to-br from-green-900/20 to-gray-900 border-2 border-green-500 rounded-2xl p-8 relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-green-500 text-black px-4 py-1 rounded-full text-sm font-bold">
                POPULAR
              </div>
              <h3 className="text-2xl font-bold mb-2">Pro</h3>
              <p className="text-gray-400 mb-6">For professional producers</p>
              <div className="mb-6">
                <span className="text-4xl font-bold">€29</span>
                <span className="text-gray-400">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                  <span className="text-gray-300">Unlimited projects</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                  <span className="text-gray-300">20 GB storage</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                  <span className="text-gray-300">3 organization members</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                  <span className="text-gray-300">Unlimited guest invites</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                  <span className="text-gray-300">Advanced call sheets</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                  <span className="text-gray-300">Priority support</span>
                </li>
              </ul>
              <Link href="/auth/signup">
                <Button className="w-full bg-green-500 hover:bg-green-600 text-black font-bold">
                  Start Free Trial
                </Button>
              </Link>
            </div>

            {/* Organization Plan */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 hover:border-gray-700 transition-colors">
              <h3 className="text-2xl font-bold mb-2">Organization</h3>
              <p className="text-gray-400 mb-6">For production companies</p>
              <div className="mb-6">
                <span className="text-4xl font-bold">€119</span>
                <span className="text-gray-400">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                  <span className="text-gray-300">Unlimited projects</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                  <span className="text-gray-300">1 TB storage</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                  <span className="text-gray-300">Unlimited organization members</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                  <span className="text-gray-300">Advanced permissions</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                  <span className="text-gray-300">Custom branding</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                  <span className="text-gray-300">Dedicated support</span>
                </li>
              </ul>
              <Link href="/auth/signup">
                <Button variant="outline" className="w-full border-gray-700 hover:bg-gray-800">
                  Contact Sales
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Video Demo Section */}
      <section id="demo" className="py-32 px-6 bg-gradient-to-b from-gray-900 to-black">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="section-header mb-4">SEE IT IN ACTION</h2>
          <p className="page-title mb-12">Watch how Call Times transforms your workflow</p>
          
          <div className="aspect-video bg-gradient-to-br from-gray-800 to-black rounded-2xl border border-gray-700 overflow-hidden relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="w-0 h-0 border-t-8 border-t-transparent border-l-12 border-l-green-500 border-b-8 border-b-transparent ml-1" />
                </div>
                <p className="text-gray-500">Demo video coming soon</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-32 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="section-header mb-4">FREQUENTLY ASKED QUESTIONS</h2>
            <p className="page-title">Everything you need to know</p>
          </div>

          <div className="space-y-6">
            <details className="bg-gray-900 border border-gray-800 rounded-xl p-6 group">
              <summary className="font-bold text-lg cursor-pointer list-none flex items-center justify-between">
                What is Call Times?
                <span className="text-green-500 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="text-gray-400 mt-4">
                Call Times is a comprehensive production management platform designed specifically for film, TV, and commercial producers. 
                It combines contact management, project collaboration, and professional call sheet creation in one intuitive application.
              </p>
            </details>

            <details className="bg-gray-900 border border-gray-800 rounded-xl p-6 group">
              <summary className="font-bold text-lg cursor-pointer list-none flex items-center justify-between">
                Do I need to download any software?
                <span className="text-green-500 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="text-gray-400 mt-4">
                No! Call Times is a cloud-based web application. Simply access it from any modern web browser on your desktop, 
                laptop, or tablet. All your data is automatically synced across devices.
              </p>
            </details>

            <details className="bg-gray-900 border border-gray-800 rounded-xl p-6 group">
              <summary className="font-bold text-lg cursor-pointer list-none flex items-center justify-between">
                Can I invite external collaborators to my projects?
                <span className="text-green-500 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="text-gray-400 mt-4">
                Absolutely! You can invite guests (like department heads or clients) to specific projects with customizable permissions. 
                Guests can view and download files without needing a Call Times account, and you control exactly what they can access.
              </p>
            </details>

            <details className="bg-gray-900 border border-gray-800 rounded-xl p-6 group">
              <summary className="font-bold text-lg cursor-pointer list-none flex items-center justify-between">
                How does the free plan work?
                <span className="text-green-500 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="text-gray-400 mt-4">
                The free plan is perfect for testing Call Times or managing small projects. You get 1 project, 50MB of storage, 
                and all core features including call sheet creation and contact management. No credit card required to start.
              </p>
            </details>

            <details className="bg-gray-900 border border-gray-800 rounded-xl p-6 group">
              <summary className="font-bold text-lg cursor-pointer list-none flex items-center justify-between">
                Can I import my existing contacts?
                <span className="text-green-500 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="text-gray-400 mt-4">
                Yes! Call Times supports bulk import from CSV and Excel files. Our smart parser automatically detects columns 
                and categorizes contacts by department, saving you hours of manual data entry.
              </p>
            </details>

            <details className="bg-gray-900 border border-gray-800 rounded-xl p-6 group">
              <summary className="font-bold text-lg cursor-pointer list-none flex items-center justify-between">
                Is my data secure?
                <span className="text-green-500 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="text-gray-400 mt-4">
                Security is our top priority. All data is encrypted in transit and at rest. We use enterprise-grade infrastructure 
                with automatic backups. Each organization's data is completely isolated, and we implement strict access controls 
                with role-based permissions.
              </p>
            </details>

            <details className="bg-gray-900 border border-gray-800 rounded-xl p-6 group">
              <summary className="font-bold text-lg cursor-pointer list-none flex items-center justify-between">
                What file formats can I upload to the Project Hub?
                <span className="text-green-500 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="text-gray-400 mt-4">
                Call Times supports all common file types including PDFs, images (JPG, PNG, GIF, WebP), videos (MP4, MOV), 
                audio files (MP3, WAV), and spreadsheets (Excel, CSV). You can preview most files directly in the browser 
                without downloading.
              </p>
            </details>

            <details className="bg-gray-900 border border-gray-800 rounded-xl p-6 group">
              <summary className="font-bold text-lg cursor-pointer list-none flex items-center justify-between">
                Can I cancel my subscription anytime?
                <span className="text-green-500 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="text-gray-400 mt-4">
                Yes, you can cancel your subscription at any time. Your data will remain accessible until the end of your 
                billing period, and you can export all your files before canceling. No questions asked, no hidden fees.
              </p>
            </details>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 px-6 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-serif italic mb-6">
            Ready to streamline your production?
          </h2>
          <p className="text-xl text-gray-400 mb-12">
            Join hundreds of producers who trust Call Times for their shoots.
          </p>
          <Link href="/auth/signup">
            <Button size="lg" className="bg-green-500 hover:bg-green-600 text-black font-bold text-lg px-12 py-6">
              Start Free Trial
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
          <p className="text-sm text-gray-500 mt-6">
            No credit card required • Free plan available forever
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <Logo className="text-lg" />
              <p className="text-gray-500 text-sm mt-4">
                Your new best friend as a producer.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#demo" className="hover:text-white transition-colors">Demo</a></li>
                <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="/auth/login" className="hover:text-white transition-colors">Sign In</Link></li>
                <li><Link href="/auth/signup" className="hover:text-white transition-colors">Sign Up</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/legal/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/legal/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link href="/legal/cookies" className="hover:text-white transition-colors">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">
              © 2025 Call Times. All rights reserved.
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-gray-500 hover:text-white transition-colors">
                <span className="sr-only">Twitter</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="#" className="text-gray-500 hover:text-white transition-colors">
                <span className="sr-only">LinkedIn</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
              <a href="#" className="text-gray-500 hover:text-white transition-colors">
                <span className="sr-only">Instagram</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
