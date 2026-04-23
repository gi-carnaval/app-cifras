"use client"

import Link from "next/link"
import { MenuIcon } from "lucide-react"

import { AuthNav } from "@/features/auth/components/auth-nav"
import { CreateSongNavLink } from "@/features/auth/components/create-song-nav-link"
import ThemeToggle from "@/components/theme/theme-toggle"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

const navItems = [
  { href: "/", label: "Músicas" },
  { href: "/categorias", label: "Categorias" },
  { href: "/repertoires", label: "Repertórios" },
]

const desktopNavLinkClassName =
  "rounded-full px-3 py-2 text-sm font-medium text-(--text-muted) transition-colors hover:bg-muted hover:text-(--text)"

const mobileNavLinkClassName =
  "flex items-center rounded-xl border border-border bg-background px-4 py-3 text-sm font-medium text-(--text) transition-colors hover:bg-muted"

export function AppHeader() {
  return (
    <header className="border-b border-border/80 bg-(--bg)/95 backdrop-blur">
      <div className="mx-auto flex max-w-215 items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3 md:gap-6">
          <Link
            href="/"
            className="shrink-0 text-xl font-black tracking-[-0.5px] text-accent sm:text-2xl"
          >
            Cifras<span className="text-(--text)">App</span>
          </Link>

          <nav className="hidden items-center gap-1 rounded-full border border-border/70 bg-background/80 p-1 md:flex">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className={desktopNavLinkClassName}>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <CreateSongNavLink />
          <div className="h-6 w-px bg-border" />
          <AuthNav />
          <ThemeToggle />
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              className="md:hidden"
              aria-label="Abrir navegação"
            >
              <MenuIcon className="size-4" />
            </Button>
          </DialogTrigger>
          <DialogContent
            className="top-0 right-0 left-auto flex h-dvh w-[min(24rem,100vw)] translate-x-0 translate-y-0 flex-col gap-0 rounded-none border-l border-border bg-(--bg) p-0 sm:max-w-none"
            showCloseButton={false}
          >
            <DialogHeader className="border-b border-border px-5 py-4">
              <div className="flex items-center justify-between gap-4">
                <DialogTitle className="text-base font-semibold text-(--text)">
                  Navegação
                </DialogTitle>
                <ThemeToggle className="shrink-0" labelClassName="inline" />
              </div>
              <DialogDescription className="text-(--text-muted)">
                Acesse músicas, repertórios e ações da sua conta sem ocupar a largura da tela.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-5 py-5">
              <nav className="flex flex-col gap-3">
                {navItems.map((item) => (
                  <DialogClose key={item.href} asChild>
                    <Link href={item.href} className={mobileNavLinkClassName}>
                      {item.label}
                    </Link>
                  </DialogClose>
                ))}
              </nav>

              <div className="space-y-3 rounded-2xl border border-border bg-background/80 p-3">
                <p className="px-1 text-xs font-semibold uppercase tracking-[0.18em] text-(--text-dim)">
                  Ações
                </p>
                <div className="flex flex-col gap-3">
                  <CreateSongNavLink className="w-full justify-center" />
                  <AuthNav
                    orientation="stacked"
                    linkClassName={mobileNavLinkClassName}
                    containerClassName="flex-col items-stretch"
                    userClassName="inline"
                    buttonClassName="w-full justify-center"
                  />
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </header>
  )
}
