import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

// In-memory storage (replace with database in production)
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

function verifyToken(token: string): string | null {
  // In production, verify JWT properly
  if (!token) return null
  return 'verified_user'
}

function generateTransactionId(): string {
  return 'txn_' + crypto.randomBytes(8).toString('hex')
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!verifyToken(token || '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = request.headers.get('x-user-id') || localStorage?.getItem?.('user_id') || 'user_default'
    const {
      customer_id,
      pickup_location,
      destination_location,
      date,
      time,
      price,
    } = await request.json()

    if (!customer_id || !pickup_location || !destination_location || !date || !time || price === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (isNaN(parseFloat(price)) || parseFloat(price) < 0) {
      return NextResponse.json({ error: 'Invalid price' }, { status: 400 })
    }

    const transaction = {
      id: generateTransactionId(),
      user_id: userId,
      customer_id,
      pickup_location,
      destination_location,
      date,
      time,
      price: parseFloat(price),
      created_at: new Date().toISOString(),
    }

    transactions.push(transaction)

    return NextResponse.json(transaction, { status: 201 })
  } catch (error) {
    console.error('Error creating transaction:', error)
    return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 })
  }
}
