import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { connectToDatabase } from '@/lib/mongodb/connection'
import { Transaction } from '@/lib/mongodb/models/Transaction'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { customerId, pickupLocation, destination, date, time, vehicleType, price, notes } = body

    if (!customerId || !pickupLocation || !destination || !date || !time || price === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    await connectToDatabase()

    const transaction = await Transaction.create({
      userId: session.user.id,
      customerId,
      pickupLocation,
      destination,
      date: new Date(date),
      time,
      vehicleType: vehicleType || undefined,
      price: parseFloat(price),
      notes: notes || undefined,
    })

    return NextResponse.json(transaction, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const month = searchParams.get('month')
    const search = searchParams.get('search')
    const sortBy = searchParams.get('sortBy') || 'created_at'
    const order = searchParams.get('order') || 'desc'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    await connectToDatabase()

    const filter: any = { userId: session.user.id }

    if (month) {
      const startDate = new Date(month)
      const endDate = new Date(startDate)
      endDate.setMonth(endDate.getMonth() + 1)
      filter.date = { $gte: startDate, $lt: endDate }
    }

    if (search) {
      filter.$or = [
        { customerId: { $regex: search, $options: 'i' } },
        { pickupLocation: { $regex: search, $options: 'i' } },
        { destination: { $regex: search, $options: 'i' } },
      ]
    }

    const total = await Transaction.countDocuments(filter)

    const sortField = sortBy === 'created_at' ? 'createdAt' : sortBy
    const sortOrder = order === 'asc' ? 1 : -1

    const data = await Transaction.find(filter)
      .sort({ [sortField]: sortOrder })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()

    return NextResponse.json(
      { data, total, page, limit, totalPages: Math.ceil(total / limit) },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
