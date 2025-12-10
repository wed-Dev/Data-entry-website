export interface User {
  id: string
  email: string
  name?: string
  createdAt: string
}

export interface Transaction {
  id: string
  userId: string
  customerId: string
  pickupLocation: string
  destination: string
  date: string
  time: string
  vehicleType?: string
  price: number
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface DashboardMetrics {
  total_transactions: number
  today_transactions: number
  total_revenue: number
  today_revenue: number
  avg_revenue_per_job: number
  highest_paid_job: number
}

export interface AnalyticsData {
  monthly_totals: Array<{ month: string; total: number }>
  daily_totals: Array<{ date: string; total: number }>
  most_common_pickup: string
  most_common_destination: string
  highest_paid_job: number
  average_job_value: number
  total_yearly_revenue: number
  busy_days: Array<{ day: string; count: number }>
}
