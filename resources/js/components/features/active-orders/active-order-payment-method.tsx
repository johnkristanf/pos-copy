import { AlertCircle, CheckCircle, Loader2, Printer } from "lucide-react"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import { Badge } from "@/components/ui/common/badge"
import { Button } from "@/components/ui/common/button"
import { Input } from "@/components/ui/inputs/input"
import { useDynamicDialog } from "@/hooks/ui/use-dynamic-dialog"
import { cn } from "@/lib/cn"
import { formatCurrency } from "@/lib/format"
import { Order, User } from "@/types"
import { CreditLimitOverrideForm } from "./credit-limit-override-form"
import { SalesInvoicePrint } from "./sales-invoice-print"
import { useActiveOrderVoucherStore } from "./use-active-order-voucher"
import { useProcessOrderReceiptStore } from "./use-process-order-receipt-store"

interface ActiveOrderPaymentMethodProps {
  selectedOrder: Order | null
  user?: User
  totalPayable: number
  isVatEnabled: boolean
}

const getPaymentMethodBadge = (tag: string | undefined) => {
  switch (tag?.toLowerCase()) {
    case "cash":
      return "success"
    case "credit":
      return "info"
    case "e_wallet":
      return "purple"
    default:
      return "secondary"
  }
}

export const ActiveOrderPaymentMethod = ({
  selectedOrder,
  user,
  totalPayable,
  isVatEnabled,
}: ActiveOrderPaymentMethodProps) => {
  const { openDialog, openConfirmation, closeDialog } = useDynamicDialog()
  const { processPayment, isProcessing } = useProcessOrderReceiptStore()
  const activeOrderVoucherStore = useActiveOrderVoucherStore()

  const [cashReceived, setCashReceived] = useState<string>("")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (selectedOrder) {
      setCashReceived("")
      setError(null)
    }
  }, [selectedOrder])

  if (!selectedOrder) return null

  const tagName = selectedOrder.payment_method?.tag
  const isCash = tagName?.toLowerCase() === "cash"
  const isCredit = tagName?.toLowerCase() === "credit"

  const displayName =
    selectedOrder.payment_method?.name ||
    selectedOrder.payment_method_id ||
    "Unknown"

  const isFreeOrder = totalPayable <= 0
  const numericCashReceived = Number(cashReceived)
  const change =
    numericCashReceived > totalPayable ? numericCashReceived - totalPayable : 0
  const isInsufficientCash =
    isCash && numericCashReceived < totalPayable && cashReceived !== ""

  const handleCashInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCashReceived(e.target.value)
    if (error) setError(null)
  }

  const handleProcessPayment = () => {
    if (!selectedOrder) return

    if (isCash && !isFreeOrder) {
      const amount = cashReceived === "" ? 0 : Number(cashReceived)

      if (amount <= 0) {
        setError(
          "Cash received cannot be zero or empty. Please enter a valid amount.",
        )
        return
      }

      if (amount < totalPayable) {
        setError(
          `Insufficient cash. You are short by ${formatCurrency(totalPayable - amount)}.`,
        )
        return
      }
    }

    const executePayment = async (overrideCreds?: {
      email: string
      password: string
    }) => {
      setError(null)

      const payload = {
        order_id: selectedOrder.id,
        total_payable: totalPayable,
        paid_amount: isFreeOrder
          ? 0
          : isCredit
            ? totalPayable
            : Number(cashReceived),
        used_voucher: activeOrderVoucherStore.appliedVoucher?.id ?? null,
        vouchers_used:
          activeOrderVoucherStore.discountAmount > 0
            ? activeOrderVoucherStore.discountAmount
            : null,
        with_tax: isVatEnabled,
        override_email: overrideCreds?.email,
        override_password: overrideCreds?.password,
      }

      try {
        await processPayment(payload)

        setCashReceived("")
        handlePrintReceipt()
        toast.success("Payment processed successfully")
        if (overrideCreds) closeDialog()
      } catch (err: any) {
        if (err.credit_limit || err.override_credentials) {
          const message = err.credit_limit || err.override_credentials

          openDialog({
            title: "Authorization Required",
            description: "This transaction requires higher level approval.",
            children: (
              <CreditLimitOverrideForm
                errorMessage={message}
                onCancel={() => closeDialog()}
                onConfirm={(creds) => executePayment(creds)}
              />
            ),
          })
          return
        }

        const errorMessage =
          err.process_error ||
          err.error ||
          (typeof err === "string"
            ? err
            : "Failed to process payment. Please try again.")
        setError(errorMessage)
        toast.error(errorMessage)
      }
    }

    openConfirmation({
      title: "Confirm Payment",
      description: `Are you sure you want to process the payment of ${formatCurrency(totalPayable)}? This action cannot be undone.`,
      type: "warning",
      cancelText: "Cancel",
      confirmText: "Confirm",
      onConfirm: () => executePayment(),
    })
  }

  const handlePrintReceipt = () => {
    openDialog({
      title: "Sales Invoice Preview",
      description: "Review and print the sales invoice.",
      children: (
        <SalesInvoicePrint
          order={selectedOrder}
          user={user}
          isVatEnabled={isVatEnabled}
        />
      ),
    })
  }

  return (
    <div className="flex flex-col gap-4 rounded-lg border bg-card p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold">Payment Method</span>
        <Badge
          variant={getPaymentMethodBadge(tagName)}
          className="capitalize shadow-none"
        >
          {displayName}
        </Badge>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-md border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive animate-in fade-in slide-in-from-top-1">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-muted-foreground">
            Total Payable
          </span>
          <span className="text-base font-bold">
            {formatCurrency(totalPayable)}
          </span>
        </div>

        {isFreeOrder ? (
          <div className="flex items-center justify-center gap-2 rounded-md border border-emerald-500/20 bg-emerald-50 p-4 text-sm text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
            <CheckCircle className="h-4 w-4 shrink-0" />
            <span className="font-medium">This order is free</span>
          </div>
        ) : isCredit ? (
          <div className="flex items-center justify-center gap-2 rounded-md border border-sky-500/20 bg-sky-50 p-4 text-sm text-sky-700 dark:bg-sky-950/30 dark:text-sky-400">
            <CheckCircle className="h-4 w-4 shrink-0" />
            <span className="font-medium">Charge to Customer Credit</span>
          </div>
        ) : (
          <>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span
                  className={cn(
                    "text-muted-foreground",
                    isInsufficientCash && "text-destructive",
                  )}
                >
                  Cash Received
                </span>
                {isInsufficientCash && (
                  <span className="text-xs font-medium text-destructive">
                    Insufficient amount
                  </span>
                )}
              </div>
              <Input
                type="number"
                placeholder="0.00"
                className={cn(
                  "text-right font-mono transition-colors",
                  (isInsufficientCash ||
                    (error && Number(cashReceived) <= 0)) &&
                    "border-destructive focus-visible:ring-destructive/30",
                )}
                disabled={isProcessing}
                value={cashReceived}
                onChange={handleCashInput}
                min={0}
                step="0.01"
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-muted-foreground">Change</span>
              <span className="text-base font-bold text-primary">
                {formatCurrency(change)}
              </span>
            </div>
          </>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Button
          onClick={handleProcessPayment}
          disabled={isProcessing}
          className={cn(
            "w-full gap-2 transition-all",
            error && "animate-shake",
          )}
          size="lg"
          variant="bridge_digital"
        >
          {isProcessing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle className="h-4 w-4" />
          )}
          {isProcessing ? "Processing..." : "Confirm Payment"}
        </Button>

        <Button
          variant="outline"
          className="w-full gap-2"
          size="lg"
          onClick={handlePrintReceipt}
          type="button"
          disabled={isProcessing}
        >
          <Printer className="h-4 w-4" />
          Print Receipt Only
        </Button>
      </div>
    </div>
  )
}
