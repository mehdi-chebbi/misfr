'use client'

export default function JourneyPage() {
  return (
    <iframe 
      src="/journey.html" 
      style={{
        width: '100vw',
        height: '100vh',
        border: 'none',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
      }}
      title="Journey"
    />
  )
}