'use client'

import { useState } from 'react'
import { Check, X } from 'lucide-react'

interface TransactionFormProps {
  onTransactionSaved: () => void
}

export default function TransactionForm({ onTransactionSaved }: TransactionFormProps) {
  const [formData, setFormData] = useState({
    customerId: '',
    pickupLocation: '',
    destinationLocation: '',
    date: new Date().toISOString().split('T')[0],
    time: '07:18',
    price: '',
  })

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    // Validation
    if (!formData.customerId.trim()) {
      setError('Customer ID is required')
      setLoading(false)
      return
    }

    if (!formData.pickupLocation.trim()) {
      setError('Pickup location is required')
      setLoading(false)
      return
    }

    if (!formData.destinationLocation.trim()) {
      setError('Destination location is required')
      setLoading(false)
      return
    }

    if (!formData.price || isNaN(parseFloat(formData.price)) || parseFloat(formData.price) < 0) {
      setError('Price must be a valid positive number')
      setLoading(false)
      return
    }

    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch('/api/transactions/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          customer_id: formData.customerId,
          pickup_location: formData.pickupLocation,
          destination_location: formData.destinationLocation,
          date: formData.date,
          time: formData.time,
          price: parseFloat(formData.price),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to save transaction')
        setLoading(false)
        return
      }

      setSuccess('Transaction saved successfully!')
      setFormData({
        customerId: '',
        pickupLocation: '',
        destinationLocation: '',
        date: new Date().toISOString().split('T')[0],
        time: '07:18',
        price: '',
      })

      setTimeout(() => {
        onTransactionSaved()
      }, 1000)
    } catch (err) {
      setError('An error occurred. Please try again.')
      setLoading(false)
    }
  }

  const handleReset = () => {
    setFormData({
      customerId: '',
      pickupLocation: '',
      destinationLocation: '',
      date: new Date().toISOString().split('T')[0],
      time: '07:18',
      price: '',
    })
    setError('')
    setSuccess('')
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-4">📝 New Transaction</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm flex items-center gap-2">
          <X size={18} />
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-600 rounded-lg text-sm flex items-center gap-2">
          <Check size={18} />
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Customer ID <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="customerId"
            placeholder="e.g. CUST001"
            className="input-field"
            value={formData.customerId}
            onChange={handleChange}
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Current Location <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="pickupLocation"
            placeholder="Pickup location"
            className="input-field"
            value={formData.pickupLocation}
            onChange={handleChange}
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Destination Location <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="destinationLocation"
            placeholder="Drop-off location"
            className="input-field"
            value={formData.destinationLocation}
            onChange={handleChange}
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            name="date"
            className="input-field"
            value={formData.date}
            onChange={handleChange}
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Time <span className="text-red-500">*</span>
          </label>
          <input
            type="time"
            name="time"
            className="input-field"
            value={formData.time}
            onChange={handleChange}
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Price (AED) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="price"
            placeholder="0.00"
            step="0.01"
            min="0"
            className="input-field"
            value={formData.price}
            onChange={handleChange}
          />
        </div>

        <div className="md:col-span-2 flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : '💾 Save Transaction'}
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="btn-secondary flex-1"
          >
            🔄 Reset Form
          </button>
        </div>
      </form>
    </div>
  )
}
