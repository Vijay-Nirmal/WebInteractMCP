'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function DocsIndex() {
  const router = useRouter()

  useEffect(() => {
    // Client-side redirect to latest docs (works with static export)
    router.replace('/docs/latest')
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to documentation...</p>
      </div>
    </div>
  )
}
