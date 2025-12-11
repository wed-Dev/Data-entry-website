'use client'

import { useEffect, useState } from 'react'
import { AppLayout } from '@/components/AppLayout'
import { DashboardMetrics, Transaction } from '@/types'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { TrendingUp, DollarSign, Package, Zap, FileText, Car } from 'lucide-react'
import axios from 'axios'
import Link from 'next/link'

interface Invoice {
  _id: string
  invoiceNumber: string
  date: string
  totalAmount: string
  createdAt: string
}

interface ChartData {
  monthly_totals: Array<{ month: string; transactions: number; invoices: number }>
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
  const [metrics, setMetrics] = useState<any>(null)
  const [chartData, setChartData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [transRes, invoicesRes, analyticsRes] = await Promise.all([
        axios.get('/api/transactions?limit=1000'),
        axios.get('/api/invoices'),
        axios.get('/api/analytics'),
      ])

      const transactions = transRes.data.data || []
      const invoices = invoicesRes.data.invoices || []
      const today = new Date().toISOString().split('T')[0]

      // Transaction metrics
      const todayTransactions = transactions.filter((t: Transaction) => t.date === today)
      const totalRevenue = transactions.reduce((sum: number, t: Transaction) => sum + t.price, 0)
      const todayRevenue = todayTransactions.reduce((sum: number, t: Transaction) => sum + t.price, 0)
      
      // Invoice metrics
      const todayInvoices = invoices.filter((inv: Invoice) => inv.date.split('T')[0] === today)
      const totalInvoiceRevenue = invoices.reduce((sum: number, inv: Invoice) => sum + parseFloat(inv.totalAmount), 0)
      const todayInvoiceRevenue = todayInvoices.reduce((sum: number, inv: Invoice) => sum + parseFloat(inv.totalAmount), 0)
      
      // Combined metrics
      const avgRevenue = transactions.length > 0 ? totalRevenue / transactions.length : 0
      const avgInvoiceValue = invoices.length > 0 ? totalInvoiceRevenue / invoices.length : 0
      const highestPaid = Math.max(...transactions.map((t: Transaction) => t.price), 0)

      setMetrics({
        total_transactions: transactions.length,
        today_transactions: todayTransactions.length,
        total_revenue: totalRevenue,
        today_revenue: todayRevenue,
        total_invoices: invoices.length,
        today_invoices: todayInvoices.length,
        total_invoice_revenue: totalInvoiceRevenue,
        today_invoice_revenue: todayInvoiceRevenue,
        avg_revenue_per_job: avgRevenue,
        avg_invoice_value: avgInvoiceValue,
        highest_paid_job: highestPaid,
        combined_total_revenue: totalRevenue + totalInvoiceRevenue,
        combined_today_revenue: todayRevenue + todayInvoiceRevenue,
      })

      // Prepare chart data with both transactions and invoices
      const monthlyData: any = {}
      
      transactions.forEach((t: Transaction) => {
        const month = new Date(t.date).toLocaleString('default', { month: 'short' })
        if (!monthlyData[month]) monthlyData[month] = { month, transactions: 0, invoices: 0 }
        monthlyData[month].transactions += 1
      })
      
      invoices.forEach((inv: Invoice) => {
        const month = new Date(inv.date).toLocaleString('default', { month: 'short' })
        if (!monthlyData[month]) monthlyData[month] = { month, transactions: 0, invoices: 0 }
        monthlyData[month].invoices += 1
      })

      setChartData({
        ...analyticsRes.data,
        monthly_combined: Object.values(monthlyData)
      })
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
            <p className="text-gray-600 mt-1">Welcome back! Here's your business overview.</p>
          </div>
          <div className="flex gap-2">
            <Link href="/transactions/new" className="btn-primary">
              + New Transaction
            </Link>
            <Link href="/invoice" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors">
              + New Invoice
            </Link>
          </div>
        </div>

        {/* Metrics Cards */}
        {metrics && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="Total Combined Revenue"
                value={metrics.combined_total_revenue}
                icon={DollarSign}
                color="bg-purple-600"
              />
              <MetricCard
                title="Today's Combined Revenue"
                value={metrics.combined_today_revenue}
                icon={TrendingUp}
                color="bg-orange-600"
              />
              <MetricCard
                title="Total Transactions"
                value={metrics.total_transactions}
                icon={Package}
                color="bg-blue-500"
              />
              <MetricCard
                title="Total Invoices"
                value={metrics.total_invoices}
                icon={FileText}
                color="bg-green-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="Transaction Revenue"
                value={metrics.total_revenue}
                icon={DollarSign}
                color="bg-blue-600"
              />
              <MetricCard
                title="Invoice Revenue"
                value={metrics.total_invoice_revenue}
                icon={Car}
                color="bg-green-600"
              />
              <MetricCard
                title="Avg per Transaction"
                value={metrics.avg_revenue_per_job.toFixed(2)}
                icon={DollarSign}
                color="bg-indigo-500"
              />
              <MetricCard
                title="Avg per Invoice"
                value={metrics.avg_invoice_value.toFixed(2)}
                icon={DollarSign}
                color="bg-teal-500"
              />
            </div>
          </>
        )}

        {/* Charts */}
        {chartData && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Combined Chart */}
            <div className="card">
              <h2 className="card-header">Monthly Activity (Transactions & Invoices)</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData.monthly_combined}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="transactions" fill="#3B82F6" name="Transactions" />
                  <Bar dataKey="invoices" fill="#10B981" name="Invoices" />
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

            {/* Pickup Locations */}
            <div className="card">
              <h2 className="card-header">Most Common Pickup Locations</h2>
              <p className="text-2xl font-bold text-blue-600 text-center py-12">
                {chartData.most_common_pickup}
              </p>
            </div>

            {/* Destinations */}
            <div className="card">
              <h2 className="card-header">Most Common Destinations</h2>
              <p className="text-2xl font-bold text-green-600 text-center py-12">
                {chartData.most_common_destination}
              </p>
            </div>
          </div>
        )}

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Link href="/transactions" className="card hover:shadow-lg transition-shadow cursor-pointer">
            <h3 className="font-semibold text-gray-900">View Transactions</h3>
            <p className="text-gray-600 text-sm mt-1">Manage transaction records</p>
          </Link>
          <Link href="/invoice" className="card hover:shadow-lg transition-shadow cursor-pointer">
            <h3 className="font-semibold text-gray-900">Car Invoices</h3>
            <p className="text-gray-600 text-sm mt-1">Create removal invoices</p>
          </Link>
          <Link href="/analytics" className="card hover:shadow-lg transition-shadow cursor-pointer">
            <h3 className="font-semibold text-gray-900">View Analytics</h3>
            <p className="text-gray-600 text-sm mt-1">Detailed insights</p>
          </Link>
          <Link href="/transactions/new" className="card hover:shadow-lg transition-shadow cursor-pointer">
            <h3 className="font-semibold text-gray-900">New Transaction</h3>
            <p className="text-gray-600 text-sm mt-1">Record new transaction</p>
          </Link>
        </div>
      </div>
    </AppLayout>
  )
}
