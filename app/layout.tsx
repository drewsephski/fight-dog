import { ClerkProvider } from '@clerk/nextjs'
import { Archivo_Black, Space_Grotesk } from 'next/font/google'
import { cn } from '@/lib/utils'
import '@/app/globals.css'
import { ToastProvider } from './components/toast-provider'
import { ThemeProvider } from './components/theme-provider'

const archivoBlack = Archivo_Black({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-head',
  display: 'swap',
})

const space = Space_Grotesk({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-sans',
  display: 'swap',
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <ThemeProvider>
        <html
          lang="en"
          suppressHydrationWarning
          className={cn('antialiased', archivoBlack.variable, space.variable)}
        >
          <body className="min-h-screen bg-background text-foreground">
            {children}
            <ToastProvider />
          </body>
        </html>
      </ThemeProvider>
    </ClerkProvider>
  )
}
