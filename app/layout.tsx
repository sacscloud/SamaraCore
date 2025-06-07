import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/components/AuthProvider'
import { ThemeProvider } from '@/lib/theme-context'

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
    <html lang="es" className="dark" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('theme') || 'dark';
                document.documentElement.classList.toggle('dark', theme === 'dark');
              } catch (e) {
                document.documentElement.classList.add('dark');
              }
            `,
          }}
        />
        <ThemeProvider>
          <div className="min-h-screen bg-white dark:bg-[#0E0E10] text-gray-900 dark:text-white">
          <AuthProvider>
            {children}
          </AuthProvider>
        </div>
        </ThemeProvider>
      </body>
    </html>
  )
} 