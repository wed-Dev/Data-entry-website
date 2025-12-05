// Authentication utilities
import jwt from 'jsonwebtoken'
import type { AuthPayload } from '@/types/transactions'

const JWT_SECRET = process.env.JWT_SECRET || ''

// Sign JWT token
export function signToken(payload: AuthPayload): string {
  if (!JWT_SECRET) throw new Error('JWT_SECRET missing')
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

// Verify JWT token
export function verifyToken(token?: string): AuthPayload | null {
  if (!token || !JWT_SECRET) return null
  try {
    return jwt.verify(token, JWT_SECRET) as AuthPayload
  } catch {
    return null
  }
}

// Extract Bearer token from Authorization header
export function getTokenFromHeader(header?: string | null): string | null {
  if (!header) return null
  const [type, token] = header.split(' ')
  return type === 'Bearer' && token ? token : null
}

// Store auth data in localStorage (client-side)
export function storeAuthData(token: string, userId: string, email: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_token', token)
    localStorage.setItem('user_id', userId)
    localStorage.setItem('user_email', email)
  }
}

// Get auth data from localStorage
export interface AuthToken {
  token: string
  userId: string
  email: string
}

export function getAuthData(): AuthToken | null {
  if (typeof window === 'undefined') return null

  const token = localStorage.getItem('auth_token')
  const userId = localStorage.getItem('user_id')
  const email = localStorage.getItem('user_email')

  if (!token || !userId) return null

  return { token, userId, email: email || '' }
}

// Clear auth data
export function clearAuthData(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_id')
    localStorage.removeItem('user_email')
    localStorage.removeItem('remember_me')
    localStorage.removeItem('remembered_email')
  }
}

// Check if user is authenticated
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false
  return !!localStorage.getItem('auth_token')
}
