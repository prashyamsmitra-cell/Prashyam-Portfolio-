import type React from "react"
import type { Metadata, Viewport } from "next"
import { Space_Grotesk, Syne } from "next/font/google"
import "./globals.css"

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
})

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  display: "swap",
})

export const metadata: Metadata = {
  title: "PRASHYAM — Full Stack AI Engineer",
  description:
    "Portfolio of Prashyam Mitra — Full Stack Software Engineer specializing in AI integrations, backend architecture, and production-ready web applications.",
  generator: "Next.js",
  icons: {
    icon: "/website%20favicon.jpeg",
    apple: "/website%20favicon.jpeg",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${syne.variable}`}>
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
