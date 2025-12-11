import mongoose, { Schema, Document, Model } from 'mongoose'

export interface ITransaction extends Document {
  userId: mongoose.Types.ObjectId
  customerId: string
  pickupLocation: string
  destination: string
  date: Date
  time: string
  vehicleType?: string
  price: number
  notes?: string
  createdAt: Date
  updatedAt: Date
}

const TransactionSchema = new Schema<ITransaction>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    customerId: {
      type: String,
      required: [true, 'Customer ID is required'],
      trim: true,
    },
    pickupLocation: {
      type: String,
      required: [true, 'Pickup location is required'],
      trim: true,
    },
    destination: {
      type: String,
      required: [true, 'Destination is required'],
      trim: true,
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      index: true,
    },
    time: {
      type: String,
      required: [true, 'Time is required'],
    },
    vehicleType: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price must be positive'],
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
)

// Indexes for better query performance
TransactionSchema.index({ userId: 1, createdAt: -1 })
TransactionSchema.index({ userId: 1, date: -1 })

// Prevent model recompilation during hot reload
export const Transaction: Model<ITransaction> = 
  mongoose.models.Transaction || mongoose.model<ITransaction>('Transaction', TransactionSchema)
