import { Banknote, CreditCard, PhilippinePeso, Wallet } from "lucide-react"
import { PaymentMethod } from "@/types"

export const getPaymentMethodIcon = (methodName: string) => {
  const nameLower = methodName.toLowerCase()

  // Cash
  if (
    nameLower.includes("cash") ||
    nameLower.includes("money") ||
    nameLower.includes("banknote") ||
    nameLower.includes("bill") ||
    nameLower.includes("currency")
  )
    return <Banknote className="h-3 w-3 text-neutral-700" />

  // Credit/Debit Card
  if (
    nameLower.includes("credit") ||
    nameLower.includes("debit") ||
    nameLower.includes("card") ||
    nameLower.includes("visa") ||
    nameLower.includes("mastercard") ||
    nameLower.includes("amex")
  )
    return <CreditCard className="h-3 w-3 text-neutral-700" />

  // E-Wallet/Digital Wallet
  if (
    nameLower.includes("wallet") ||
    nameLower.includes("e-wallet") ||
    nameLower.includes("ewallet") ||
    nameLower.includes("digital") ||
    nameLower.includes("paypal") ||
    nameLower.includes("gcash") ||
    nameLower.includes("paymaya") ||
    nameLower.includes("grabpay") ||
    nameLower.includes("alipay") ||
    nameLower.includes("wechat") ||
    nameLower.includes("venmo") ||
    nameLower.includes("mobile payment") ||
    nameLower.includes("qr")
  )
    return <Wallet className="h-3 w-3 text-neutral-700" />

  // Bank Transfer
  if (
    nameLower.includes("bank") ||
    nameLower.includes("transfer") ||
    nameLower.includes("wire") ||
    nameLower.includes("ach")
  )
    return <PhilippinePeso className="h-3 w-3 text-neutral-700" />

  // Default
  return <PhilippinePeso className="h-3 w-3 text-neutral-700" />
}

export const getPaymentMethodIconById = (
  methodId: number,
  methods: PaymentMethod[],
) => {
  const method = methods.find((m) => m.id === methodId)
  if (!method) return <PhilippinePeso className="h-3 w-3 text-neutral-700" />
  return getPaymentMethodIcon(method.name)
}

export const getPaymentMethodName = (
  methodId: number,
  methods: PaymentMethod[],
): string => {
  const method = methods.find((m) => m.id === methodId)
  return method?.name ?? "Unknown Method"
}

export const getPaymentMethodCode = (
  methodId: number,
  methods: PaymentMethod[],
): string => {
  const method = methods.find((m) => m.id === methodId)
  return method?.tag ?? method?.name ?? "?"
}
