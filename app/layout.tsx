import type { Metadata, Viewport } from "next"
import { Geist } from "next/font/google"
import { Providers } from "@/components/Providers"
import "./globals.css"

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Gamers Republic",
  description: "One platform for all your squads",
  manifest: "/manifest.json",
}

export const viewport: Viewport = {
  themeColor: "#7c3aed",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} h-full`}>
      <body className="min-h-full bg-[#0a0e1a] text-slate-100 antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
