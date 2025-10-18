'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Logo } from '@/components/Logo'
import { Button } from '@/components/ui/button'

export function StickyHeader() {
  const [scrolled, setScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState('')

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
      
      // Detect active section
      const sections = ['features', 'pricing', 'faq']
      const current = sections.find(section => {
        const element = document.getElementById(section)
        if (element) {
          const rect = element.getBoundingClientRect()
          return rect.top <= 100 && rect.bottom >= 100
        }
        return false
      })
      setActiveSection(current || '')
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-black/90 backdrop-blur-xl py-2 border-b border-gray-800'
          : 'bg-black/80 backdrop-blur-lg py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Logo className="text-lg" />
        
        <div className="hidden md:flex items-center gap-8">
          <a
            href="#features"
            className={`text-sm transition-colors underline-animate ${
              activeSection === 'features'
                ? 'text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Features
          </a>
          <a
            href="#pricing"
            className={`text-sm transition-colors underline-animate ${
              activeSection === 'pricing'
                ? 'text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Pricing
          </a>
          <a
            href="#faq"
            className={`text-sm transition-colors underline-animate ${
              activeSection === 'faq'
                ? 'text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            FAQ
          </a>
          <Link
            href="/auth/login"
            className="text-sm text-gray-400 hover:text-white transition-colors underline-animate"
          >
            Sign In
          </Link>
          <Link href="/auth/signup">
            <Button className="bg-green-500 hover:bg-green-600 text-black font-bold hover-scale">
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  )
}

