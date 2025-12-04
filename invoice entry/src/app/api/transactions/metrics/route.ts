import { NextRequest, NextResponse } from 'next/server'

function verifyToken(token: string): boolean {
  return !!token
}

// Mock transactions data
const mockTransactions = [
  {
    id: 'txn_001',
    user_id: 'user_demo_001',
    customer_id: 'CUST001',
    pickup_location: 'Downtown Dubai',
    destination_location: 'Dubai Marina',
    date: '2025-12-04',
    time: '09:30',
    price: 150.0,
    created_at: '2025-12-04T09:30:00Z',
  },
  {
    id: 'txn_002',
    user_id: 'user_demo_001',
    customer_id: 'CUST002',
    pickup_location: 'JBR Beach',
    destination_location: 'Downtown Dubai',
    date: '2025-12-04',
    time: '14:15',
    price: 200.5,
    created_at: '2025-12-04T14:15:00Z',
  },
  {
    id: 'txn_003',
    user_id: 'user_demo_001',
    customer_id: 'CUST003',
    pickup_location: 'Mall of the Emirates',
    destination_location: 'Burj Khalifa',
    date: '2025-12-03',
    time: '11:00',
    price: 175.75,
    created_at: '2025-12-03T11:00:00Z',
  },
  {
    id: 'txn_004',
    user_id: 'user_demo_001',
    customer_id: 'CUST004',
    pickup_location: 'Dubai Airport',
    destination_location: 'Deira',
    date: '2025-12-02',
    time: '16:45',
    price: 125.0,
    created_at: '2025-12-02T16:45:00Z',
  },
  {
    id: 'txn_005',
    user_id: 'user_demo_001',
    customer_id: 'CUST005',
    pickup_location: 'Bur Dubai',
    destination_location: 'Dubai Sports City',
    date: '2025-11-28',
    time: '08:00',
    price: 195.25,
    created_at: '2025-11-28T08:00:00Z',
  },
]

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!verifyToken(token || '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const todayTransactions = mockTransactions.filter((t) => {
      const txnDate = new Date(t.date)
      txnDate.setHours(0, 0, 0, 0)
      return txnDate.getTime() === today.getTime()
    })

    const totalTransactions = mockTransactions.length
    const todayCount = todayTransactions.length
    const totalRevenue = mockTransactions.reduce((sum, t) => sum + t.price, 0)
    const todayRevenue = todayTransactions.reduce((sum, t) => sum + t.price, 0)

    return NextResponse.json({
      totalTransactions,
      todayTransactions: todayCount,
      totalRevenue,
      todayRevenue,
    })
  } catch (error) {
    console.error('Error calculating metrics:', error)
    return NextResponse.json({ error: 'Failed to calculate metrics' }, { status: 500 })
  }
}
