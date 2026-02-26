import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SahiGaadi — Vehicle Recommender for Lucknow',
  description:
    'Find the right car, motorcycle, or scooty for Lucknow roads, your zone, and your lifestyle. Hyper-local intelligence built for Lucknow buyers.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
