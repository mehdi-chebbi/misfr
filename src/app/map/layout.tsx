import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Misbar Africa Geoportal - Interactive Map',
  description: 'Interactive mapping application with Copernicus data integration',
}

export default function MapLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="fixed top-16 left-0 right-0 bottom-0 overflow-hidden">
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  )
}