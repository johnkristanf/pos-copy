import { formatCurrency } from "@/lib/format"
import { Percent, Tag, PhilippinePeso, Banknote, Gift } from "lucide-react"

export type VoucherType =
  | "percentage"
  | "amount"
  | "to_cash_price"
  | "complimentary"

export const getVoucherTypeIcon = (voucherType: VoucherType) => {
  switch (voucherType) {
    case "percentage":
      return <Percent className="h-3 w-3" />
    case "amount":
      return <PhilippinePeso className="h-3 w-3" />
    case "to_cash_price":
      return <Banknote className="h-3 w-3" />
    case "complimentary":
      return <Gift className="h-3 w-3" />
    default:
      return <Tag className="h-3 w-3" />
  }
}

export const getVoucherTypeLabel = (voucherType: VoucherType): string => {
  switch (voucherType) {
    case "percentage":
      return "Percentage"
    case "amount":
      return "Fixed Amount"
    case "to_cash_price":
      return "To Cash Price"
    case "complimentary":
      return "Complimentary"
    default:
      return "Unknown"
  }
}

export const formatVoucherValue = (
  value: number,
  type: VoucherType,
): string => {
  switch (type) {
    case "percentage":
      return `${value} %`
    case "amount":
      return formatCurrency(value)
    case "to_cash_price":
      return "To Cash Price"
    case "complimentary":
      return `100 %`
    default:
      return String(value)
  }
}

export const getVoucherTypeColor = (voucherType: VoucherType): string => {
  switch (voucherType) {
    case "percentage":
      return "text-sky-500"
    case "amount":
    case "complimentary":
      return "text-green-500"
    default:
      return "text-gray-700"
  }
}
