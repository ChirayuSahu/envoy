'use client'

import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { Sun, Moon } from 'lucide-react'

export function ThemeToggleButton() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  // This useEffect ensures the component only renders on the client
  // after the initial page load, preventing a hydration mismatch.
  useEffect(() => {
    setMounted(true)
  }, [])

  // On the server or before the client has mounted, render a placeholder or nothing.
  if (!mounted) {
    // You can return a skeleton loader here if you want.
    return null 
  }

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="text-white w-full flex items-center gap-3 p-2 rounded-md text-sm xl:text-base hover:bg-white/10 transition-colors cursor-pointer"
      aria-label="Toggle theme"
    >
      {/* Now we can safely use the `theme` variable to show the correct icon */}
      {theme === 'dark' ? <Sun /> : <Moon />}
      <span>Toggle Theme</span>
    </button>
  )
}