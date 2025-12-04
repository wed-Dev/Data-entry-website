// API client utilities
import axios, { AxiosInstance, AxiosError } from 'axios'

let apiClient: AxiosInstance

export function initializeApiClient(): AxiosInstance {
  const baseURL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  apiClient = axios.create({
    baseURL: `${baseURL}/api`,
    headers: {
      'Content-Type': 'application/json',
    },
  })

  // Add token to requests
  apiClient.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  })

  // Handle responses
  apiClient.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      if (error.response?.status === 401) {
        // Token expired or invalid
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token')
          localStorage.removeItem('user_id')
          // Redirect to login
          window.location.href = '/'
        }
      }
      return Promise.reject(error)
    }
  )

  return apiClient
}

export function getApiClient(): AxiosInstance {
  if (!apiClient) {
    initializeApiClient()
  }
  return apiClient
}

// Auth API calls
export async function loginUser(email: string, password: string) {
  const client = getApiClient()
  return client.post('/auth/login', { email, password })
}

export async function signupUser(name: string, email: string, password: string) {
  const client = getApiClient()
  return client.post('/auth/signup', { name, email, password })
}

// Transaction API calls
export async function createTransaction(data: {
  customer_id: string
  pickup_location: string
  destination_location: string
  date: string
  time: string
  price: number
}) {
  const client = getApiClient()
  return client.post('/transactions/create', data)
}

export async function getTransactions() {
  const client = getApiClient()
  return client.get('/transactions/list')
}

export async function getMetrics() {
  const client = getApiClient()
  return client.get('/transactions/metrics')
}

// Error handling
export function handleApiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (error.response?.data?.error) {
      return error.response.data.error
    }
    if (error.message) {
      return error.message
    }
  }
  return 'An error occurred. Please try again.'
}
