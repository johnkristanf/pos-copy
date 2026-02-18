import { router } from "@inertiajs/react"
import { useCallback, useState } from "react"

export function useFilters<T extends Record<string, any>>(defaultFilters: T) {
  const [filters, setFilters] = useState<T>(() => {
    if (typeof window === "undefined") return defaultFilters

    const searchParams = new URLSearchParams(window.location.search)
    const initialValues = { ...defaultFilters }

    Object.keys(defaultFilters).forEach((key) => {
      const value = searchParams.get(key)
      if (value !== null) {
        ;(initialValues as any)[key] = value
      }
    })

    return initialValues
  })

  const updateFilters = useCallback((newFilters: Partial<T>) => {
    setFilters((prev) => {
      const nextFilters = { ...prev, ...newFilters }

      const queryParams: Record<string, any> = {}

      Object.keys(nextFilters).forEach((key) => {
        const value = nextFilters[key]
        if (value && value !== "all" && value !== "") {
          queryParams[key] = value
        }
      })

      router.get(window.location.pathname, queryParams, {
        preserveState: true,
        preserveScroll: true,
        replace: true,
      })

      return nextFilters
    })
  }, [])

  const resetFilters = useCallback(() => {
    setFilters(defaultFilters)
    router.get(
      window.location.pathname,
      {},
      {
        preserveState: true,
        preserveScroll: true,
        replace: true,
      },
    )
  }, [defaultFilters])

  return {
    filters,
    setFilter: updateFilters,
    resetFilters,
  }
}
