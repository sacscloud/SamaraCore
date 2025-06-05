import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/components/AuthProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SamaraCore - Tu Inteligencia Artificial, a tu Medida',
  description: 'Crea agentes inteligentes con herramientas personalizadas, memoria y lógica propia. Sin límites, sin dependencias.',
  keywords: 'inteligencia artificial, agentes IA, automatización, herramientas personalizadas, chatbots, AI agents',
  authors: [{ name: 'SamaraCore Team' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#0E0E10',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning className="dark">
      <body className={`${inter.className} antialiased`}>
        <div className="min-h-screen bg-[#0E0E10] text-white">
          <AuthProvider>
            {children}
          </AuthProvider>
        </div>
      </body>
    </html>
  )
} 