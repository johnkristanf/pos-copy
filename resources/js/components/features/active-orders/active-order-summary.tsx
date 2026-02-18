import { AlertCircle, Loader2, Package, X } from "lucide-react"
import { useEffect } from "react"
import { Badge } from "@/components/ui/common/badge"
import { Button } from "@/components/ui/common/button"
import { Label } from "@/components/ui/common/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/common/select"
import { Switch } from "@/components/ui/common/switch"
import { cn } from "@/lib/cn"
import { formatCurrency } from "@/lib/format"
import { Order, Voucher } from "@/types"
import { useActiveOrderVoucherStore } from "./use-active-order-voucher"
import { useApplyVoucher } from "./use-apply-voucher"
import { useGetManyActiveVouchers } from "./use-get-many-active-vouchers"

interface ActiveOrderSummaryProps {
  selectedOrder: Order | null
  onTotalPayableChange?: (totalPayable: number) => void
  isVatEnabled: boolean
  onVatChange: (enabled: boolean) => void
}

export const ActiveOrderSummary = ({
  selectedOrder,
  onTotalPayableChange,
  isVatEnabled,
  onVatChange,
}: ActiveOrderSummaryProps) => {
  const activeOrderVoucherStore = useActiveOrderVoucherStore()
  const applyVoucherMutation = useApplyVoucher()

  const { data: activeVouchersData, isLoading: isLoadingVouchers } =
    useGetManyActiveVouchers()

  useEffect(() => {
    activeOrderVoucherStore.reset()
  }, [selectedOrder?.id])

  const items = selectedOrder?.order_items || []
  let calculatedSubtotal = 0
  let totalItemDiscounts = 0

  items.forEach((orderItem) => {
    const priceStr = orderItem.item?.selling_prices?.unit_price
    const price = priceStr ? Number(priceStr) : 0
    const quantity = Number(orderItem.quantity || 0)
    const itemTotal = price * quantity

    calculatedSubtotal += itemTotal

    if (orderItem.item?.discounts && orderItem.item.discounts.length > 0) {
      orderItem.item.discounts.forEach((discount) => {
        const now = new Date()
        const startDate = discount.start_date
          ? new Date(discount.start_date)
          : null
        const endDate = discount.end_date ? new Date(discount.end_date) : null

        if (startDate && now < startDate) return
        if (endDate) {
          endDate.setHours(23, 59, 59, 999)
          if (now > endDate) return
        }

        if (discount.min_purchase_qty && quantity < discount.min_purchase_qty) {
          return
        }

        if (discount.min_spend && itemTotal < Number(discount.min_spend)) {
          return
        }

        let discountAmount = 0

        if (discount.discount_type === "amount") {
          discountAmount = Number(discount.amount)
        } else if (discount.discount_type === "percentage") {
          discountAmount = price * (Number(discount.amount) / 100)
        }

        totalItemDiscounts += discountAmount * quantity
      })
    }
  })

  const baseTotal =
    calculatedSubtotal > 0
      ? calculatedSubtotal
      : Number(selectedOrder?.total_payable || 0)

  const totalBeforeVoucherAndVat = Math.max(0, baseTotal - totalItemDiscounts)
  const vatAmount = isVatEnabled ? totalBeforeVoucherAndVat * 0.12 : 0
  const voucherDiscount = Number(activeOrderVoucherStore.discountAmount) || 0
  const totalPayableForPayload = Math.max(
    0,
    totalBeforeVoucherAndVat - voucherDiscount,
  )
  const totalPayableForDisplay = Math.max(
    0,
    totalBeforeVoucherAndVat - voucherDiscount,
  )

  useEffect(() => {
    onTotalPayableChange?.(totalPayableForPayload)
  }, [totalPayableForPayload, onTotalPayableChange])

  if (!selectedOrder) {
    return (
      <div
        className={cn(
          "group relative h-full rounded-xl transition-all duration-300 hover:shadow-lg",
        )}
      >
        <div
          className="absolute -inset-px rounded-xl bg-linear-to-r from-[#349083] to-[#e3ea4e] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          aria-hidden="true"
        />

        <div className="relative h-full flex flex-col items-center justify-center rounded-xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm p-12 z-10">
          <div className="h-14 w-14 rounded-full bg-linear-to-br from-zinc-100 to-zinc-200 dark:from-zinc-900/30 dark:to-zinc-800/30 flex items-center justify-center border border-zinc-200 dark:border-zinc-800/50 mb-4">
            <Package className="h-7 w-7 text-zinc-400 dark:text-zinc-500" />
          </div>
          <p className="font-semibold text-sm text-foreground">
            No Order Selected
          </p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            Select an order from the list to view summary
          </p>
        </div>
      </div>
    )
  }

  const handleApplyVoucher = () => {
    if (!activeOrderVoucherStore.code.trim()) {
      activeOrderVoucherStore.setError("Please enter a voucher code")
      return
    }

    applyVoucherMutation.mutate({
      code: activeOrderVoucherStore.code,
      order_amount: totalBeforeVoucherAndVat,
    })
  }

  const handleRemoveVoucher = () => {
    activeOrderVoucherStore.clearVoucher()
  }

  const isLoading = applyVoucherMutation.isPending

  return (
    <div className="flex flex-col filter">
      <div className="flex flex-col gap-4 rounded-t-lg border-x border-t bg-card p-4 pb-4">
        <div className="flex flex-row items-start justify-between">
          <div className="flex flex-col">
            <span className="font-semibold">Payment Summary</span>
            <span className="text-xs text-muted-foreground">
              Order #{selectedOrder.id} • {selectedOrder.customer?.name}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium">{formatCurrency(baseTotal)}</span>
          </div>

          {totalItemDiscounts > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Item Discounts</span>
              <span className="font-medium text-emerald-600">
                -{formatCurrency(totalItemDiscounts)}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between ">
            <Label
              htmlFor="vat-switch"
              className="text-xs font-medium text-muted-foreground"
            >
              Add VAT (12%)
            </Label>
            <Switch
              id="vat-switch"
              checked={isVatEnabled}
              onCheckedChange={onVatChange}
            />
          </div>

          {isVatEnabled && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">VAT (12%)</span>
              <span className="font-medium">{formatCurrency(vatAmount)}</span>
            </div>
          )}

          {activeOrderVoucherStore.error && (
            <div className="flex items-start gap-2 rounded-md border border-destructive/50 bg-destructive/10 p-3">
              <AlertCircle className="h-4 w-4 shrink-0 text-destructive" />
              <div className="flex flex-1 flex-col gap-1">
                <span className="text-xs font-medium text-destructive">
                  {activeOrderVoucherStore.error}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 text-destructive/70 hover:text-destructive"
                onClick={() => activeOrderVoucherStore.setError(null)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}

          <div className="mt-1 flex flex-col gap-2">
            {!activeOrderVoucherStore.appliedVoucher ? (
              <div className="flex items-center gap-2">
                <Select
                  value={activeOrderVoucherStore.code}
                  onValueChange={(value) =>
                    activeOrderVoucherStore.setCode(value)
                  }
                  disabled={
                    isLoading ||
                    isLoadingVouchers ||
                    (activeVouchersData?.data &&
                      activeVouchersData.data.length === 0)
                  }
                >
                  <SelectTrigger className="h-8 text-xs flex-1">
                    <SelectValue
                      placeholder={
                        activeVouchersData?.data &&
                        activeVouchersData.data.length === 0
                          ? "No active vouchers"
                          : "Select a voucher"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {activeVouchersData?.data &&
                    activeVouchersData.data.length > 0 ? (
                      activeVouchersData.data.map((voucher: Voucher) => (
                        <SelectItem key={voucher.id} value={voucher.code}>
                          {voucher.code}{" "}
                          {voucher.description
                            ? `- ${voucher.description}`
                            : ""}
                        </SelectItem>
                      ))
                    ) : (
                      <div className="py-4 text-center text-xs text-muted-foreground">
                        No active vouchers available
                      </div>
                    )}
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 min-w-17.5 text-xs"
                  onClick={handleApplyVoucher}
                  disabled={isLoading || !activeOrderVoucherStore.code}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="size-3 animate-spin" />
                    </>
                  ) : (
                    "Apply"
                  )}
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between rounded-md border border-emerald-200 bg-emerald-50/50 px-3 py-2.5 shadow-sm">
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold tracking-wide text-emerald-700">
                      {activeOrderVoucherStore.appliedVoucher.code}
                    </span>
                    <Badge variant={"success"}>Applied</Badge>
                  </div>
                  <span className="text-xs font-medium text-emerald-600">
                    -
                    {formatCurrency(
                      activeOrderVoucherStore.appliedVoucher.amount,
                    )}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-emerald-600/70 transition-colors hover:bg-emerald-100 hover:text-emerald-700"
                  onClick={handleRemoveVoucher}
                  title="Remove voucher"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {voucherDiscount > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Voucher Discount</span>
              <span className="font-medium text-destructive">
                -{formatCurrency(voucherDiscount)}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="flex h-5 w-full items-center">
        <div className="relative h-full w-2.5 overflow-hidden">
          <svg
            width="10"
            height="20"
            viewBox="0 0 10 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="absolute left-0 top-0 h-full w-full text-card"
          >
            <path
              d="M0 0 A 10 10 0 0 1 0 20 L 10 20 L 10 0 Z"
              fill="currentColor"
            />
            <path
              d="M0 0 A 10 10 0 0 1 0 20"
              className="stroke-border"
              strokeWidth="1"
              fill="none"
            />
            <line
              x1="10"
              y1="0"
              x2="10"
              y2="20"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
        </div>
        <div className="relative flex h-full flex-1 items-center justify-center bg-card">
          <div className="w-full border-t-2 border-dashed border-muted-foreground/20" />
        </div>
        <div className="relative h-full w-2.5 overflow-hidden">
          <svg
            width="10"
            height="20"
            viewBox="0 0 10 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="absolute right-0 top-0 h-full w-full text-card"
          >
            <path
              d="M10 0 A 10 10 0 0 0 10 20 L 0 20 L 0 0 Z"
              fill="currentColor"
            />
            <path
              d="M10 0 A 10 10 0 0 0 10 20"
              className="stroke-border"
              strokeWidth="1"
              fill="none"
            />
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="20"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
        </div>
      </div>

      <div className="flex items-center justify-between rounded-b-lg border-x border-b bg-card p-4 pt-2">
        <span className="text-base font-bold">Total Payable</span>
        <span className="text-xl font-bold text-primary">
          {formatCurrency(totalPayableForDisplay)}
        </span>
      </div>
    </div>
  )
}
