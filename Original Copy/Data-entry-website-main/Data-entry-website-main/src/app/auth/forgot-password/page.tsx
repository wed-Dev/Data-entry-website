'use client'

import Link from 'next/link'
import { Mail, ArrowLeft } from 'lucide-react'

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-xl p-8 animate-fade-in">
        <div className="text-center mb-8">
          <Mail size={48} className="mx-auto text-blue-600 mb-4" />
          <h1 className="text-3xl font-bold text-gray-900">Password Reset</h1>
          <p className="text-gray-600 mt-4">
            Password reset functionality is currently under development.
            Please contact your administrator for assistance with password resets.
          </p>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <Link href="/auth/login" className="flex items-center justify-center gap-2 text-blue-600 font-medium hover:underline">
            <ArrowLeft size={18} />
            Back to login
          </Link>
        </div>
      </div>
    </div>
  )
}
