'use client'

import { useEffect, useState } from 'react'
import { AppLayout } from '@/components/AppLayout'
import { Toast } from '@/components/Toast'
import { EditTransactionModal } from '@/components/EditTransactionModal'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { Transaction } from '@/types'
import { Search, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import axios from 'axios'

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [monthFilter, setMonthFilter] = useState('')
  const [sortBy, setSortBy] = useState('created_at')
  const [sortOrder, setSortOrder] = useState('desc')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const limit = 10

  const fetchTransactions = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy,
        order: sortOrder,
      })

      if (searchTerm) params.append('search', searchTerm)
      if (monthFilter) params.append('month', monthFilter)

      const response = await axios.get(`/api/transactions?${params}`)
      setTransactions(response.data.data || [])
      setTotalPages(response.data.totalPages || 1)
    } catch (error) {
      showToast('Failed to load transactions', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTransactions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, monthFilter, sortBy, sortOrder, page])

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setShowEditModal(true)
  }

  const handleSaveEdit = async (updatedData: Partial<Transaction>) => {
    if (!editingTransaction) return

    try {
      const updatePayload = {
        ...updatedData,
        price: typeof updatedData.price === 'string' ? parseFloat(updatedData.price) : updatedData.price,
      }

      await axios.put(`/api/transactions/${editingTransaction.id}`, updatePayload)
      showToast('Transaction updated successfully', 'success')
      setShowEditModal(false)
      fetchTransactions()
    } catch (error) {
      showToast('Failed to update transaction', 'error')
    }
  }

  const handleDeleteClick = (id: string) => {
    setDeletingId(id)
    setShowDeleteConfirm(true)
  }

  const handleDelete = async () => {
    if (!deletingId) return

    try {
      await axios.delete(`/api/transactions/${deletingId}`)
      showToast('Transaction deleted successfully', 'success')
      setShowDeleteConfirm(false)
      setDeletingId(null)
      fetchTransactions()
    } catch (error) {
      showToast('Failed to delete transaction', 'error')
    }
  }

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
  }

  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
  }

  const SortButton = ({ field, label }: { field: string; label: string }) => (
    <button
      onClick={() => toggleSort(field)}
      className={`text-sm font-medium ${
        sortBy === field ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
      }`}
    >
      {label} {sortBy === field && (sortOrder === 'asc' ? '↑' : '↓')}
    </button>
  )

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
            <p className="text-gray-600 mt-1">Manage all your transactions</p>
          </div>
          <Link href="/transactions/new" className="btn-primary">
            + New Transaction
          </Link>
        </div>

        {/* Filters */}
        <div className="card space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search size={18} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by customer ID, pickup, or destination..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    setPage(1)
                  }}
                  className="input-field pl-10"
                />
              </div>
            </div>

            {/* Month Filter */}
            <div>
              <input
                type="month"
                value={monthFilter}
                onChange={(e) => {
                  setMonthFilter(e.target.value)
                  setPage(1)
                }}
                className="input-field"
              />
            </div>
          </div>

          {/* Sort Controls */}
          <div className="flex gap-4 text-sm">
            <SortButton field="date" label="Date" />
            <SortButton field="price" label="Price" />
            <SortButton field="created_at" label="Created" />
          </div>
        </div>

        {/* Table */}
        <div className="card overflow-x-auto">
          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Loading transactions...</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No transactions found</p>
              <Link href="/transactions/new" className="text-blue-600 hover:underline mt-2 inline-block">
                Create your first transaction
              </Link>
            </div>
          ) : (
            <>
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Customer ID</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Pickup</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Destination</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Date</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Price</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-900">{transaction.customerId}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{transaction.pickupLocation}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{transaction.destination}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{transaction.date}</td>
                      <td className="px-6 py-4 text-sm text-right font-semibold text-gray-900">
                        AED {transaction.price.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEdit(transaction)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Edit"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(transaction.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              <div className="flex justify-between items-center px-6 py-4 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  Page {page} of {totalPages}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="p-2 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="p-2 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      <EditTransactionModal
        isOpen={showEditModal}
        transaction={editingTransaction}
        onClose={() => {
          setShowEditModal(false)
          setEditingTransaction(null)
        }}
        onSave={handleSaveEdit}
      />

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete Transaction"
        message="Are you sure you want to delete this transaction? This action cannot be undone."
        isDangerous={true}
        onConfirm={handleDelete}
        onCancel={() => {
          setShowDeleteConfirm(false)
          setDeletingId(null)
        }}
      />

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </AppLayout>
  )
}
