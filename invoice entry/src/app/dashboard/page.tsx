'use client'

import { useEffect, useState } from 'react'
import { AppLayout } from '@/components/AppLayout'
import { DashboardMetrics, Transaction } from '@/types'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { TrendingUp, DollarSign, Package, Zap } from 'lucide-react'
import axios from 'axios'
import Link from 'next/link'

interface ChartData {
  monthly_totals: Array<{ month: string; total: number }>
  daily_totals: Array<{ date: string; total: number }>
  most_common_pickup: string
  most_common_destination: string
  highest_paid_job: number
  average_job_value: number
  total_yearly_revenue: number
  busy_days: Array<{ day: string; count: number }>
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [chartData, setChartData] = useState<ChartData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [transRes, analyticsRes] = await Promise.all([
        axios.get('/api/transactions?limit=1000'),
        axios.get('/api/analytics'),
      ])

      const transactions = transRes.data.data || []
      const today = new Date().toISOString().split('T')[0]

      const todayTransactions = transactions.filter((t: Transaction) => t.date === today)

      const totalRevenue = transactions.reduce((sum: number, t: Transaction) => sum + t.price, 0)
      const todayRevenue = todayTransactions.reduce((sum: number, t: Transaction) => sum + t.price, 0)
      const avgRevenue = transactions.length > 0 ? totalRevenue / transactions.length : 0
      const highestPaid = Math.max(...transactions.map((t: Transaction) => t.price), 0)

      setMetrics({
        total_transactions: transactions.length,
        today_transactions: todayTransactions.length,
        total_revenue: totalRevenue,
        today_revenue: todayRevenue,
        avg_revenue_per_job: avgRevenue,
        highest_paid_job: highestPaid,
      })

      setChartData(analyticsRes.data)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const MetricCard = ({ title, value, icon: Icon, color }: any) => (
    <div className="card hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {typeof value === 'number' && title.includes('Revenue') ? `AED ${value.toFixed(2)}` : value}
          </p>
        </div>
        <div className={`${color} p-3 rounded-lg`}>
          <Icon size={24} className="text-white" />
        </div>
      </div>
    </div>
  )

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-96">
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome back! Here&apos;s your business overview.</p>
          </div>
          <Link href="/transactions/new" className="btn-primary">
            + New Transaction
          </Link>
        </div>

        {/* Metrics Cards */}
        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <MetricCard
              title="Total Transactions"
              value={metrics.total_transactions}
              icon={Package}
              color="bg-blue-500"
            />
            <MetricCard
              title="Today's Transactions"
              value={metrics.today_transactions}
              icon={Zap}
              color="bg-green-500"
            />
            <MetricCard
              title="Total Revenue"
              value={metrics.total_revenue}
              icon={DollarSign}
              color="bg-purple-500"
            />
            <MetricCard
              title="Today's Revenue"
              value={metrics.today_revenue}
              icon={TrendingUp}
              color="bg-orange-500"
            />
            <MetricCard
              title="Avg Revenue per Job"
              value={metrics.avg_revenue_per_job.toFixed(2)}
              icon={DollarSign}
              color="bg-indigo-500"
            />
            <MetricCard
              title="Highest Paid Job"
              value={metrics.highest_paid_job.toFixed(2)}
              icon={TrendingUp}
              color="bg-red-500"
            />
          </div>
        )}

        {/* Charts */}
        {chartData && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Revenue Chart */}
            <div className="card">
              <h2 className="card-header">Monthly Revenue</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData.monthly_totals}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="total" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Daily Transactions Chart */}
            <div className="card">
              <h2 className="card-header">Daily Transactions (Last 30 Days)</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData.daily_totals}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="total" stroke="#10B981" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Pickup Locations Chart */}
            <div className="card">
              <h2 className="card-header">Most Common Pickup Locations</h2>
              <p className="text-2xl font-bold text-blue-600 text-center py-12">
                {chartData.most_common_pickup}
              </p>
            </div>

            {/* Destinations Chart */}
            <div className="card">
              <h2 className="card-header">Most Common Destinations</h2>
              <p className="text-2xl font-bold text-green-600 text-center py-12">
                {chartData.most_common_destination}
              </p>
            </div>
          </div>
        )}

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/transactions" className="card hover:shadow-lg transition-shadow cursor-pointer">
            <h3 className="font-semibold text-gray-900">View All Transactions</h3>
            <p className="text-gray-600 text-sm mt-1">Manage and view all your transactions</p>
          </Link>
          <Link href="/analytics" className="card hover:shadow-lg transition-shadow cursor-pointer">
            <h3 className="font-semibold text-gray-900">View Analytics</h3>
            <p className="text-gray-600 text-sm mt-1">Detailed insights and reports</p>
          </Link>
          <Link href="/transactions/new" className="card hover:shadow-lg transition-shadow cursor-pointer">
            <h3 className="font-semibold text-gray-900">New Transaction</h3>
            <p className="text-gray-600 text-sm mt-1">Record a new transaction</p>
          </Link>
        </div>
      </div>
    </AppLayout>
  )
}
