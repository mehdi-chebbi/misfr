import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Journey - MISFR Geospatial Intelligence',
  description: 'Embark on an interactive journey to discover Earth\'s secrets through satellite imagery and geospatial analysis.',
}

export default function JourneyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}