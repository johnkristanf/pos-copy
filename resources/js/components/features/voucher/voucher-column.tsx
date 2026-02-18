import {
  Calendar,
  Gift,
  Hash,
  Settings,
  ShieldCheck,
  Tag,
  Tickets,
  TrendingUp,
} from "lucide-react"
import { Badge } from "@/components/ui/common/badge"
import { DataTableColumn } from "@/components/ui/data-table"
import { formatCurrency, formatDateTime } from "@/lib/format"
import { User, Voucher } from "@/types"
import {
  formatVoucherValue,
  getVoucherTypeColor,
  getVoucherTypeIcon,
} from "./get-voucher-utility-style"
import { VoucherAction } from "./voucher-action"

export const getVoucherColumn = (
  onActionStart?: (id: number | null) => void,
  user?: User,
  hasActionPermission: boolean = true,
): DataTableColumn<Voucher>[] => {
  const columns: DataTableColumn<Voucher>[] = [
    {
      key: "code",
      header: (
        <div className="ml-5 flex items-center gap-2">
          <Hash className="size-3" />
          <span>Voucher Code</span>
        </div>
      ),
      mobileLabel: "Code",
      cell: (voucher) => (
        <div className="ml-5 flex flex-wrap gap-1.5">
          <Badge variant="outline" className="gap-1.5 font-mono font-normal">
            <Tickets className="size-3" />
            <span className="uppercase">{voucher.code}</span>
          </Badge>
        </div>
      ),
    },
    {
      key: "description",
      header: (
        <div className="flex items-center gap-2">
          <Tag className="size-3" />
          <span>Description</span>
        </div>
      ),
      mobileLabel: "Description",
      cell: (voucher) => (
        <div className="flex flex-wrap gap-1.5">
          <span className="capitalize">{voucher.description}</span>
        </div>
      ),
    },
    {
      key: "type",
      header: (
        <div className="flex items-center gap-2">
          <Tag className="size-3" />
          <span>Type</span>
        </div>
      ),
      mobileLabel: "Voucher Type",
      cell: (voucher) => (
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="outline" className="gap-1.5 font-normal">
            {getVoucherTypeIcon(voucher.type)}
            <span className="capitalize">{voucher.type}</span>
          </Badge>
        </div>
      ),
    },
    {
      key: "amount",
      header: (
        <div className="flex items-center gap-2">
          <Gift className="size-3" />
          <span>Voucher</span>
        </div>
      ),
      mobileLabel: "Amount",
      cell: (voucher) => (
        <div className="flex items-center gap-1.5">
          <span className={`font-medium ${getVoucherTypeColor(voucher.type)}`}>
            {formatVoucherValue(voucher.amount, voucher.type)}
          </span>
        </div>
      ),
    },
    {
      key: "min-spend",
      header: (
        <div className="flex items-center gap-2">
          <TrendingUp className="size-3" />
          <span>Min Spend</span>
        </div>
      ),
      mobileLabel: "Min Spend",
      className: "hidden lg:table-cell",
      cell: (voucher) => (
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          {formatCurrency(voucher.min_spend ? voucher.min_spend : "—")}
        </div>
      ),
    },
    {
      key: "capped-amount",
      header: (
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-3" />
          <span>Capped At</span>
        </div>
      ),
      mobileLabel: "Capped At",
      className: "hidden lg:table-cell",
      cell: (voucher) => (
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          {formatCurrency(voucher.capped_amount ? voucher.capped_amount : "—")}
        </div>
      ),
    },
    {
      key: "created-at",
      header: (
        <div className="flex items-center gap-2">
          <Calendar className="size-3" />
          <span>Created At</span>
        </div>
      ),
      mobileLabel: "Created At",
      className: "hidden xl:table-cell",
      cell: (voucher) => (
        <div className="text-sm text-muted-foreground">
          {voucher.created_at ? formatDateTime(voucher.created_at, true) : "—"}
        </div>
      ),
    },
  ]

  if (hasActionPermission) {
    columns.push({
      key: "action",
      header: (
        <div className="mr-5 flex items-center justify-center gap-2">
          <Settings className="size-3" />
          <span>Actions</span>
        </div>
      ),
      className: "w-[100px] text-center",
      showInMobileCard: false,
      cell: (voucher) => (
        <div className="flex justify-center mr-5">
          <VoucherAction
            voucher={voucher}
            onActionStart={onActionStart}
            user={user}
          />
        </div>
      ),
    })
  }

  return columns
}
