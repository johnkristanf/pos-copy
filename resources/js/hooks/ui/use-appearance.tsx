import { useCallback, useEffect, useState } from "react"

export type Appearance = "light" | "dark" | "system"

export const prefersDark = () => {
  if (typeof window === "undefined") {
    return false
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
}

const setCookie = (name: string, value: string, days = 365) => {
  if (typeof document === "undefined") {
    return
  }

  const maxAge = days * 24 * 60 * 60
  document.cookie = `${name}=${value};path=/;max-age=${maxAge};SameSite=Lax`
}

const applyTheme = (_appearance: Appearance) => {
  // Force light mode always
  const isDark = false

  document.documentElement.classList.toggle("dark", isDark)
  document.documentElement.style.colorScheme = isDark ? "dark" : "light"
}

const mediaQuery = () => {
  if (typeof window === "undefined") {
    return null
  }

  return window.matchMedia("(prefers-color-scheme: dark)")
}

const handleSystemThemeChange = () => {
  const currentAppearance = localStorage.getItem("appearance") as Appearance
  applyTheme(currentAppearance || "system")
}

export function initializeTheme() {
  // Always initialize with light mode
  applyTheme("light")

  // Remove the event listener since we're forcing light mode
  // mediaQuery()?.addEventListener("change", handleSystemThemeChange)
}

export function useAppearance() {
  const [appearance, setAppearance] = useState<Appearance>("light")

  const updateAppearance = useCallback((_mode: Appearance) => {
    // Always force light mode regardless of the requested mode
    setAppearance("light")

    // Store in localStorage for client-side persistence...
    localStorage.setItem("appearance", "light")

    // Store in cookie for SSR...
    setCookie("appearance", "light")

    applyTheme("light")
  }, [])

  useEffect(() => {
    // Always set to light mode on mount
    updateAppearance("light")

    return () =>
      mediaQuery()?.removeEventListener("change", handleSystemThemeChange)
  }, [updateAppearance])

  return { appearance, updateAppearance } as const
}
