'use client'

import { Show, SignInButton, UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import { useState } from 'react'
import { Menu, X, Calendar, Users, Trophy, Target, Medal } from 'lucide-react'
import { ThemeToggle } from '../components/theme-toggle'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <>
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between bg-background/90 backdrop-blur-md border-b border-border">
        <Link href="/" className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 bg-primary rounded-sm flex items-center justify-center font-black text-sm tracking-tighter flex-shrink-0">
            FL
          </div>
          <span className="font-black text-base sm:text-lg tracking-tighter hidden sm:block">FIGHTLENS</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-medium tracking-wide">
          <Link href="/events" className="text-muted-foreground hover:text-foreground transition-colors px-2 py-1">EVENTS</Link>
          <Link href="/fighters" className="text-muted-foreground hover:text-foreground transition-colors px-2 py-1">FIGHTERS</Link>
          <Link href="/rankings" className="text-muted-foreground hover:text-foreground transition-colors px-2 py-1">RANKINGS</Link>
          <Link href="/predictions" className="text-muted-foreground hover:text-foreground transition-colors px-2 py-1">PREDICTIONS</Link>
          <Link href="/leaderboard" className="text-muted-foreground hover:text-foreground transition-colors px-2 py-1">LEADERBOARD</Link>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 -mr-2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Theme Toggle - Desktop */}
          <div className="hidden sm:block">
            <ThemeToggle />
          </div>

          <div className="hidden sm:flex items-center gap-4">
            <Show when="signed-out">
              <SignInButton mode="modal">
                <button className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors px-3 py-2">
                  Sign In
                </button>
              </SignInButton>
            </Show>
            <Show when="signed-in">
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: 'w-8 h-8 sm:w-9 sm:h-9',
                  },
                }}
              />
            </Show>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          {/* Menu Panel */}
          <div className="absolute top-[72px] left-0 right-0 bg-card border-b border-border p-4 shadow-2xl">
            <div className="flex flex-col gap-1">
              <Link
                href="/events"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-4 text-foreground hover:bg-accent rounded-sm transition-colors"
              >
                <Calendar className="w-5 h-5 text-primary" />
                <span className="font-medium">Events</span>
              </Link>
              <Link
                href="/fighters"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-4 text-foreground hover:bg-accent rounded-sm transition-colors"
              >
                <Users className="w-5 h-5 text-primary" />
                <span className="font-medium">Fighters</span>
              </Link>
              <Link
                href="/rankings"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-4 text-foreground hover:bg-accent rounded-sm transition-colors"
              >
                <Medal className="w-5 h-5 text-primary" />
                <span className="font-medium">Rankings</span>
              </Link>
              <Link
                href="/predictions"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-4 text-foreground hover:bg-accent rounded-sm transition-colors"
              >
                <Target className="w-5 h-5 text-primary" />
                <span className="font-medium">Predictions</span>
              </Link>
              <Link
                href="/leaderboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-4 text-foreground hover:bg-accent rounded-sm transition-colors"
              >
                <Trophy className="w-5 h-5 text-primary" />
                <span className="font-medium">Leaderboard</span>
              </Link>
            </div>

            {/* Mobile Theme Toggle */}
            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-foreground font-medium">Theme</span>
                <ThemeToggle variant="button" />
              </div>
            </div>

            {/* Mobile Auth Section */}
            <div className="mt-4 pt-4 border-t border-border">
              <Show when="signed-out">
                <SignInButton mode="modal">
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-primary-foreground px-4 py-4 font-bold tracking-wide transition-colors rounded-sm"
                  >
                    Sign In
                  </button>
                </SignInButton>
              </Show>
              <Show when="signed-in">
                <div className="flex items-center justify-center gap-3 px-4 py-3">
                  <UserButton
                    appearance={{
                      elements: {
                        avatarBox: 'w-10 h-10',
                      },
                    }}
                  />
                  <span className="text-muted-foreground">Your Account</span>
                </div>
              </Show>
            </div>
          </div>
        </div>
      )}

      {/* Main content with padding for fixed nav */}
      <main className="pt-[72px]">{children}</main>
    </>
  )
}
