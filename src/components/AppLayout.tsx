'use client'

import { signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { ReactNode } from 'react'
import Link from 'next/link'
import { LogOut, Home, DollarSign, BarChart3 } from 'lucide-react'

export function AppLayout({ children }: { children: ReactNode }) {
  const router = useRouter()

  const handleLogout = async () => {
    await signOut({ redirect: false })
    router.push('/auth/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <h1 className="text-2xl font-bold text-blue-600">Invoice Entry</h1>
              <div className="hidden md:flex gap-4">
                <Link href="/dashboard" className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors">
                  <Home size={20} />
                  <span>Dashboard</span>
                </Link>
                <Link href="/transactions" className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors">
                  <DollarSign size={20} />
                  <span>Transactions</span>
                </Link>
                <Link href="/analytics" className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors">
                  <BarChart3 size={20} />
                  <span>Analytics</span>
                </Link>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut size={20} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden flex gap-2 pb-4">
            <Link href="/dashboard" className="flex-1 text-center py-2 text-sm text-gray-700 hover:bg-gray-100 rounded">Dashboard</Link>
            <Link href="/transactions" className="flex-1 text-center py-2 text-sm text-gray-700 hover:bg-gray-100 rounded">Transactions</Link>
            <Link href="/analytics" className="flex-1 text-center py-2 text-sm text-gray-700 hover:bg-gray-100 rounded">Analytics</Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
