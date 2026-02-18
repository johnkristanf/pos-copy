import { Banknote, CreditCard, Smartphone, Wallet } from "lucide-react"
import { match } from "ts-pattern"

export const getPaymentMethodIcon = (tag: string | undefined) => {
  return match(tag)
    .with("cash", () => Banknote)
    .with("e_wallet", "gcash", "paymaya", () => Smartphone)
    .with("credit", () => Wallet)
    .otherwise(() => CreditCard)
}
