import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Soundboard — Music Moodboards',
  description: 'Capture sonic references and build moodboards for your music projects',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="noise">
        {children}
      </body>
    </html>
  )
}
