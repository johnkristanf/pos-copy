import { Calendar, Hash, Tag } from "lucide-react"
import { Badge } from "@/components/ui/common/badge"
import { DataTableColumn } from "@/components/ui/data-table"
import { formatDateTime } from "@/lib/format"
import { PaymentMethod } from "@/types"
import { getPaymentMethodIcon } from "./get-payment-method-icon"

export const getPaymentMethodColumn = (): DataTableColumn<PaymentMethod>[] => [
  {
    key: "tag",
    header: (
      <div className="ml-5 flex items-center gap-2">
        <Hash className="size-3" />
        <span>Tag</span>
      </div>
    ),
    mobileLabel: "Tag",
    cell: (payMeth) => (
      <div className="flex flex-wrap gap-1.5 ml-5">
        <Badge variant="outline" className="gap-1.5 font-normal">
          {getPaymentMethodIcon(payMeth.name)}
          <span className="capitalize">{payMeth.name}</span>
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
    mobileLabel: "Name",
    cell: (payMeth) => (
      <div className="flex flex-wrap gap-1.5 text-neutral-800">
        <span className="">{payMeth.description}</span>
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
    cell: (payMeth) => (
      <div className="text-sm text-muted-foreground">
        {payMeth.created_at ? formatDateTime(payMeth.created_at, true) : "—"}
      </div>
    ),
  },
]
