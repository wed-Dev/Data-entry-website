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
      
      const response = await axios.get(/api/analytics?temp_analytics.txt{params.toString()})
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
        <div className={$ p-3 rounded-lg}>
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
        {/* Page Header with Date Filter */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics & Reports</h1>
            <p className="text-gray-600 mt-1">
              {startDate && endDate 
                ? Showing data from temp_analytics.txt{new Date(startDate).toLocaleDateString()} to temp_analytics.txt{new Date(endDate).toLocaleDateString()}
                : 'Comprehensive business insights and performance metrics'
              }
            </p>
          </div>
          
          {/* Date Range Selector in Header */}
          <div className="flex flex-col sm:flex-row gap-3 items-end">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                <Calendar size={14} className="inline mr-1" />
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="input-field text-sm px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                <Calendar size={14} className="inline mr-1" />
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="input-field text-sm px-3 py-2"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleApplyFilter}
                disabled={!startDate || !endDate || isFiltering}
                className="btn-primary text-sm px-4 py-2 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isFiltering ? 'Loading...' : 'Apply'}
              </button>
              <button
                onClick={handleResetFilter}
                disabled={isFiltering}
                className="btn-secondary text-sm px-3 py-2 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw size={14} className="inline" />
              </button>
            </div>
          </div>
        </div>
