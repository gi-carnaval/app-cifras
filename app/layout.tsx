import type { Metadata } from 'next'
import './globals.css'
import { Montserrat } from "next/font/google";
import { cn } from "@/lib/utils";
import Link from 'next/link';

const montserrat = Montserrat({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'CifrasApp — Motor de Cifras',
  description: 'Sistema de exibição e edição de cifras musicais',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className={cn("font-sans", montserrat.variable)}>
      <body className="bg-(--bg) text-accent">
        <nav style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between max-w-215 mx-auto my-0 px-6 py-5">
            <Link href="/" className="text-2xl font-black text-accent tracking-[-0.5px]">
              Cifras<span>App</span>
            </Link>
            <div className="navbar-links">
              <Link href="/" className="navbar-link">Músicas</Link>
              <Link href="/song/create" className="navbar-link">
                <span className="btn-primary btn-sm">+ Nova Música</span>
              </Link>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  )
}
