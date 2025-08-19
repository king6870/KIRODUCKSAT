"use client"

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'

function ErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  return (
    <div className="rounded-md bg-red-50 p-4">
      <div className="text-sm text-red-700">
        {error === 'Configuration' && 'There is a problem with the server configuration.'}
        {error === 'AccessDenied' && 'Access was denied.'}
        {error === 'Verification' && 'The verification token has expired or has already been used.'}
        {!error && 'An unknown error occurred.'}
      </div>
    </div>
  )
}

export default function AuthError() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Authentication Error
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            There was a problem signing you in
          </p>
        </div>
        <Suspense fallback={
          <div className="rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-700">Loading error details...</div>
          </div>
        }>
          <ErrorContent />
        </Suspense>
        <div className="text-center">
          <Link 
            href="/"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Return to home page
          </Link>
        </div>
      </div>
    </div>
  )
}