// resources/js/components/features/active-orders/active-orders-columns.tsx

import {
  Calendar,
  CreditCard,
  Hash,
  Package,
  PhilippinePeso,
  Settings,
  User as UserImage,
} from "lucide-react"
import { match } from "ts-pattern"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/common/avatar"
import { Checkbox } from "@/components/ui/common/checkbox"
import { Kbd } from "@/components/ui/common/kbd"
import { PurchasedItemsDetails } from "@/components/ui/common/purchased-items-details"
import { StatusDot } from "@/components/ui/common/status-dot"
import { DataTableColumn } from "@/components/ui/data-table"
import { cn } from "@/lib/cn"
import { formatCurrency, formatDateTime } from "@/lib/format"
import { getPaymentMethodIcon } from "@/lib/get-payment-method-icon"
import { getStatusTheme } from "@/lib/get-payment-status-theme"
import { Order } from "@/types"

import { ActiveOrdersActions } from "./active-orders-actions"

export const getActiveOrdersColumns = (
  selectedId: number | null,
  onSelect: (order: Order) => void,
  isSales: boolean = false,
  showActions: boolean = false,
): DataTableColumn<Order>[] => {
  const commonColumns: DataTableColumn<Order>[] = [
    ...(!isSales
      ? [
          {
            key: "select",
            header: "",
            sortable: false,
            className: "w-[40px]",
            cell: (order) => (
              <div className="flex items-center justify-center">
                <Checkbox
                  checked={selectedId === order.id}
                  onCheckedChange={() => onSelect(order)}
                  aria-label="Select order"
                  className="h-4 w-4 rounded border-neutral-300 data-[state=checked]:bg-black data-[state=checked]:border-black"
                />
              </div>
            ),
          } as DataTableColumn<Order>,
        ]
      : []),
    {
      key: "id",
      header: (
        <div className="ml-2 flex items-center gap-2">
          <Hash className="size-3 text-neutral-400" />
          <span>ID</span>
        </div>
      ),
      mobileLabel: "ID",
      sortable: false,
      cell: (order) => (
        <span className="ml-2 font-mono text-[13px] font-medium text-neutral-400 hover:text-black transition-colors">
          #{order.id}
        </span>
      ),
    },
    {
      key: "customer",
      header: (
        <div className="flex items-center gap-2">
          <UserImage className="size-3 text-neutral-400" />
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
              <AvatarFallback className="text-[10px] font-bold bg-muted text-muted-foreground">
                {initials || "UN"}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-[13px] font-semibold text-neutral-900 leading-tight">
                {customer?.name || "Unknown"}
              </span>
              <span className="text-[10px] font-medium font-mono text-neutral-400 uppercase">
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
          <PhilippinePeso className="size-2.5" />
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
                <Kbd className="h-fit min-h-0 rounded bg-neutral-100 px-1 py-0.5 text-[10px] font-medium text-neutral-500">
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
      key: "payment_details",
      header: (
        <div className="flex items-center gap-2">
          <CreditCard className="size-3 text-neutral-400" />
          <span>Payment</span>
        </div>
      ),
      mobileLabel: "Payment",
      cell: (order) => {
        const tag = order.payment_method?.tag
        const theme = getStatusTheme(order.payment_status)
        const MethodIcon = getPaymentMethodIcon(tag)

        return (
          <div className="flex flex-col items-start gap-1.5 py-1">
            <div className="flex items-center gap-2 rounded-full border border-neutral-100 bg-neutral-50/50 px-1.5 py-0.5">
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
            <div className="flex items-center gap-1.5 px-1">
              <MethodIcon className="h-3 w-3 text-neutral-400" />
              <span className="text-[11px] font-medium text-neutral-500">
                {order.payment_method?.name || "—"}
              </span>
            </div>
          </div>
        )
      },
    },
  ]

  return match(isSales).otherwise(() => [
    ...commonColumns,
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
    } as DataTableColumn<Order>,
    ...(showActions
      ? [
          {
            key: "action",
            header: (
              <div className="flex items-center justify-center gap-2">
                <Settings className="size-3" />
                <span>Actions</span>
              </div>
            ),
            className: "w-[100px] text-center",
            showInMobileCard: false,
            cell: (order) => (
              <div className="flex justify-center">
                <ActiveOrdersActions order={order} />
              </div>
            ),
          } as DataTableColumn<Order>,
        ]
      : []),
  ])
}
