'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

interface FAQItemProps {
  question: string
  answer: string
  delay?: number
}

export function FAQItem({ question, answer, delay = 0 }: FAQItemProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div
      className={`bg-gray-900 border border-gray-800 rounded-xl p-6 transition-all duration-300 hover:border-gray-700 ${
        isOpen ? 'border-l-4 border-l-green-500' : ''
      }`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left font-bold text-lg cursor-pointer group"
      >
        <span className="pr-4">{question}</span>
        <ChevronDown
          className={`w-5 h-5 text-green-500 flex-shrink-0 transition-transform duration-300 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'
        }`}
      >
        <p className="text-gray-400 leading-relaxed">{answer}</p>
      </div>
    </div>
  )
}

