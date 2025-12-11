'use client'

import { useEffect, useState } from 'react'
import { AppLayout } from '@/components/AppLayout'
import { Toast } from '@/components/Toast'
import { EditTransactionModal } from '@/components/EditTransactionModal'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { Transaction } from '@/types'
import { Search, Edit, Trash2, ChevronLeft, ChevronRight, Download, FileText, DollarSign } from 'lucide-react'
import Link from 'next/link'
import axios from 'axios'

interface Invoice {
  _id: string
  invoiceNumber: string
  date: string
  companyName: string
  vehicleNumber: string
  currentLocation: string
  destinationLocation: string
  distance: string
  totalAmount: string
  createdAt: string
}

export default function TransactionsPage() {
  const [activeTab, setActiveTab] = useState<'transactions' | 'invoices'>('transactions')
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
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
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

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

  const fetchInvoices = async () => {
    setLoading(true)
    try {
      const response = await axios.get('/api/invoices')
      setInvoices(response.data.invoices || [])
    } catch (error) {
      showToast('Failed to load invoices', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'transactions') {
      fetchTransactions()
    } else {
      fetchInvoices()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, searchTerm, monthFilter, sortBy, sortOrder, page])

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

  const downloadTransactionsCSV = () => {
    let filtered = [...transactions]
    
    if (startDate && endDate) {
      filtered = filtered.filter(t => {
        const tDate = new Date(t.date)
        return tDate >= new Date(startDate) && tDate <= new Date(endDate)
      })
    }

    const headers = ['Date', 'Customer ID', 'Pickup', 'Destination', 'Distance (KM)', 'Price (AED)']
    const rows = filtered.map(t => [
      t.date,
      t.customerId,
      t.pickup,
      t.destination,
      t.distance,
      t.price
    ])

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `transactions_${startDate || 'all'}_to_${endDate || 'all'}.csv`
    a.click()
    URL.revokeObjectURL(url)
    showToast('CSV downloaded successfully', 'success')
  }

  const downloadInvoicesCSV = () => {
    let filtered = [...invoices]
    
    if (startDate && endDate) {
      filtered = filtered.filter(inv => {
        const invDate = new Date(inv.date)
        return invDate >= new Date(startDate) && invDate <= new Date(endDate)
      })
    }

    const headers = ['Invoice #', 'Date', 'Company', 'Vehicle #', 'Current Location', 'Destination', 'Distance (KM)', 'Total Amount (AED)']
    const rows = filtered.map(inv => [
      inv.invoiceNumber,
      new Date(inv.date).toLocaleDateString(),
      inv.companyName,
      inv.vehicleNumber,
      inv.currentLocation,
      inv.destinationLocation,
      inv.distance,
      inv.totalAmount
    ])

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `invoices_${startDate || 'all'}_to_${endDate || 'all'}.csv`
    a.click()
    URL.revokeObjectURL(url)
    showToast('CSV downloaded successfully', 'success')
  }

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header with Tabs */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Data Management</h1>
            <p className="text-gray-600 mt-1">Manage your transactions and invoices</p>
          </div>
          <Link href="/transactions/new" className="btn-primary">
            + New Transaction
          </Link>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('transactions')}
              className={`pb-4 px-2 border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'transactions'
                  ? 'border-blue-600 text-blue-600 font-semibold'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <DollarSign size={20} />
              Transactions
            </button>
            <button
              onClick={() => setActiveTab('invoices')}
              className={`pb-4 px-2 border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'invoices'
                  ? 'border-blue-600 text-blue-600 font-semibold'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <FileText size={20} />
              Invoices
            </button>
          </div>
        </div>

        {/* Filters and Download */}
        <div className="card">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-end">
            <div className="flex-1 flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="input-field"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="input-field"
                />
              </div>
            </div>
            <button
              onClick={activeTab === 'transactions' ? downloadTransactionsCSV : downloadInvoicesCSV}
              className="btn-primary whitespace-nowrap"
            >
              <Download size={18} />
              Download CSV
            </button>
          </div>
        </div>

        {activeTab === 'transactions' ? (
          <>
            {/* Search and Filters */}
            <div className="card">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                    <input
                      type="text"
                      placeholder="Search by customer ID, pickup, or destination..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="input-field pl-10"
                    />
                  </div>
                </div>
                <div className="w-full md:w-48">
                  <select
                    value={monthFilter}
                    onChange={(e) => setMonthFilter(e.target.value)}
                    className="input-field"
                  >
                    <option value="">All Months</option>
                    <option value="2025-01">January 2025</option>
                    <option value="2025-02">February 2025</option>
                    <option value="2025-03">March 2025</option>
                    <option value="2025-04">April 2025</option>
                    <option value="2025-05">May 2025</option>
                    <option value="2025-06">June 2025</option>
                    <option value="2025-07">July 2025</option>
                    <option value="2025-08">August 2025</option>
                    <option value="2025-09">September 2025</option>
                    <option value="2025-10">October 2025</option>
                    <option value="2025-11">November 2025</option>
                    <option value="2025-12">December 2025</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Transactions Table */}
            <div className="card overflow-x-auto">
              {loading ? (
                <div className="text-center py-12">
                  <p className="text-gray-600">Loading transactions...</p>
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600">No transactions found</p>
                </div>
              ) : (
                <>
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pickup</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Destination</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Distance</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {transactions.map((transaction) => (
                        <tr key={transaction.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.date}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.customerId}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{transaction.pickup}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{transaction.destination}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{transaction.distance} KM</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">AED {transaction.price.toFixed(2)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button onClick={() => handleEdit(transaction)} className="text-blue-600 hover:text-blue-900 mr-4">
                              <Edit size={18} />
                            </button>
                            <button onClick={() => handleDeleteClick(transaction.id)} className="text-red-600 hover:text-red-900">
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Pagination */}
                  <div className="flex justify-between items-center mt-6">
                    <p className="text-sm text-gray-600">
                      Page {page} of {totalPages}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setPage(page - 1)}
                        disabled={page === 1}
                        className="btn-secondary disabled:opacity-50"
                      >
                        <ChevronLeft size={18} />
                        Previous
                      </button>
                      <button
                        onClick={() => setPage(page + 1)}
                        disabled={page === totalPages}
                        className="btn-secondary disabled:opacity-50"
                      >
                        Next
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </>
        ) : (
          /* Invoices Table */
          <div className="card overflow-x-auto">
            {loading ? (
              <div className="text-center py-12">
                <p className="text-gray-600">Loading invoices...</p>
              </div>
            ) : invoices.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">No invoices found</p>
                <Link href="/invoice" className="btn-primary mt-4 inline-block">
                  Create Invoice
                </Link>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice #</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">From</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">To</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Distance</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {invoices.map((invoice) => (
                    <tr key={invoice._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-600">{invoice.invoiceNumber}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(invoice.date).toLocaleDateString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{invoice.companyName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{invoice.vehicleNumber}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{invoice.currentLocation}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{invoice.destinationLocation}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{invoice.distance} KM</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">AED {invoice.totalAmount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {showEditModal && editingTransaction && (
        <EditTransactionModal
          transaction={editingTransaction}
          onSave={handleSaveEdit}
          onClose={() => setShowEditModal(false)}
        />
      )}

      {showDeleteConfirm && (
        <ConfirmDialog
          title="Delete Transaction"
          message="Are you sure you want to delete this transaction? This action cannot be undone."
          onConfirm={handleDelete}
          onCancel={() => {
            setShowDeleteConfirm(false)
            setDeletingId(null)
          }}
        />
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </AppLayout>
  )
}
