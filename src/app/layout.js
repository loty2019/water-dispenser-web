import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from './theme-provider'
import { ThemeSwitcher } from './components/ThemeSwitcher'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'WaterHub',
  description: 'Sip by Sip, Track Your Trip to Hydration!',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} bg-slate-50 dark:bg-[#5599ff]`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ThemeSwitcher />
          <main>{children}</main>
        </ThemeProvider>
      </body>
    </html>
  )
}
