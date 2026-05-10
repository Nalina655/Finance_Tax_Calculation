'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function ErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error_description') || 'An authentication error occurred'

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <Card className="w-full max-w-md p-8 shadow-lg text-center">
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Authentication Error</h1>
        <p className="text-gray-600 mb-6">{error}</p>

        <Link href="/auth/login">
          <Button className="w-full bg-blue-600 hover:bg-blue-700">
            Try Again
          </Button>
        </Link>
      </Card>
    </div>
  )
}

export default function ErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
        <Card className="w-full max-w-md p-8 shadow-lg text-center">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full animate-pulse" />
          </div>
          <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto mb-2 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-full mx-auto mb-6 animate-pulse" />
          <div className="h-10 bg-gray-200 rounded w-full animate-pulse" />
        </Card>
      </div>
    }>
      <ErrorContent />
    </Suspense>
  )
}
