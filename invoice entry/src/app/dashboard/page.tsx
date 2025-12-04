'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, Plus } from 'lucide-react'
import DashboardMetrics from '@/components/DashboardMetrics'
import TransactionForm from '@/components/TransactionForm'
import TransactionsList from '@/components/TransactionsList'

export default function Dashboard() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'metrics' | 'form' | 'list'>('metrics')
  const [showForm, setShowForm] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  useEffect(() => {
    const token = localStorage.getItem('auth_token')
    if (!token) {
      router.push('/')
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_id')
    localStorage.removeItem('remember_me')
    localStorage.removeItem('remembered_email')
    router.push('/')
  }

  const handleTransactionSaved = () => {
    setShowForm(false)
    setRefreshTrigger((prev) => prev + 1)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-3xl">📦</div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Business Transaction Entry</h1>
              <p className="text-gray-600 text-sm">Track every transaction with complete details</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Metrics Tab - Always visible */}
        <div className="mb-8">
          <DashboardMetrics refreshTrigger={refreshTrigger} />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setShowForm(!showForm)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              showForm
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400'
            }`}
          >
            <Plus size={20} />
            New Transaction
          </button>
          <button
            onClick={() => setActiveTab('list')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'list'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400'
            }`}
          >
            All Transactions
          </button>
        </div>

        {/* Content */}
        {showForm && (
          <div className="mb-8 bg-white rounded-lg shadow-sm p-6 animate-slide-in-up">
            <TransactionForm onTransactionSaved={handleTransactionSaved} />
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm p-6">
          <TransactionsList refreshTrigger={refreshTrigger} />
        </div>
      </main>
    </div>
  )
}
