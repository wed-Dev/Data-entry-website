import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'
import { getTokenFromHeader, verifyToken } from '@/lib/auth'

export async function DELETE(req: NextRequest) {
  try {
    const token = verifyToken(getTokenFromHeader(req.headers.get('authorization')))

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Transaction ID required' }, { status: 400 })
    }

    const supabase = supabaseServer()

    // Delete transaction (RLS will ensure user_id matches)
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)
      .eq('user_id', token.sub)

    if (error) {
      console.error('Delete transaction error:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, message: 'Transaction deleted successfully' })
  } catch (err) {
    console.error('Error deleting transaction:', err)
    return NextResponse.json({ error: 'Failed to delete transaction' }, { status: 500 })
  }
}
