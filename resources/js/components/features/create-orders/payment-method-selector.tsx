import { AnimatePresence, motion } from "framer-motion"
import { AlertCircle, Banknote, CreditCard, Wallet } from "lucide-react"
import { match, P } from "ts-pattern"
import { cn } from "@/lib/cn"
import { PaymentMethod } from "@/types"
import {
  useDraftOrderActions,
  useDraftOrderState,
} from "./use-draft-order-store"

interface PaymentMethodSelectorProps {
  paymentMethods: PaymentMethod[]
  hasError?: boolean
}

export const PaymentMethodSelector = ({
  paymentMethods,
  hasError,
}: PaymentMethodSelectorProps) => {
  const { paymentMethod } = useDraftOrderState()
  const { setPaymentMethod } = useDraftOrderActions()

  const getPaymentIcon = (tag: string) => {
    const normalizedTag = tag.toLowerCase().replace("-", "_")

    return match(normalizedTag)
      .with(P.string.includes("cash"), () => "₱")
      .with(
        P.union(
          P.string.includes("e_wallet"),
          P.string.includes("gcash"),
          P.string.includes("maya"),
        ),
        () => Wallet,
      )
      .with(
        P.union(P.string.includes("credit"), P.string.includes("card")),
        () => CreditCard,
      )
      .with(
        P.union(P.string.includes("bank"), P.string.includes("transfer")),
        () => Banknote,
      )
      .otherwise(() => CreditCard)
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Payment Method
        </span>
        {hasError && (
          <motion.span
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-[10px] text-destructive font-medium flex items-center gap-1"
          >
            <AlertCircle className="w-3 h-3" /> Required
          </motion.span>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <AnimatePresence mode="popLayout">
          {paymentMethods.map((pm) => {
            const isSelected = paymentMethod?.id === pm.id
            const Icon = getPaymentIcon(pm.tag || "Unknown")

            return (
              <motion.button
                layout
                key={pm.id}
                onClick={() => setPaymentMethod(isSelected ? null : pm)}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="group relative w-full text-left outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-xl"
              >
                <div
                  className={cn(
                    "absolute -inset-px rounded-xl bg-linear-to-r from-[#349083] to-[#e3ea4e] opacity-0 transition-opacity duration-300",
                    !isSelected && "group-hover:opacity-100",
                  )}
                  aria-hidden="true"
                />

                <div
                  className={cn(
                    "relative flex w-full items-start gap-4 rounded-xl p-3 transition-colors h-full",
                    isSelected
                      ? "border-transparent bg-linear-to-r from-[#349083] to-[#e3ea4e] shadow-md text-white"
                      : "border border-border/60 bg-card group-hover:border-transparent",
                    hasError &&
                      !paymentMethod &&
                      "border-destructive/30 bg-destructive/5",
                  )}
                >
                  <div
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border shadow-sm transition-colors",
                      isSelected
                        ? "border-white/20 bg-white/20 text-white"
                        : "border-border bg-background text-muted-foreground group-hover:text-foreground",
                    )}
                  >
                    {typeof Icon === "string" ? (
                      <span className="text-lg font-bold leading-none">
                        {Icon}
                      </span>
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </div>

                  <div className="flex flex-col gap-1 min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span
                        className={cn(
                          "text-sm font-semibold transition-colors",
                          isSelected ? "text-white" : "text-foreground",
                        )}
                      >
                        {pm.name}
                      </span>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="h-2 w-2 rounded-full bg-white"
                        />
                      )}
                    </div>
                    <span
                      className={cn(
                        "text-xs leading-relaxed line-clamp-2",
                        isSelected ? "text-white/90" : "text-muted-foreground",
                      )}
                      title={pm.description || pm.name}
                    >
                      {pm.description || pm.name}
                    </span>
                  </div>
                </div>
              </motion.button>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}
