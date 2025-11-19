import { Inter } from 'next/font/google'

import type { Metadata } from 'next'

import './globals.css'
import { GlobalHeader } from '@/components/layout/GlobalHeader'
import { AuthProvider } from '@/contexts/AuthContext'
import { CompanyProvider } from '@/contexts/CompanyContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ContaPyme - Sistema Contable Integral',
  description: 'Plataforma contable completa para PyMEs con dashboard financiero, balances y proyecciones',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <AuthProvider>
          <CompanyProvider>
            <GlobalHeader />
            {children}
          </CompanyProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
