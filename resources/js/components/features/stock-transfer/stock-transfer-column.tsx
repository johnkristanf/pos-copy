import {
  ArrowRightFromLine,
  ArrowRightToLine,
  Hash,
  LayoutGrid,
  Package,
  Ruler,
  Tag,
  Tags,
} from "lucide-react"
import { Badge } from "@/components/ui/common/badge"
import {
  getCategoryIconById,
  getCategoryName,
} from "@/components/ui/common/get-category-icon"
import { getLocationIcon } from "@/components/ui/common/get-stock-location-icon"
import { ItemDescriptionCell } from "@/components/ui/common/item-description-cell"
import { DataTableColumn } from "@/components/ui/data-table"
import { Category, StockTransfer, User } from "@/types"

interface StockTransferColumnsProps {
  categories: Category[]
  onAction?: (transfer: StockTransfer) => void
  user: User
}

export const getStockTransferColumns = ({
  categories = [],
}: StockTransferColumnsProps): DataTableColumn<StockTransfer>[] => {
  return [
    {
      key: "item-description",
      header: (
        <div className="ml-5 flex items-center gap-2">
          <Package className="size-3" />
          <span>Item Description</span>
        </div>
      ),
      mobileLabel: "Item Description",
      cell: (transfer) => <ItemDescriptionCell item={transfer.item} />,
    },
    {
      key: "attributes",
      header: (
        <div className="flex items-center gap-2">
          <Tags className="size-3" />
          <span>Attributes</span>
        </div>
      ),
      mobileLabel: "Attributes",
      cell: (transfer) => (
        <div className="flex flex-wrap gap-1.5">
          {transfer.item.size && (
            <Badge variant="secondary" className="gap-1.5 font-normal">
              <Ruler className="size-3" />
              <span>{transfer.item.size}</span>
            </Badge>
          )}
          {transfer.item.color && (
            <Badge variant="secondary" className="gap-1.5 font-normal">
              <div
                className="size-3 rounded-full border border-gray-300"
                style={{ backgroundColor: transfer.item.color }}
              />
              <span className="capitalize">{transfer.item.color}</span>
            </Badge>
          )}
          {!transfer.item.size && !transfer.item.color && (
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
          <LayoutGrid className="size-3" />
          <span>Category</span>
        </div>
      ),
      mobileLabel: "Category",
      cell: (transfer) => (
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="outline" className="gap-1.5 font-normal">
            {getCategoryIconById(transfer.item.category_id ?? 0, categories)}
            <span className="capitalize">
              {getCategoryName(transfer.item.category_id ?? 0, categories)}
            </span>
          </Badge>
        </div>
      ),
    },
    {
      key: "quantity",
      header: (
        <div className="flex items-center gap-2">
          <Hash className="size-3" />
          <span>Quantity</span>
        </div>
      ),
      mobileLabel: "Quantity",
      cell: (transfer) => (
        <div className="font-medium">{transfer.quantity}</div>
      ),
    },
    {
      key: "source",
      header: (
        <div className="flex items-center gap-2">
          <ArrowRightFromLine className="size-3" />
          <span>Transferred From</span>
        </div>
      ),
      mobileLabel: "Transferred From",
      showInMobileCard: true,
      cell: (transfer) => (
        <div className="flex items-center gap-2 font-medium">
          {getLocationIcon(transfer.source_stock_location?.name)}
          {transfer.source_stock_location?.name ?? "—"}
        </div>
      ),
    },
    {
      key: "target",
      header: (
        <div className="flex items-center gap-2">
          <ArrowRightToLine className="size-3" />
          <span>Transferred To</span>
        </div>
      ),
      mobileLabel: "Transferred To",
      showInMobileCard: true,
      cell: (transfer) => (
        <div className="flex items-center gap-2  font-medium">
          {getLocationIcon(transfer.destination_stock_location?.name)}
          {transfer.destination_stock_location?.name ?? "—"}
        </div>
      ),
    },
  ]
}
