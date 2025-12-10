'use client'

import { useEffect, useState } from 'react'
import { AppLayout } from '@/components/AppLayout'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { DollarSign, TrendingUp, Award, Target, Calendar, RefreshCw } from 'lucide-react'
import axios from 'axios'

interface AnalyticsData {
  monthly_totals: Array<{ month: string; total: number }>
  daily_totals: Array<{ date: string; total: number }>
  most_common_pickup: string
  most_common_destination: string
  highest_paid_job: number
  average_job_value: number
  total_yearly_revenue: number
  busy_days: Array<{ day: string; count: number }>
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6']

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [isFiltering, setIsFiltering] = useState(false)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async (start?: string, end?: string) => {
    setIsFiltering(true)
    try {
      const params = new URLSearchParams()
      if (start) params.append('startDate', start)
      if (end) params.append('endDate', end)
      
      const response = await axios.get(`/api/analytics?${params.toString()}`)
      setData(response.data)
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
      setIsFiltering(false)
    }
  }

  const handleApplyFilter = () => {
    if (startDate && endDate) {
      if (new Date(startDate) > new Date(endDate)) {
        alert('Start date must be before end date')
        return
      }
      fetchAnalytics(startDate, endDate)
    }
  }

  const handleResetFilter = () => {
    setStartDate('')
    setEndDate('')
    fetchAnalytics()
  }

  const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <div className="card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
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
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </AppLayout>
    )
  }

  if (!data) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-96">
          <p className="text-gray-600">No data available</p>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics & Reports</h1>
          <p className="text-gray-600 mt-1">Comprehensive business insights and performance metrics</p>
        </div>

        {/* Date Range Filter */}
        <div className="card bg-blue-50 border-blue-200">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar size={16} className="inline mr-1" />
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="input-field"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar size={16} className="inline mr-1" />
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="input-field"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleApplyFilter}
                disabled={!startDate || !endDate || isFiltering}
                className="btn-primary whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isFiltering ? 'Loading...' : 'Apply Filter'}
              </button>
              <button
                onClick={handleResetFilter}
                disabled={isFiltering}
                className="btn-secondary whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw size={16} className="inline mr-1" />
                Reset
              </button>
            </div>
          </div>
          {startDate && endDate && (
            <div className="mt-3 text-sm text-blue-700">
              Showing data from <strong>{new Date(startDate).toLocaleDateString()}</strong> to <strong>{new Date(endDate).toLocaleDateString()}</strong>
            </div>
          )}
        </div>

        {/* Revenue Overview */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Revenue Overview</h2>
          {isFiltering ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="card animate-pulse">
                  <div className="h-32 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title={startDate && endDate ? "Total Revenue" : "Total Yearly Revenue"}
                value={`AED ${data.total_yearly_revenue.toFixed(2)}`}
                icon={DollarSign}
                color="bg-blue-500"
              />
              <StatCard
                title="Average Job Value"
                value={`AED ${data.average_job_value.toFixed(2)}`}
                icon={TrendingUp}
                color="bg-green-500"
              />
              <StatCard
                title="Highest Paid Job"
                value={`AED ${data.highest_paid_job.toFixed(2)}`}
                icon={Award}
                color="bg-purple-500"
              />
              <StatCard
                title="Monthly Average"
                value={`AED ${(data.total_yearly_revenue / Math.max(data.monthly_totals.length, 1)).toFixed(2)}`}
                icon={Target}
                color="bg-orange-500"
              />
            </div>
          )}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Over Time */}
          <div className="card">
            <h3 className="card-header">Revenue Over Time</h3>
            {isFiltering ? (
              <div className="h-[300px] animate-pulse bg-gray-200 rounded"></div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.monthly_totals}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => `AED ${Number(value).toFixed(2)}`} />
                  <Line type="monotone" dataKey="total" stroke="#3B82F6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Jobs per Month */}
          <div className="card">
            <h3 className="card-header">Jobs per Month</h3>
            {isFiltering ? (
              <div className="h-[300px] animate-pulse bg-gray-200 rounded"></div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.monthly_totals}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="total" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Pickup Location Distribution */}
          <div className="card">
            <h3 className="card-header">Pickup Location Distribution</h3>
            <div className="h-64 flex items-center justify-center">
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">{data.most_common_pickup}</p>
                <p className="text-gray-600 mt-2">Most Common Pickup</p>
              </div>
            </div>
          </div>

          {/* Destination Distribution */}
          <div className="card">
            <h3 className="card-header">Destination Distribution</h3>
            <div className="h-64 flex items-center justify-center">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">{data.most_common_destination}</p>
                <p className="text-gray-600 mt-2">Most Common Destination</p>
              </div>
            </div>
          </div>
        </div>

        {/* Job Insights */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Job Insights</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Busy Days */}
            <div className="card">
              <h3 className="card-header">Busiest Days</h3>
              <div className="space-y-3">
                {data.busy_days.slice(0, 5).map((day, index) => (
                  <div key={day.day} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium text-gray-900">{day.day}</p>
                      <p className="text-sm text-gray-600">{day.count} transactions</p>
                    </div>
                    <div className="text-2xl font-bold text-blue-600">#{index + 1}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="card space-y-4">
              <h3 className="card-header">Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between p-3 bg-gray-50 rounded">
                  <span className="text-gray-700">Total Transactions</span>
                  <span className="font-semibold text-gray-900">{data.daily_totals.length}</span>
                </div>
                <div className="flex justify-between p-3 bg-gray-50 rounded">
                  <span className="text-gray-700">Average per Day</span>
                  <span className="font-semibold text-gray-900">
                    {(data.daily_totals.reduce((sum, d) => sum + d.total, 0) / Math.max(data.daily_totals.length, 1)).toFixed(1)}
                  </span>
                </div>
                <div className="flex justify-between p-3 bg-gray-50 rounded">
                  <span className="text-gray-700">Revenue per Transaction</span>
                  <span className="font-semibold text-gray-900">AED {data.average_job_value.toFixed(2)}</span>
                </div>
                <div className="flex justify-between p-3 bg-gray-50 rounded">
                  <span className="text-gray-700">Peak Profit Job</span>
                  <span className="font-semibold text-gray-900">AED {data.highest_paid_job.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Transactions Chart */}
        <div className="card">
          <h3 className="card-header">Daily Transaction Volume (Last 30 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.daily_totals.slice(-30)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="total" fill="#F59E0B" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </AppLayout>
  )
}
