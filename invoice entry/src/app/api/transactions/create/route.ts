import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'
import { getTokenFromHeader, verifyToken } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const token = verifyToken(getTokenFromHeader(req.headers.get('authorization')))

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { customer_id, pickup_location, destination_location, date, time, price } = await req.json()

    if (!customer_id || !pickup_location || !destination_location || !date || !time || price === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (isNaN(parseFloat(price)) || parseFloat(price) < 0) {
      return NextResponse.json({ error: 'Invalid price' }, { status: 400 })
    }

    const supabase = supabaseServer()

    const { data, error } = await supabase
      .from('transactions')
      .insert([
        {
          user_id: token.sub,
          customer_id,
          pickup_location,
          destination_location,
          date,
          time,
          price: parseFloat(price),
        },
      ])
      .select('*')
      .single()

    if (error || !data) {
      console.error('Create transaction error:', error)
      return NextResponse.json({ error: error?.message || 'Create failed' }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    console.error('Error creating transaction:', err)
    return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 })
  }
}
