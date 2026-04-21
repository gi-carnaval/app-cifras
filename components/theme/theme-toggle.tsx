'use client'

import type { ComponentType } from 'react'
import { MonitorIcon, MoonIcon, SunIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme, type Theme } from './theme-provider'

const themeOptions: Array<{
  value: Theme
  label: string
  icon: ComponentType<{ className?: string }>
}> = [
  { value: 'light', label: 'Claro', icon: SunIcon },
  { value: 'dark', label: 'Escuro', icon: MoonIcon },
  { value: 'system', label: 'Sistema', icon: MonitorIcon },
]

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const currentThemeIndex = themeOptions.findIndex((option) => option.value === theme)
  const CurrentIcon = themeOptions[currentThemeIndex]?.icon ?? MonitorIcon

  function cycleTheme() {
    const nextTheme = themeOptions[(currentThemeIndex + 1) % themeOptions.length]

    setTheme(nextTheme.value)
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      aria-label={`Tema atual: ${themeOptions[currentThemeIndex]?.label ?? 'Sistema'}`}
      title="Alternar tema"
      onClick={cycleTheme}
    >
      <CurrentIcon className="size-4" />
      <span className="hidden sm:inline">
        {themeOptions[currentThemeIndex]?.label ?? 'Sistema'}
      </span>
    </Button>
  )
}
