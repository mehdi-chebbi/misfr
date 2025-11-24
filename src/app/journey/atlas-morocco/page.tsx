'use client'

import Link from 'next/link'

export default function AtlasMoroccoPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Atlas Mountains - Morocco</h1>
        <p className="text-xl mb-8">This is a detailed page for Atlas Mountains - Morocco</p>
        <Link 
          href="/journey" 
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
        >
          ← Back to Journey
        </Link>
      </div>
    </div>
  )
}