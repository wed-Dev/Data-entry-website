import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { connectToDatabase } from '@/lib/mongodb/connection'
import { User } from '@/lib/mongodb/models/User'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    // Try to connect to MongoDB
    try {
      await connectToDatabase()
    } catch (dbError: any) {
      console.error('Database connection failed:', dbError.message)
      return NextResponse.json(
        { 
          error: 'Database connection failed. Please ensure MongoDB is running.',
          details: 'Install MongoDB from https://www.mongodb.com/try/download/community or run: docker run -d -p 27017:27017 mongo'
        },
        { status: 503 }
      )
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const user = await User.create({
      email: email.toLowerCase(),
      password: hashedPassword,
      name: name || email,
    })

    return NextResponse.json(
      {
        message: 'User created successfully',
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
        },
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to create account',
        details: error.message || 'Internal server error'
      },
      { status: 500 }
    )
  }
}
