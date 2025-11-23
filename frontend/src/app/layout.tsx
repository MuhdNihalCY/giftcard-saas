import type { Metadata } from 'next'
import { Playfair_Display, Montserrat } from 'next/font/google'
import './globals.css'
import { ErrorBoundaryWrapper } from '@/components/ErrorBoundaryWrapper'
import { ToastProvider } from '@/components/ui/ToastContainer'

const playfairDisplay = Playfair_Display({ 
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
})

const montserrat = Montserrat({ 
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Gift Card SaaS',
  description: 'Digital Gift Card Platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="light">
      <body className={`${montserrat.variable} ${playfairDisplay.variable} font-sans text-gray-100 bg-navy-900 antialiased`}>
        <ErrorBoundaryWrapper>
          <ToastProvider>
            {children}
          </ToastProvider>
        </ErrorBoundaryWrapper>
      </body>
    </html>
  )
}

