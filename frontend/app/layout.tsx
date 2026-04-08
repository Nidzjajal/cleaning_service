import type { Metadata } from 'next'
import { Inter, Montserrat } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/context/AuthContext'
import { Toaster } from 'react-hot-toast'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'HelpLender — Professional Home Cleaning Services',
    template: '%s | HelpLender',
  },
  description:
    'Book professional, vetted home cleaning services in minutes. Bedroom, kitchen, floor care, deep cleaning & more. Live tracking included.',
  keywords: ['home cleaning', 'professional cleaners', 'book cleaning', 'deep cleaning', 'mumbai cleaning'],
  openGraph: {
    title: 'HelpLender — Professional Home Cleaning Services',
    description: 'Book vetted cleaners in minutes. Live tracking. INR pricing.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${montserrat.variable}`}>
      <body>
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                borderRadius: '10px',
                background: '#0F172A',
                color: '#fff',
                padding: '14px 18px',
                fontSize: '14px',
                fontFamily: 'Inter, sans-serif',
              },
              success: {
                style: { background: '#166534', color: '#fff' },
                iconTheme: { primary: '#22c55e', secondary: '#fff' },
              },
              error: {
                style: { background: '#991b1b', color: '#fff' },
                iconTheme: { primary: '#ef4444', secondary: '#fff' },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  )
}
