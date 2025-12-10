'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, AlertCircle, X } from 'lucide-react'

interface ToastProps {
  message: string
  type: 'success' | 'error'
  onClose: () => void
  autoCloseDuration?: number
}

export function Toast({ message, type, onClose, autoCloseDuration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, autoCloseDuration)
    return () => clearTimeout(timer)
  }, [onClose, autoCloseDuration])

  const bgColor = type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
  const textColor = type === 'success' ? 'text-green-800' : 'text-red-800'
  const Icon = type === 'success' ? CheckCircle : AlertCircle

  return (
    <div className={`fixed bottom-4 right-4 ${bgColor} border ${textColor} px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 animate-slide-in-up z-50`}>
      <Icon size={20} />
      <span>{message}</span>
      <button onClick={onClose} className="ml-4 hover:opacity-70">
        <X size={18} />
      </button>
    </div>
  )
}
