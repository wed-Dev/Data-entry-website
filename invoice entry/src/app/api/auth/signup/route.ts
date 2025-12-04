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
    password: '$2a$12$demo_hashed_password',
  },
]

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex')
}

function generateToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

function generateUserId(): string {
  return 'user_' + crypto.randomBytes(8).toString('hex')
}

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json()

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password required' },
        { status: 400 }
      )
    }

    // Check if user already exists
    if (users.find((u) => u.email === email)) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    const userId = generateUserId()
    const passwordHash = hashPassword(password)

    users.push({
      id: userId,
      name,
      email,
      password: passwordHash,
    })

    const token = generateToken()
    return NextResponse.json(
      {
        token,
        user_id: userId,
        name,
      },
      { status: 201 }
    )
  } catch (error) {
    return NextResponse.json({ error: 'Signup failed' }, { status: 500 })
  }
}
