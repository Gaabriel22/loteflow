import type { Metadata } from "next"
import type { ReactNode } from "react"
import { siteUrl } from "@/lib/site-url"
import "./globals.css"

const title = "LoteFlow — Preparação de planilhas de produtos"
const description =
  "Experimente validações genéricas com dados fictícios, consulte uma prévia local de CSV e relacione colunas a campos de produto."

export const metadata: Metadata = {
  ...(siteUrl ? { metadataBase: siteUrl, alternates: { canonical: "/" } } : {}),
  title,
  description,
  openGraph: {
    title,
    description,
    locale: "pt_BR",
    siteName: "LoteFlow",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  )
}
