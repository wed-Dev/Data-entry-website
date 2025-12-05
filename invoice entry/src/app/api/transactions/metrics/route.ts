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
    const today = new Date().toISOString().split('T')[0]

    // Get all transactions for user
    const { data: allTransactions, error: error1 } = await supabase
      .from('transactions')
      .select('price, date')
      .eq('user_id', token.sub)

    // Get today's transactions
    const { data: todayTransactions, error: error2 } = await supabase
      .from('transactions')
      .select('price, date')
      .eq('user_id', token.sub)
      .eq('date', today)

    if (error1 || error2) {
      console.error('Metrics error:', error1 || error2)
      return NextResponse.json({ error: 'Failed to fetch metrics' }, { status: 500 })
    }

    const totalRevenue = (allTransactions || []).reduce((sum, t) => sum + (t.price || 0), 0)
    const todayRevenue = (todayTransactions || []).reduce((sum, t) => sum + (t.price || 0), 0)

    return NextResponse.json({
      totalTransactions: allTransactions?.length || 0,
      todayTransactions: todayTransactions?.length || 0,
      totalRevenue,
      todayRevenue,
    })
  } catch (err) {
    console.error('Error calculating metrics:', err)
    return NextResponse.json({ error: 'Failed to calculate metrics' }, { status: 500 })
  }
}
