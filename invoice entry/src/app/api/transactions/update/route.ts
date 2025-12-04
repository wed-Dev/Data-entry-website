import { NextRequest, NextResponse } from 'next/server'

// Mock transactions data
let mockTransactions = [
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

function verifyToken(token: string): boolean {
  return !!token
}

export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!verifyToken(token || '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, customer_id, pickup_location, destination_location, date, time, price } = body

    if (!id) {
      return NextResponse.json({ error: 'Transaction ID required' }, { status: 400 })
    }

    // Find and update transaction
    const transactionIndex = mockTransactions.findIndex((t) => t.id === id)

    if (transactionIndex === -1) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
    }

    // Update transaction
    mockTransactions[transactionIndex] = {
      ...mockTransactions[transactionIndex],
      customer_id: customer_id || mockTransactions[transactionIndex].customer_id,
      pickup_location: pickup_location || mockTransactions[transactionIndex].pickup_location,
      destination_location: destination_location || mockTransactions[transactionIndex].destination_location,
      date: date || mockTransactions[transactionIndex].date,
      time: time || mockTransactions[transactionIndex].time,
      price: price !== undefined ? price : mockTransactions[transactionIndex].price,
    }

    return NextResponse.json({
      message: 'Transaction updated successfully',
      transaction: mockTransactions[transactionIndex],
    })
  } catch (error) {
    console.error('Error updating transaction:', error)
    return NextResponse.json({ error: 'Failed to update transaction' }, { status: 500 })
  }
}
