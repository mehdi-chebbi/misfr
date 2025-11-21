import type { Metadata } from 'next'
import Navbar from '@/components/Navbar'

export const metadata: Metadata = {
  title: 'MISFR Geoportal - Interactive Map',
  description: 'Interactive mapping application with Copernicus data integration',
}

export default function MapLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="h-screen overflow-hidden flex flex-col">
      <Navbar />
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  )
}