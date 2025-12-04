// Authentication utilities
import crypto from 'crypto'

export interface AuthToken {
  token: string
  userId: string
  email: string
}

// Generate JWT-like token (simple implementation)
export function generateToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

// Hash password (SHA-256 - use bcrypt in production)
export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex')
}

// Verify token (simple check)
export function verifyToken(token: string): boolean {
  return !!token && token.length > 0
}

// Get token from request
export function getTokenFromRequest(authHeader: string | null): string | null {
  if (!authHeader) return null
  const parts = authHeader.split(' ')
  return parts.length === 2 && parts[0] === 'Bearer' ? parts[1] : null
}

// Store auth data in localStorage
export function storeAuthData(token: string, userId: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_token', token)
    localStorage.setItem('user_id', userId)
  }
}

// Get auth data from localStorage
export function getAuthData(): AuthToken | null {
  if (typeof window === 'undefined') return null
  
  const token = localStorage.getItem('auth_token')
  const userId = localStorage.getItem('user_id')
  
  if (!token || !userId) return null
  
  return {
    token,
    userId,
    email: localStorage.getItem('remembered_email') || '',
  }
}

// Clear auth data
export function clearAuthData(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_id')
    localStorage.removeItem('remembered_email')
    localStorage.removeItem('remember_me')
  }
}

// Check if user is authenticated
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false
  return !!localStorage.getItem('auth_token')
}
