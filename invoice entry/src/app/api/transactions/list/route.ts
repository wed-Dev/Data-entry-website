import { NextRequest, NextResponse } from 'next/server'

// Import the transactions from create route (simplified for demo)
// In production, fetch from database
let transactions: Array<{
  id: string
  user_id: string
  customer_id: string
  pickup_location: string
  destination_location: string
  date: string
  time: string
  price: number
  created_at: string
}> = []

function verifyToken(token: string): boolean {
  return !!token
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!verifyToken(token || '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Mock data for demo
    if (transactions.length === 0) {
      transactions = [
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
      ]
    }

    return NextResponse.json({
      transactions,
    })
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 })
  }
}
