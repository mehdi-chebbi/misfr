import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'
import { AuthProvider } from '@/contexts/AuthContext'

export const metadata: Metadata = {
  title: 'Misbar Africa - Geospatial Analysis',
  description: 'Interactive mapping application with Copernicus data integration',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <AuthProvider>
          <Navbar />
          <main className="flex-1 overflow-hidden">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  )
}