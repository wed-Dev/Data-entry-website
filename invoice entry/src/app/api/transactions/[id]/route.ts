import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { connectToDatabase } from '@/lib/mongodb/connection'
import { Transaction } from '@/lib/mongodb/models/Transaction'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params
    const body = await request.json()

    await connectToDatabase()

    const existingTransaction = await Transaction.findById(id)

    if (!existingTransaction || existingTransaction.userId.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const updatedTransaction = await Transaction.findByIdAndUpdate(
      id,
      {
        customerId: body.customerId,
        pickupLocation: body.pickupLocation,
        destination: body.destination,
        date: body.date ? new Date(body.date) : undefined,
        time: body.time,
        vehicleType: body.vehicleType,
        price: body.price,
        notes: body.notes,
      },
      { new: true, runValidators: true }
    )

    return NextResponse.json(updatedTransaction, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params

    await connectToDatabase()

    const existingTransaction = await Transaction.findById(id)

    if (!existingTransaction || existingTransaction.userId.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await Transaction.findByIdAndDelete(id)

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
