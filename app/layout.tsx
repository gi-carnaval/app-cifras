import type { Metadata } from 'next'
import './globals.css'
import { Montserrat } from "next/font/google";
import { cn } from "@/lib/utils";
import { ThemeProvider } from '@/components/theme/theme-provider';
import { AuthSessionProvider } from '@/features/auth/auth-session-provider';
import { AppHeader } from '@/features/navigation/components/app-header';

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
            <AppHeader />
            {children}
          </AuthSessionProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
