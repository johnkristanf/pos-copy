import {
  BookCheck,
  Calendar,
  Hash,
  Package,
  PhilippinePeso,
  User,
  WalletCards,
} from "lucide-react"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/common/avatar"
import { Kbd } from "@/components/ui/common/kbd"
import { PurchasedItemsDetails } from "@/components/ui/common/purchased-items-details"
import { StatusDot } from "@/components/ui/common/status-dot"
import { DataTableColumn } from "@/components/ui/data-table"
import { cn } from "@/lib/cn"
import { formatCurrency, formatDateTime } from "@/lib/format"
import { getPaymentMethodIcon } from "@/lib/get-payment-method-icon"
import { getStatusTheme } from "@/lib/get-payment-status-theme"
import { Order } from "@/types"

export const getCancelledOrdersColumns = (): DataTableColumn<Order>[] => [
  {
    key: "id",
    header: (
      <div className="ml-5 flex items-center gap-2">
        <Hash className="size-3 text-neutral-400" />
        <span>ID</span>
      </div>
    ),
    mobileLabel: "ID",
    sortable: false,
    cell: (order) => (
      <span className="ml-5 font-mono text-[13px] font-medium text-neutral-400 transition-colors hover:text-black">
        #{order.id}
      </span>
    ),
  },
  {
    key: "customer",
    header: (
      <div className="flex items-center gap-2">
        <User className="size-3 text-neutral-400" />
        <span>Customer</span>
      </div>
    ),
    mobileLabel: "Customer",
    cell: (order) => {
      const customer = order.customer
      const initials = customer?.name
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)

      return (
        <div className="flex items-center gap-3 py-1">
          <Avatar className="h-8 w-8 border">
            <AvatarImage
              src={customer?.customer_img || ""}
              alt={customer?.name}
            />
            <AvatarFallback className="bg-muted text-[10px] font-bold text-muted-foreground">
              {initials || "UN"}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="leading-tight text-[13px] font-semibold text-neutral-900">
              {customer?.name || "Unknown"}
            </span>
            <span className="font-mono text-[10px] font-medium uppercase text-neutral-400">
              {customer?.customer_code || "NO-CODE"}
            </span>
          </div>
        </div>
      )
    },
  },
  {
    key: "items",
    header: (
      <div className="flex items-center gap-2">
        <Package className="size-3 text-neutral-400" />
        <span>Items</span>
      </div>
    ),
    mobileLabel: "Items",
    cell: (order) => {
      const items = order.order_items || []
      return items.length === 0 ? (
        <span className="text-[12px] italic text-neutral-400">No items</span>
      ) : (
        <PurchasedItemsDetails order={order} items={items} />
      )
    },
  },
  {
    key: "total_payable",
    header: (
      <div className="flex items-center justify-center gap-1 text-center">
        <PhilippinePeso className="size-3" />
        <span>Total Payable</span>
      </div>
    ),
    mobileLabel: "Total",
    cell: (order) => {
      const hasVoucher = !!order.voucher

      return (
        <div className="flex flex-col items-center justify-center gap-1">
          <div className="text-center text-[13px] font-bold text-neutral-900">
            {formatCurrency(Number(order.total_payable))}
          </div>

          {hasVoucher && (
            <div className="flex items-center gap-1.5 leading-none">
              <Kbd className="rounded bg-neutral-100 px-1 py-0.5 text-xs font-medium text-neutral-500">
                {order.voucher?.code}
              </Kbd>
              <span className="text-[10px] font-medium text-emerald-600">
                -{formatCurrency(Number(order.vouchers_used))}
              </span>
            </div>
          )}
        </div>
      )
    },
  },
  {
    key: "payment_status",
    header: (
      <div className="flex items-center gap-2">
        <BookCheck className="size-3" />
        <span>Payment Status</span>
      </div>
    ),
    mobileLabel: "Payment Status",
    cell: (order) => {
      const theme = getStatusTheme(order.payment_status)
      return (
        <div className="w-30 px-1.5 py-0.5 flex items-center gap-2">
          <StatusDot color={theme.dot} />
          <span
            className={cn(
              "text-[10px] font-bold uppercase tracking-tight",
              theme.text,
            )}
          >
            {theme.label}
          </span>
        </div>
      )
    },
  },
  {
    key: "payment_method",
    header: (
      <div className="flex items-center gap-2">
        <WalletCards className="size-3 text-neutral-400" />
        <span>Payment Method</span>
      </div>
    ),
    mobileLabel: "Method",
    cell: (order) => {
      const tag = order.payment_method?.tag
      const MethodIcon = getPaymentMethodIcon(tag)
      return (
        <div className="flex items-center gap-1.5 px-1">
          <MethodIcon className="h-3 w-3 text-neutral-400" />
          <span className="text-[11px] font-medium text-neutral-500">
            {order.payment_method?.name || "—"}
          </span>
        </div>
      )
    },
  },
  {
    key: "created_at",
    header: (
      <div className="flex items-center gap-2">
        <Calendar className="size-3 text-neutral-400" />
        <span>Created</span>
      </div>
    ),
    mobileLabel: "Date",
    cell: (order) => (
      <div className="text-[12px] font-medium text-neutral-500">
        {formatDateTime(order.created_at, true)}
      </div>
    ),
  },
]
