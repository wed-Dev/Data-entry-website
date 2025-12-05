import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'
import { signToken } from '@/lib/auth'
import { hash } from 'bcryptjs'

export async function POST(req: NextRequest) {
  try {
    const { email, password, name } = await req.json()

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, and name required' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    const password_hash = await hash(password, 10)
    const supabase = supabaseServer()

    // Check if email already exists
    const { data: existing, error: existingErr } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle()

    if (existingErr) {
      console.error('Check existing error:', existingErr)
      return NextResponse.json({ error: existingErr.message }, { status: 500 })
    }

    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 })
    }

    // Insert new user
    const { data, error } = await supabase
      .from('users')
      .insert([{ email, password_hash, name }])
      .select('id, email')
      .single()

    if (error || !data) {
      console.error('Insert user error:', error)
      return NextResponse.json({ error: error?.message || 'Signup failed' }, { status: 500 })
    }

    const token = signToken({ sub: data.id, email: data.email })

    return NextResponse.json(
      {
        token,
        user_id: data.id,
        email: data.email,
        name,
      },
      { status: 201 }
    )
  } catch (err) {
    console.error('Signup error:', err)
    return NextResponse.json({ error: 'Signup failed' }, { status: 500 })
  }
}
