import type { Metadata } from 'next'
import { Playfair_Display, Montserrat, Poppins, Merriweather, Roboto, Open_Sans } from 'next/font/google'
import './globals.css'
import { ClientProviders } from '@/components/ClientProviders'

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

const poppins = Poppins({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
})

const merriweather = Merriweather({ 
  subsets: ['latin'],
  weight: ['300', '400', '700'],
  variable: '--font-merriweather',
  display: 'swap',
})

const roboto = Roboto({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
  variable: '--font-roboto',
  display: 'swap',
})

const openSans = Open_Sans({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-open-sans',
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
    <html lang="en" suppressHydrationWarning>
      <body 
        className={`${montserrat.variable} ${playfairDisplay.variable} ${poppins.variable} ${merriweather.variable} ${roboto.variable} ${openSans.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  )
}

