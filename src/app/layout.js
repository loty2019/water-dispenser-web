import { Inter } from 'next/font/google';
import Head from 'next/head';
import * as React from "react";
import { ThemeSwitcher } from './components/ThemeSwitcher';
import './globals.css';
import { ThemeProvider } from './theme-provider';
import { SpeedInsights } from "@vercel/speed-insights/next";

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  manifest: '/manifest.json',
  title: 'WaterHub',
  description: 'Sip by Sip, Track Your Trip to Hydration!'
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, viewport-fit=cover"></meta>
        <meta name="apple-mobile-web-app-capable" content="yes"></meta>
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent"></meta>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/logo/512.png"></link>
      </Head>
      
      <body className={`${inter.className}`} >
        <SpeedInsights/>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
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
