import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

// In-memory storage (replace with database in production)
let users: Array<{
  id: string
  name: string
  email: string
  password: string
}> = [
  {
    id: 'user_demo_001',
    name: 'Demo User',
    email: 'demo@example.com',
    password: '$2a$12$demo_hashed_password', // Demo@123 hashed
  },
]

// Simple hash function (use bcrypt in production)
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex')
}

function generateToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
    }

    const user = users.find((u) => u.email === email)

    // For demo purposes, allow login with demo@example.com / Demo@123
    if (email === 'demo@example.com' && password === 'Demo@123') {
      const token = generateToken()
      return NextResponse.json({
        token,
        user_id: users[0].id,
        name: users[0].name,
      })
    }

    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    // In production, use bcrypt.compare()
    const passwordHash = hashPassword(password)
    if (user.password !== passwordHash) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    const token = generateToken()
    return NextResponse.json({
      token,
      user_id: user.id,
      name: user.name,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}
