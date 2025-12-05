'use client'

export default function RootRedirect() {
  if (typeof window !== 'undefined') {
    window.location.href = '/auth/login'
  }
  
  return null
}
