'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Link from 'next/link'

export default function SignUpSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <Card className="w-full max-w-md p-8 shadow-lg text-center">
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Account Created!</h1>
        <p className="text-gray-600 mb-6">
          Please check your email to confirm your account before signing in.
        </p>

        <p className="text-sm text-gray-500 mb-8">
          A confirmation link has been sent to your email address. Click the link to activate your account.
        </p>

        <Link href="/auth/login">
          <Button className="w-full bg-blue-600 hover:bg-blue-700">
            Back to Login
          </Button>
        </Link>
      </Card>
    </div>
  )
}
