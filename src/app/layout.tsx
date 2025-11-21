import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'

export const metadata: Metadata = {
  title: 'MISFR - Geospatial Analysis',
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
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
      </body>
    </html>
  )
}