'use client'

import { Sun, Moon } from 'lucide-react'
import { useTheme } from './theme-provider'

interface ThemeToggleProps {
  variant?: 'icon' | 'button'
}

export function ThemeToggle({ variant = 'icon' }: ThemeToggleProps) {
  const { resolvedTheme, toggleTheme } = useTheme()

  const isDark = resolvedTheme === 'dark'

  if (variant === 'button') {
    return (
      <button
        onClick={toggleTheme}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-foreground hover:bg-accent rounded-sm transition-colors"
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {isDark ? (
          <>
            <Sun className="w-4 h-4" />
            <span>Light</span>
          </>
        ) : (
          <>
            <Moon className="w-4 h-4" />
            <span>Dark</span>
          </>
        )}
      </button>
    )
  }

  return (
    <button
      onClick={toggleTheme}
      className="p-2 text-foreground hover:bg-accent rounded-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? (
        <Sun className="w-5 h-5" />
      ) : (
        <Moon className="w-5 h-5" />
      )}
    </button>
  )
}
