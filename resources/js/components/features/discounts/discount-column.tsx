import {
  Calendar,
  Package,
  Percent,
  PhilippinePeso,
  Receipt,
  Settings,
  ShieldCheck,
  Tag,
  TicketPercent,
  TrendingUp,
} from "lucide-react"
import { Badge } from "@/components/ui/common/badge"
import { DataTableColumn } from "@/components/ui/data-table"
import { formatDateTime } from "@/lib/format"
import { Discount, User } from "@/types"
import { DiscountAction } from "./discount-action"
import {
  formatDiscountValue,
  getDiscountTypeColor,
  getDiscountTypeIcon,
} from "./get-discount-utility-style"

export const getDiscountColumn = (
  onActionStart?: (id: number | null) => void,
  user?: User,
  hasActionPermission: boolean = true,
): DataTableColumn<Discount>[] => {
  const columns: DataTableColumn<Discount>[] = [
    {
      key: "name",
      header: (
        <div className="ml-5 flex items-center gap-2">
          <Tag className="size-3" />
          <span>Name</span>
        </div>
      ),
      mobileLabel: "Name",
      cell: (dis) => (
        <div className="flex flex-wrap gap-1.5 ml-5">
          <Badge variant="outline" className="gap-1.5 font-normal">
            <TicketPercent className="size-3" />
            <span className="capitalize">{dis.name}</span>
          </Badge>
        </div>
      ),
    },
    {
      key: "description",
      header: (
        <div className="flex items-center gap-2">
          <Receipt className="size-3" />
          <span>Description</span>
        </div>
      ),
      mobileLabel: "Description",
      cell: (dis) => (
        <div className="flex flex-wrap gap-1.5">
          <span className="capitalize">
            {dis.description && dis.description.trim() !== "" ? (
              dis.description
            ) : (
              <span className="text-xs text-muted-foreground">
                No Description
              </span>
            )}
          </span>
        </div>
      ),
    },
    {
      key: "discount-type",
      header: (
        <div className="flex items-center gap-2">
          <Percent className="size-3" />
          <span>Discount Type</span>
        </div>
      ),
      mobileLabel: "Discount Type",
      cell: (dis) => (
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="outline" className="gap-1.5 font-normal">
            {getDiscountTypeIcon(dis.discount_type)}
            <span className="capitalize">{dis.discount_type}</span>
          </Badge>
        </div>
      ),
    },
    {
      key: "discount",
      header: (
        <div className="flex items-center gap-2">
          <TicketPercent className="size-3" />
          <span>Discount</span>
        </div>
      ),
      mobileLabel: "Amount",
      cell: (dis) => (
        <div className="flex items-center gap-1.5">
          <span
            className={`font-medium ${getDiscountTypeColor(dis.discount_type)}`}
          >
            {formatDiscountValue(dis.amount, dis.discount_type)}
          </span>
        </div>
      ),
    },
    {
      key: "min-quantity",
      header: (
        <div className="flex items-center gap-2">
          <Package className="size-3" />
          <span>Min Quantity</span>
        </div>
      ),
      mobileLabel: "Min Quantity",
      className: "hidden lg:table-cell",
      cell: (dis) => (
        <div className="text-sm text-muted-foreground">
          <div>{dis.min_purchase_qty ? dis.min_purchase_qty : "—"} item</div>
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
      cell: (dis) => (
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <PhilippinePeso className="size-3" />
          {dis.min_spend ? dis.min_spend : "—"}
        </div>
      ),
    },
    {
      key: "capped-amount",
      header: (
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="size-3" />
          <span>Capped At</span>
        </div>
      ),
      mobileLabel: "Capped At",
      className: "hidden lg:table-cell",
      cell: (dis) => (
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <PhilippinePeso className="size-3" />
          {dis.capped_amount ? dis.capped_amount : "—"}
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
      cell: (dis) => (
        <div className="text-sm text-muted-foreground">
          {dis.created_at ? formatDateTime(dis.created_at, true) : "—"}
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
      cell: (dis) => (
        <div className="flex justify-center mr-5">
          <DiscountAction
            discount={dis}
            onActionStart={onActionStart}
            user={user}
          />
        </div>
      ),
    })
  }

  return columns
}
