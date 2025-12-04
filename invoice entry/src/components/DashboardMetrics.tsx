'use client'

import { useEffect, useState } from 'react'
import { DollarSign, TrendingUp } from 'lucide-react'

interface Metrics {
  totalTransactions: number
  todayTransactions: number
  totalRevenue: number
  todayRevenue: number
}

export default function DashboardMetrics({ refreshTrigger }: { refreshTrigger: number }) {
  const [metrics, setMetrics] = useState<Metrics>({
    totalTransactions: 0,
    todayTransactions: 0,
    totalRevenue: 0,
    todayRevenue: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMetrics()
  }, [refreshTrigger])

  const fetchMetrics = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch('/api/transactions/metrics', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setMetrics(data)
      }
    } catch (error) {
      console.error('Error fetching metrics:', error)
    } finally {
      setLoading(false)
    }
  }

  const MetricCard = ({
    label,
    value,
    icon,
    isAED,
  }: {
    label: string
    value: string | number
    icon: React.ReactNode
    isAED?: boolean
  }) => (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 card-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {isAED ? 'AED ' : ''}{value}
          </p>
        </div>
        <div className="text-3xl opacity-20">{icon}</div>
      </div>
    </div>
  )

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard
        label="TOTAL TRANSACTIONS"
        value={metrics.totalTransactions}
        icon="📊"
      />
      <MetricCard
        label="TODAY'S ENTRIES"
        value={metrics.todayTransactions}
        icon="📝"
      />
      <MetricCard
        label="TOTAL REVENUE"
        value={metrics.totalRevenue.toFixed(2)}
        icon={<DollarSign size={24} />}
        isAED
      />
      <MetricCard
        label="TODAY'S REVENUE"
        value={metrics.todayRevenue.toFixed(2)}
        icon={<TrendingUp size={24} />}
        isAED
      />
    </div>
  )
}
