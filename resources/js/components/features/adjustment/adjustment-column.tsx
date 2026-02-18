import {
  ArrowDownCircle,
  ArrowUpCircle,
  Folder,
  Hash,
  MapPin,
  Package,
  Paintbrush,
  Settings,
  Tag,
} from "lucide-react"
import { Badge } from "@/components/ui/common/badge"
import { getCategoryIcon } from "@/components/ui/common/get-category-icon"
import { getLocationIcon } from "@/components/ui/common/get-stock-location-icon"
import { ItemDescriptionCell } from "@/components/ui/common/item-description-cell"
import { DataTableColumn } from "@/components/ui/data-table"
import { StockAdjustment, User } from "@/types"
import { AdjustmentActions } from "./adjustment-actions"

const formatStatus = (status: string) => {
  switch (status) {
    case "for_approval":
      return "For Approval"
    case "for_checking":
      return "For Checking"
    case "rejected":
      return "Rejected"
    case "approved":
      return "Approved"
    default:
      return status
  }
}

export const getAdjustmentColumns = (
  user?: User,
  status?: string,
): DataTableColumn<StockAdjustment>[] => [
  {
    key: "item-description",
    header: (
      <div className="ml-5 flex items-center gap-2">
        <Package className="size-3" />
        <span>Item Description</span>
      </div>
    ),
    mobileLabel: "Item Description",
    cell: (adjustment) => <ItemDescriptionCell item={adjustment.item} />,
  },
  {
    key: "attributes",
    header: (
      <div className="flex items-center gap-2">
        <Paintbrush className="size-3" />
        <span>Attributes</span>
      </div>
    ),
    mobileLabel: "Attributes",
    cell: (adjustment) => (
      <div className="flex flex-wrap gap-1.5">
        {adjustment.item.size && (
          <Badge variant="secondary" className="gap-1.5 font-normal">
            <span>{adjustment.item.size}</span>
          </Badge>
        )}
        {adjustment.item.color && (
          <Badge variant="secondary" className="gap-1.5 font-normal">
            <div
              className="size-3 rounded-full border border-gray-300"
              style={{ backgroundColor: adjustment.item.color }}
            />
            <span className="capitalize">{adjustment.item.color}</span>
          </Badge>
        )}
        {!adjustment.item.size && !adjustment.item.color && (
          <span className="text-sm text-muted-foreground">—</span>
        )}
      </div>
    ),
  },
  {
    key: "brand",
    header: (
      <div className="flex items-center gap-2">
        <Tag className="size-3" />
        <span>Brand</span>
      </div>
    ),
    mobileLabel: "Brand",
    cell: (adjustment) => <span>{adjustment.item.brand ?? "—"}</span>,
  },
  {
    key: "category",
    header: (
      <div className="flex items-center gap-2">
        <Folder className="size-3" />
        <span>Category</span>
      </div>
    ),
    mobileLabel: "Category",
    cell: (adjustment) => (
      <div className="flex flex-wrap gap-1.5">
        <Badge variant="outline" className="gap-1.5 font-normal">
          {getCategoryIcon(adjustment.item?.category?.name || "")}
          <span className="capitalize">
            {adjustment.item?.category?.name || ""}
          </span>
        </Badge>
      </div>
    ),
  },
  {
    key: "adjustment-action",
    header: (
      <div className="flex items-center gap-2">
        <span>Adjustment</span>
      </div>
    ),
    mobileLabel: "Adjustment",
    showInMobileCard: true,
    cell: (adjustment) => (
      <div className="flex items-center gap-2">
        {adjustment.action === "increase" ? (
          <>
            <ArrowUpCircle className="size-4 text-green-600" />
            <span className="font-medium capitalize text-green-600">
              Increase
            </span>
          </>
        ) : (
          <>
            <ArrowDownCircle className="size-4 text-red-600" />
            <span className="font-medium capitalize text-red-600">
              Decrease
            </span>
          </>
        )}
      </div>
    ),
  },
  {
    key: "quantity",
    header: (
      <div className="flex items-center justify-end gap-2 text-right">
        <Hash className="size-3" />
        <span>Qty</span>
      </div>
    ),
    mobileLabel: "Quantity",
    showInMobileCard: true,
    cell: (adjustment) => (
      <div className="font-medium">
        {adjustment.quantity}{" "}
        {adjustment.item.conversion_units?.[0]?.purchase_uom?.name ?? "N/A"}
      </div>
    ),
  },
  {
    key: "location",
    header: (
      <div className="flex items-center gap-2">
        <MapPin className="size-3" />
        <span>Location</span>
      </div>
    ),
    mobileLabel: "Location",
    showInMobileCard: true,
    cell: (adjustment) => (
      <div className="flex items-center gap-2 font-medium">
        {getLocationIcon(adjustment.stock_location?.name || "")}
        {adjustment.stock_location?.name ?? "—"}
      </div>
    ),
  },
  {
    key: "status",
    header: (
      <div className="flex items-center gap-2">
        <span>Status</span>
      </div>
    ),
    mobileLabel: "Status",
    showInMobileCard: true,
    cell: (adjustment) => (
      <Badge
        variant={adjustment.status === "pending" ? "secondary" : "default"}
        className="capitalize"
      >
        {formatStatus(adjustment.status)}
      </Badge>
    ),
  },
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
    cell: (adjustment) => (
      <div className="flex justify-center">
        <AdjustmentActions
          stockAdjustment={adjustment}
          user={user}
          status={status}
        />
      </div>
    ),
  },
]
