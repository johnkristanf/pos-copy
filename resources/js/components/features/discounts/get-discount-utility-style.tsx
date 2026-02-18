import { formatCurrency } from "@/lib/format"
import { Percent, Tag, PhilippinePeso } from "lucide-react"

export type DiscountType = "percentage" | "amount"

export const getDiscountTypeIcon = (discountType: DiscountType) => {
  switch (discountType) {
    case "percentage":
      return <Percent className="h-3 w-3" />
    case "amount":
      return <PhilippinePeso className="h-3 w-3" />
    default:
      return <Tag className="h-3 w-3" />
  }
}

export const getDiscountTypeLabel = (discountType: DiscountType): string => {
  switch (discountType) {
    case "percentage":
      return "Percentage"
    case "amount":
      return "Fixed Amount"
    default:
      return "Unknown"
  }
}

export const formatDiscountValue = (
  value: number,
  type: DiscountType,
): string => {
  switch (type) {
    case "percentage":
      return `${value} %`
    case "amount":
      return formatCurrency(value)
    default:
      return String(value)
  }
}

export const getDiscountTypeColor = (discountType: DiscountType): string => {
  switch (discountType) {
    case "percentage":
      return "text-sky-500"
    case "amount":
      return "text-green-500"
    default:
      return "text-gray-700"
  }
}
