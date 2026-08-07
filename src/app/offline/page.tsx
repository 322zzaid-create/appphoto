'use client'

import { WifiOff } from 'lucide-react'

export default function OfflinePage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-[#0a0a0f] px-6 text-center">
      <div className="mb-6 rounded-2xl bg-white/5 p-6">
        <WifiOff className="h-12 w-12 text-purple-400" />
      </div>
      <h1 className="mb-2 text-2xl font-bold text-white">You&apos;re Offline</h1>
      <p className="mb-8 max-w-sm text-gray-400">
        It looks like you&apos;ve lost your internet connection. Check your network and try again.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="rounded-xl bg-purple-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-purple-500 active:bg-purple-700"
      >
        Try Again
      </button>
    </div>
  )
}
