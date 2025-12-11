import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/authOptions'
import { connectToDatabase } from '@/lib/mongodb/connection'
import mongoose from 'mongoose'

const InvoiceSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  invoiceNumber: { type: String, required: true },
  date: { type: Date, required: true },
  companyName: String,
  vehicleNumber: String,
  currentLocation: String,
  destinationLocation: String,
  distance: String,
  lineItems: [{
    srNo: Number,
    description: String,
    qty: String,
    rate: String,
    amount: String,
  }],
  totalAmount: String,
  signature: String,
  createdAt: { type: Date, default: Date.now },
})

const Invoice = mongoose.models.Invoice || mongoose.model('Invoice', InvoiceSchema)

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()

    const body = await request.json()

    const invoice = await Invoice.create({
      userId: session.user.id,
      ...body,
    })

    return NextResponse.json({ success: true, invoice }, { status: 201 })
  } catch (error) {
    console.error('Error creating invoice:', error)
    return NextResponse.json({ error: 'Failed to create invoice' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()

    const invoices = await Invoice.find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json({ invoices }, { status: 200 })
  } catch (error) {
    console.error('Error fetching invoices:', error)
    return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 })
  }
}
