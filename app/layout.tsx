import type { Metadata } from 'next'
import './globals.css'
import { Montserrat } from "next/font/google";
import { cn } from "@/lib/utils";
import Link from 'next/link';
import { ThemeProvider } from '@/components/theme/theme-provider';
import ThemeToggle from '@/components/theme/theme-toggle';
import { AuthSessionProvider } from '@/features/auth/auth-session-provider';
import { AuthNav } from '@/features/auth/components/auth-nav';
import { CreateSongNavLink } from '@/features/auth/components/create-song-nav-link';

const montserrat = Montserrat({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'CifrasApp — Motor de Cifras',
  description: 'Sistema de exibição e edição de cifras musicais',
}

const themeScript = `
  (function() {
    try {
      var storageKey = 'cifras-app-theme';
      var theme = localStorage.getItem(storageKey) || 'system';
      var systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      var resolvedTheme = theme === 'system' ? systemTheme : theme;
      var root = document.documentElement;

      root.classList.toggle('dark', resolvedTheme === 'dark');
      root.dataset.theme = theme;
      root.style.colorScheme = resolvedTheme;
    } catch (_) {}
  })();
`

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="pt-BR"
      className={cn("font-sans", montserrat.variable)}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="bg-(--bg) text-(--text)">
        <ThemeProvider>
          <AuthSessionProvider>
            <nav className="border-b border-border bg-(--bg)">
              <div className="flex items-center justify-between max-w-215 mx-auto my-0 px-6 py-5">
                <Link href="/" className="text-2xl font-black text-accent tracking-[-0.5px]">
                  Cifras<span>App</span>
                </Link>
                <div className="navbar-links">
                  <Link href="/" className="navbar-link">Músicas</Link>
                  <Link href="/repertoires" className="navbar-link">Repertórios</Link>
                  <CreateSongNavLink />
                  <AuthNav />
                  <ThemeToggle />
                </div>
              </div>
            </nav>
            {children}
          </AuthSessionProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
