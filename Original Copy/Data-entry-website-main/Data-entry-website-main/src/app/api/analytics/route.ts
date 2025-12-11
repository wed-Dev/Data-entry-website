import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/authOptions'
import { connectToDatabase } from '@/lib/mongodb/connection'
import { Transaction } from '@/lib/mongodb/models/Transaction'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    await connectToDatabase()

    // Build query with optional date filter
    const query: any = { userId: session.user.id }
    
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    }

    const transactions = await Transaction.find(query)
      .sort({ date: -1 })
      .lean()

    if (!transactions) {
      return NextResponse.json(
        {
          monthly_totals: [],
          daily_totals: [],
          most_common_pickup: 'N/A',
          most_common_destination: 'N/A',
          highest_paid_job: 0,
          average_job_value: 0,
          total_yearly_revenue: 0,
          busy_days: [],
        },
        { status: 200 }
      )
    }

    // Calculate monthly totals
    const monthlyMap = new Map<string, number>()
    const dailyMap = new Map<string, number>()
    let totalRevenue = 0
    let maxPrice = 0

    transactions.forEach((t: any) => {
      const dateObj = new Date(t.date)
      const month = dateObj.toISOString().substring(0, 7)
      const date = dateObj.toISOString().split('T')[0]

      monthlyMap.set(month, (monthlyMap.get(month) || 0) + t.price)
      dailyMap.set(date, (dailyMap.get(date) || 0) + 1)
      totalRevenue += t.price
      maxPrice = Math.max(maxPrice, t.price)
    })

    const monthly_totals = Array.from(monthlyMap.entries())
      .map(([month, total]) => ({ month, total }))
      .sort((a, b) => a.month.localeCompare(b.month))

    const daily_totals = Array.from(dailyMap.entries())
      .map(([date, total]) => ({ date, total }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-30)

    // Find most common locations
    const pickupCounts = new Map<string, number>()
    const destinationCounts = new Map<string, number>()

    transactions.forEach((t: any) => {
      pickupCounts.set(t.pickupLocation, (pickupCounts.get(t.pickupLocation) || 0) + 1)
      destinationCounts.set(t.destination, (destinationCounts.get(t.destination) || 0) + 1)
    })

    const most_common_pickup = Array.from(pickupCounts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'
    const most_common_destination = Array.from(destinationCounts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'

    // Calculate average and busy days
    const average_job_value = transactions.length > 0 ? totalRevenue / transactions.length : 0
    
    const dayOfWeekCounts = new Map<string, number>()
    transactions.forEach((t: any) => {
      const date = new Date(t.date)
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' })
      dayOfWeekCounts.set(dayName, (dayOfWeekCounts.get(dayName) || 0) + 1)
    })

    const busy_days = Array.from(dayOfWeekCounts.entries())
      .map(([day, count]) => ({ day, count }))
      .sort((a, b) => b.count - a.count)

    return NextResponse.json(
      {
        monthly_totals,
        daily_totals,
        most_common_pickup,
        most_common_destination,
        highest_paid_job: maxPrice,
        average_job_value: parseFloat(average_job_value.toFixed(2)),
        total_yearly_revenue: totalRevenue,
        busy_days,
      },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
