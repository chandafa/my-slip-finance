"use client"

import * as React from "react"
import { useTheme } from "next-themes"

import { Switch } from "@/components/ui/switch"

export function ThemeToggle() {
  const { setTheme, theme } = useTheme()

  return (
    <Switch
      id="theme-mode"
      checked={theme === 'dark'}
      onCheckedChange={(checked) => {
        setTheme(checked ? 'dark' : 'light')
      }}
    />
  )
}
