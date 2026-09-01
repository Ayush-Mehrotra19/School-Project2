import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Learning App - GrowMyIQ',
  description: 'Re-inventing the way you learn. Interactive, engaging, and effective learning platform.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  )
}