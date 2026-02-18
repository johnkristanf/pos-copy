import { format } from "date-fns"
import { PriceType } from "@/components/features/create-orders/use-create-order-store"

export function formatMilliseconds(value: number) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 3 }).format(
    value,
  )
}

export const formatCompactNumber = (value: number): string => {
  const absValue = Math.abs(value)

  if (absValue >= 1e15) {
    return `${(value / 1e15).toFixed(1)}Q`
  } else if (absValue >= 1e12) {
    return `${(value / 1e12).toFixed(1)}T`
  } else if (absValue >= 1e9) {
    return `${(value / 1e9).toFixed(1)}B`
  } else if (absValue >= 1e6) {
    return `${(value / 1e6).toFixed(1)}M`
  } else if (absValue >= 1e3) {
    return `${(value / 1e3).toFixed(1)}K`
  } else {
    return value.toString()
  }
}

export function formatCompactCurrency(value: number): string {
  if (value < 1000) {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }

  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value)
}

export function formatCurrency(value: number | string) {
  const amount = typeof value === "string" ? parseFloat(value) : value
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(amount)
}

export function formatDate(value: Date | string | null | undefined): string {
  if (!value) return "N/A"

  try {
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) {
      return "Invalid date"
    }
    return format(date, "LL/dd/yyyy")
  } catch (error) {
    return "Invalid date"
  }
}

export function formatDateTime(
  value: Date | string | null | undefined,
  removeTime: boolean = false,
): string {
  if (!value) return "N/A"

  try {
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) {
      return "Invalid date"
    }
    return format(date, removeTime ? "LL/dd/yyyy" : "LL/dd/yyyy - h:mm a")
  } catch (error) {
    return "Invalid date"
  }
}

export function formatDateLocal(
  dateString: string | null,
  options: {
    locale?: string
    year?: "numeric" | "2-digit"
    month?: "numeric" | "2-digit" | "long" | "short" | "narrow"
    day?: "numeric" | "2-digit"
  } = {},
): string {
  if (!dateString) return "Not available"

  const {
    locale = "en-US",
    year = "numeric",
    month = "long",
    day = "numeric",
  } = options

  return new Date(dateString).toLocaleDateString(locale, {
    year,
    month,
    day,
  })
}

export function formatProjectName(project: string): string {
  const decodedProject = decodeURIComponent(project).replace(/_/g, " ")

  switch (decodedProject.toLowerCase()) {
    case "usi bridgepro":
      return "USI BridgePRO"
    case "grmpi bridgepro":
      return "GRMPI BridgePRO"
    default:
      return decodedProject.replace(/\b\w/g, (char) => char.toUpperCase())
  }
}

export const truncateKey = (key: string, length = 15) => {
  return key.length > length ? `${key.substring(0, length)}...` : key
}

export function formatBytes(bytes: number, decimals = 2) {
  if (!+bytes) return "0 Bytes"

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / k ** i).toFixed(dm))} ${sizes[i]}`
}

export const permissionMap = {
  create: "c",
  read: "r",
  update: "u",
  delete: "d",
  approve: "a",
  view: "v",
} as const

export const permissionDisplay = {
  create: "Create",
  read: "Read",
  update: "Update",
  delete: "Delete",
  approve: "Approve",
  view: "View",
} as const

export const permissionColor = {
  create: "bg-blue-500 text-white",
  read: "bg-green-500 text-white",
  update: "bg-yellow-500 text-black",
  delete: "bg-red-500 text-white",
  approve: "bg-purple-500 text-white",
  view: "bg-gray-500 text-white",
} as const

export const getSelectedPriceLabel = (type: PriceType, prices: any) => {
  if (!prices) return ""
  const value = Number(prices[type]) || 0
  const labelMap = {
    unit_price: "Unit",
    wholesale_price: "Wholesale",
    credit_price: "Credit",
  }
  return `${labelMap[type]}: ${formatCompactCurrency(value)}`
}

export const formatPdfNumber = (amount: number | string | null | undefined) => {
  if (!amount || Number.isNaN(Number(amount))) return "—"
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(amount))
}
