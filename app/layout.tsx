import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Trip F1 - Planificador de Viajes',
  description: 'Planificador inteligente de rutas de viaje personalizadas',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}