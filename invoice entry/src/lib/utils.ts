// Utility functions
import crypto from 'crypto'

// Format currency
export function formatCurrency(amount: number, currency: string = 'AED'): string {
  return `${currency} ${amount.toFixed(2)}`
}

// Format date
export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

// Format datetime
export function formatDateTime(dateString: string, timeString: string): string {
  return `${formatDate(dateString)} at ${timeString}`
}

// Validate email
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Validate password
export function isValidPassword(password: string): boolean {
  return password.length >= 6
}

// Generate unique ID
export function generateId(prefix: string = 'id'): string {
  return `${prefix}_${crypto.randomBytes(8).toString('hex')}`
}

// Debounce function
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout

  return function (...args: Parameters<T>) {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}

// Parse query string
export function parseQueryString(queryString: string): Record<string, string> {
  const params = new URLSearchParams(queryString)
  const obj: Record<string, string> = {}

  params.forEach((value, key) => {
    obj[key] = value
  })

  return obj
}

// Get month name
export function getMonthName(monthNumber: number): string {
  const months = [
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
  return months[monthNumber - 1] || ''
}

// Calculate total revenue
export function calculateTotalRevenue(transactions: any[]): number {
  return transactions.reduce((sum, t) => sum + (t.price || 0), 0)
}

// Get current date as YYYY-MM-DD
export function getCurrentDateString(): string {
  const today = new Date()
  return today.toISOString().split('T')[0]
}

// Check if date is today
export function isToday(dateString: string): boolean {
  const date = new Date(dateString)
  const today = new Date()
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  )
}

// Get month number from date string
export function getMonthFromDate(dateString: string): number {
  const date = new Date(dateString)
  return date.getMonth() + 1
}

// Filter transactions by month
export function filterByMonth(transactions: any[], monthNumber: number): any[] {
  if (monthNumber === 0) return transactions
  return transactions.filter((t) => getMonthFromDate(t.date) === monthNumber)
}

// Search transactions
export function searchTransactions(
  transactions: any[],
  searchTerm: string
): any[] {
  if (!searchTerm.trim()) return transactions

  const term = searchTerm.toLowerCase()
  return transactions.filter(
    (t) =>
      t.customer_id?.toLowerCase().includes(term) ||
      t.pickup_location?.toLowerCase().includes(term) ||
      t.destination_location?.toLowerCase().includes(term)
  )
}

// Sort transactions by date (newest first)
export function sortByNewest(transactions: any[]): any[] {
  return [...transactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )
}

// Truncate string
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return str.substring(0, maxLength) + '...'
}

// Capitalize string
export function capitalize(str: string): string {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

// Deep clone object
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
}

// Check if object is empty
export function isEmpty(obj: Record<string, any>): boolean {
  return Object.keys(obj).length === 0
}

// Merge objects
export function mergeObjects<T extends Record<string, any>>(
  target: T,
  source: Partial<T>
): T {
  return { ...target, ...source }
}

// Get value from nested object
export function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, prop) => current?.[prop], obj)
}
