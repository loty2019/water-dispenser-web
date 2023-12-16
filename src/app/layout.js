import { Inter } from 'next/font/google'
import { ThemeSwitcher } from './components/ThemeSwitcher'
import './globals.css'
import { ThemeProvider } from './theme-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'WaterHub',
  description: 'Sip by Sip, Track Your Trip to Hydration!',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${inter.className}`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <canvas
            id="gradient-canvas"
            className="fixed inset-0 -z-10"
            data-transition-in
          />
          <ThemeSwitcher />
          <main>{children}</main>
        </ThemeProvider>
      </body>
    </html>
  )
}
