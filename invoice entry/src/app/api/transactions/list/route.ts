import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'
import { getTokenFromHeader, verifyToken } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    const tokenStr = getTokenFromHeader(authHeader)
    const token = verifyToken(tokenStr || undefined)

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = supabaseServer()

    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', token.sub)
      .order('date', { ascending: false })

    if (error) {
      console.error('Fetch transactions error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ transactions: data || [] })
  } catch (err) {
    console.error('Error fetching transactions:', err)
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 })
  }
}
