'use client'

import { Card, CardContent } from '@/components/ui/card'
import { PageLayout, SectionHeader, Sidebar } from '@/components/layout'
import Link from 'next/link'
import { FolderPlus, LayoutGrid, Users } from 'lucide-react'

// Mock data for development
const mockUser = {
  full_name: 'Simon Bandiera',
  email: 'simon@call-times.app'
}

const quickActions = [
  { icon: '📁', label: 'New Project', href: '/projects/new' },
  { icon: '📂', label: 'Manage Projects', href: '/projects' },
  { icon: '👥', label: 'Contacts', href: '/contacts' },
]

const stats = [
  { label: 'Projects', value: '1' },
  { label: 'Storage', value: '0 MB' },
]

export default function DashboardPage() {
  return (
    <PageLayout user={mockUser} showSidebar={false}>
      {/* Welcome Section - New Typography */}
      <section className="mb-12">
        <h1 className="page-title text-[3rem] mb-4 fade-in-elegant">
          Dashboard
        </h1>
        <p className="section-header text-base mb-2">
          YOUR PRODUCTION COMMAND CENTER
        </p>
        <p className="text-base text-[#a3a3a3] font-normal mt-2">
          Welcome back, {mockUser.full_name}
        </p>
      </section>

      {/* Quick Actions - 3 cards with enhanced hover effects - rectangles */}
      <section className="mb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Card 1: New Project */}
          <Link href="/projects/new" className="group">
            <Card className="relative bg-call-times-gray-dark border-call-times-gray-light transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] cursor-pointer h-full overflow-hidden
              hover:bg-[#1a1a1a] hover:border-[#444] hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.4)]
              before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[3px] before:bg-call-times-accent 
              before:scale-y-0 before:transition-transform before:duration-300 before:ease-out
              hover:before:scale-y-100
              animate-[fadeIn_0.4s_ease-out_0.1s_backwards]">
              <CardContent className="p-8">
                <div className="flex items-center gap-5">
                  <div className="flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110">
                    <FolderPlus className="w-12 h-12 text-yellow-500" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1">
                    <h3 className="card-subtitle text-white text-[1.4rem] mb-1 leading-tight">
                      New Project
                    </h3>
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#4ade80] mb-2">
                      START SOMETHING AMAZING
                    </p>
                    <p className="text-[#a3a3a3] text-[0.875rem] leading-[1.5]">
                      Create a new production project and organize your shoot
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Card 2: Manage Projects */}
          <Link href="/projects" className="group">
            <Card className="relative bg-call-times-gray-dark border-call-times-gray-light transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] cursor-pointer h-full overflow-hidden
              hover:bg-[#1a1a1a] hover:border-[#444] hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.4)]
              before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[3px] before:bg-call-times-accent 
              before:scale-y-0 before:transition-transform before:duration-300 before:ease-out
              hover:before:scale-y-100
              animate-[fadeIn_0.4s_ease-out_0.2s_backwards]">
              <CardContent className="p-8">
                <div className="flex items-center gap-5">
                  <div className="flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110">
                    <LayoutGrid className="w-12 h-12 text-yellow-500" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1">
                    <h3 className="card-subtitle text-white text-[1.4rem] mb-1 leading-tight">
                      Manage Projects
                    </h3>
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#4ade80] mb-2">
                      YOUR MISSION CONTROL
                    </p>
                    <p className="text-[#a3a3a3] text-[0.875rem] leading-[1.5]">
                      View and manage all your existing productions
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Card 3: Contacts */}
          <Link href="/contacts" className="group">
            <Card className="relative bg-call-times-gray-dark border-call-times-gray-light transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] cursor-pointer h-full overflow-hidden
              hover:bg-[#1a1a1a] hover:border-[#444] hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.4)]
              before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[3px] before:bg-call-times-accent 
              before:scale-y-0 before:transition-transform before:duration-300 before:ease-out
              hover:before:scale-y-100
              animate-[fadeIn_0.4s_ease-out_0.3s_backwards]">
              <CardContent className="p-8">
                <div className="flex items-center gap-5">
                  <div className="flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110">
                    <Users className="w-12 h-12 text-blue-500" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1">
                    <h3 className="card-subtitle text-white text-[1.4rem] mb-1 leading-tight">
                      Contacts
                    </h3>
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#4ade80] mb-2">
                      YOUR CREATIVE ARSENAL
                    </p>
                    <p className="text-[#a3a3a3] text-[0.875rem] leading-[1.5]">
                      Access your professional directory and organize your crew
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </section>

      {/* Overview Stats - Enhanced with hover */}
      <section className="mb-16">
        <h2 className="text-white font-bold text-2xl uppercase tracking-[0.025em] mb-8">
          Overview
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <Card className="bg-call-times-gray-dark border-call-times-gray-light transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] cursor-pointer hover:bg-[#1a1a1a] hover:border-call-times-accent hover:-translate-y-0.5">
            <CardContent className="p-8">
              <div className="text-center">
                <p className="text-call-times-accent text-[2.5rem] font-black mb-2 leading-none">1</p>
                <p className="text-[#a3a3a3] text-[0.875rem] font-medium uppercase tracking-[0.05em]">
                  Active Projects
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-call-times-gray-dark border-call-times-gray-light transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] cursor-pointer hover:bg-[#1a1a1a] hover:border-call-times-accent hover:-translate-y-0.5">
            <CardContent className="p-8">
              <div className="text-center">
                <p className="text-call-times-accent text-[2.5rem] font-black mb-2 leading-none">1</p>
                <p className="text-[#a3a3a3] text-[0.875rem] font-medium uppercase tracking-[0.05em]">
                  Contacts
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-call-times-gray-dark border-call-times-gray-light transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] cursor-pointer hover:bg-[#1a1a1a] hover:border-call-times-accent hover:-translate-y-0.5">
            <CardContent className="p-8">
              <div className="text-center">
                <p className="text-call-times-accent text-[2.5rem] font-black mb-2 leading-none">0</p>
                <p className="text-[#a3a3a3] text-[0.875rem] font-medium uppercase tracking-[0.05em]">
                  Call Sheets
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Recent Activity - Two columns */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Projects */}
        <Card className="bg-call-times-gray-dark border-call-times-gray-light">
          <CardContent className="p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-white font-bold text-lg uppercase tracking-[0.025em]">
                Recent Projects
              </h3>
              <Link href="/projects" className="text-call-times-accent text-sm font-medium hover:text-[#22c55e] transition-colors">
                View all →
              </Link>
            </div>
            <ul className="space-y-0">
              <li className="py-5 border-b border-[#222] flex justify-between items-center transition-all duration-200 hover:pl-2 hover:bg-[rgba(74,222,128,0.02)]">
                <div>
                  <h4 className="text-white font-semibold text-[0.95rem] mb-1.5">Nike Air Max Campaign</h4>
                  <p className="text-[#a3a3a3] text-[0.85rem]">3 call sheets • 8 files</p>
                </div>
                <span className="px-3.5 py-1.5 rounded-md bg-[rgba(74,222,128,0.15)] text-call-times-accent text-xs font-semibold uppercase tracking-wider">
                  Active
                </span>
              </li>
              <li className="py-5 border-b border-[#222] flex justify-between items-center transition-all duration-200 hover:pl-2 hover:bg-[rgba(74,222,128,0.02)]">
                <div>
                  <h4 className="text-white font-semibold text-[0.95rem] mb-1.5">Spring Fashion Shoot</h4>
                  <p className="text-[#a3a3a3] text-[0.85rem]">5 call sheets • 12 files</p>
                </div>
                <span className="px-3.5 py-1.5 rounded-md bg-[rgba(74,222,128,0.15)] text-call-times-accent text-xs font-semibold uppercase tracking-wider">
                  Active
                </span>
              </li>
              <li className="py-5 flex justify-between items-center transition-all duration-200 hover:pl-2 hover:bg-[rgba(74,222,128,0.02)]">
                <div>
                  <h4 className="text-white font-semibold text-[0.95rem] mb-1.5">Music Video - Artist X</h4>
                  <p className="text-[#a3a3a3] text-[0.85rem]">2 call sheets • 6 files</p>
                </div>
                <span className="px-3.5 py-1.5 rounded-md bg-[#222] text-[#a3a3a3] text-xs font-semibold uppercase tracking-wider">
                  Draft
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Recent Call Sheets */}
        <Card className="bg-call-times-gray-dark border-call-times-gray-light">
          <CardContent className="p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-white font-bold text-lg uppercase tracking-[0.025em]">
                Recent Call Sheets
              </h3>
              <Link href="/projects" className="text-call-times-accent text-sm font-medium hover:text-[#22c55e] transition-colors">
                View all →
              </Link>
            </div>
            <ul className="space-y-0">
              <li className="py-5 border-b border-[#222] flex justify-between items-center transition-all duration-200 hover:pl-2 hover:bg-[rgba(74,222,128,0.02)]">
                <div>
                  <h4 className="text-white font-semibold text-[0.95rem] mb-1.5">Nike Air Max - Day 1</h4>
                  <p className="text-[#a3a3a3] text-[0.85rem]">September 25, 2025 • Studio Harcourt</p>
                </div>
                <span className="px-3.5 py-1.5 rounded-md bg-[rgba(74,222,128,0.15)] text-call-times-accent text-xs font-semibold uppercase tracking-wider">
                  Sent
                </span>
              </li>
              <li className="py-5 border-b border-[#222] flex justify-between items-center transition-all duration-200 hover:pl-2 hover:bg-[rgba(74,222,128,0.02)]">
                <div>
                  <h4 className="text-white font-semibold text-[0.95rem] mb-1.5">Nike Air Max - Day 2</h4>
                  <p className="text-[#a3a3a3] text-[0.85rem]">September 26, 2025 • Location outdoor</p>
                </div>
                <span className="px-3.5 py-1.5 rounded-md bg-[#222] text-[#a3a3a3] text-xs font-semibold uppercase tracking-wider">
                  Draft
                </span>
              </li>
              <li className="py-5 flex justify-between items-center transition-all duration-200 hover:pl-2 hover:bg-[rgba(74,222,128,0.02)]">
                <div>
                  <h4 className="text-white font-semibold text-[0.95rem] mb-1.5">Pickup Shots</h4>
                  <p className="text-[#a3a3a3] text-[0.85rem]">September 29, 2025 • Studio B</p>
                </div>
                <span className="px-3.5 py-1.5 rounded-md bg-[#222] text-[#a3a3a3] text-xs font-semibold uppercase tracking-wider">
                  Draft
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </section>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </PageLayout>
  )
}
