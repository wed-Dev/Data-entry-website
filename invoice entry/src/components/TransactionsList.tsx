'use client'

import { useEffect, useState } from 'react'
import { Search, ChevronDown, Edit2, Trash2 } from 'lucide-react'

interface Transaction {
  id: string
  customer_id: string
  pickup_location: string
  destination_location: string
  date: string
  time: string
  price: number
  created_at: string
}

interface TransactionsListProps {
  refreshTrigger: number
}

const MONTHS = [
  'All Months',
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

export default function TransactionsList({ refreshTrigger }: TransactionsListProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMonth, setSelectedMonth] = useState(0)
  const [loading, setLoading] = useState(true)
  const [totalRevenue, setTotalRevenue] = useState(0)

  useEffect(() => {
    fetchTransactions()
  }, [refreshTrigger])

  useEffect(() => {
    filterTransactions()
  }, [transactions, searchTerm, selectedMonth])

  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch('/api/transactions/list', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setTransactions(data.transactions || [])
      }
    } catch (error) {
      console.error('Error fetching transactions:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterTransactions = () => {
    let filtered = [...transactions]

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (t) =>
          t.customer_id.toLowerCase().includes(term) ||
          t.pickup_location.toLowerCase().includes(term) ||
          t.destination_location.toLowerCase().includes(term)
      )
    }

    // Filter by month
    if (selectedMonth > 0) {
      filtered = filtered.filter((t) => {
        const date = new Date(t.date)
        return date.getMonth() + 1 === selectedMonth
      })
    }

    // Sort by newest first
    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    setFilteredTransactions(filtered)

    // Calculate total revenue for filtered transactions
    const revenue = filtered.reduce((sum, t) => sum + t.price, 0)
    setTotalRevenue(revenue)
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      deleteTransaction(id)
    }
  }

  const handleUpdate = (transaction: Transaction) => {
    // Update logic - would open edit modal
    alert(`Edit transaction: ${transaction.customer_id}`)
    // TODO: Implement edit modal or drawer
  }

  const deleteTransaction = async (id: string) => {
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch(`/api/transactions/delete?id=${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        // Remove from local state
        setTransactions(transactions.filter(t => t.id !== id))
        alert('Transaction deleted successfully!')
        // Refresh metrics
        filterTransactions()
      } else {
        const data = await response.json()
        alert(`Error: ${data.error || 'Failed to delete transaction'}`)
      }
    } catch (error) {
      console.error('Error deleting transaction:', error)
      alert('An error occurred while deleting the transaction')
    }
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-6">📋 All Transactions</h2>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by Customer ID, Location..."
            className="input-field pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Month Filter */}
        <div className="relative">
          <ChevronDown className="absolute right-3 top-3 text-gray-400 pointer-events-none" size={20} />
          <select
            className="input-field appearance-none"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
          >
            {MONTHS.map((month, index) => (
              <option key={index} value={index}>
                {month}
              </option>
            ))}
          </select>
        </div>

        {/* Summary */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm">Filtered Revenue</p>
            <p className="text-lg font-bold text-gray-900">AED {totalRevenue.toFixed(2)}</p>
          </div>
          <span className="text-2xl">💰</span>
        </div>
      </div>

      {/* Transactions Table */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Loading transactions...</p>
        </div>
      ) : filteredTransactions.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">
            {transactions.length === 0
              ? 'No transactions yet. Add your first entry!'
              : 'No transactions match your filters.'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Customer ID
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Pickup Location
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Destination
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Date & Time
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                  Price (AED)
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((transaction) => (
                <tr
                  key={transaction.id}
                  className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {transaction.customer_id}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {transaction.pickup_location}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {transaction.destination_location}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {formatDate(transaction.date)} at {transaction.time}
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-right text-green-600">
                    AED {transaction.price.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-sm text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleUpdate(transaction)}
                        className="inline-flex items-center gap-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                        title="Edit transaction"
                      >
                        <Edit2 size={14} />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(transaction.id)}
                        className="inline-flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                        title="Delete transaction"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Summary */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-4 border-t border-gray-200 flex justify-between items-center rounded-b-lg">
            <div>
              <p className="text-gray-600 text-sm">Total displayed transactions: {filteredTransactions.length}</p>
            </div>
            <div className="text-right">
              <p className="text-gray-600 text-sm">Total Revenue (Filtered)</p>
              <p className="text-2xl font-bold text-gray-900">AED {totalRevenue.toFixed(2)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
