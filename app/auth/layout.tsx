import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Autenticación - SamaraCore',
  description: 'Accede a tu cuenta de SamaraCore o crea una nueva para comenzar a usar agentes IA personalizados.',
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#0E0E10] text-white font-['Inter']">
      {children}
    </div>
  )
} 