import {
  Building2,
  Clock,
  Folder,
  Package,
  Paintbrush,
  Ruler,
  ShoppingCart,
  Tag,
  Truck,
} from "lucide-react"
import { Badge } from "@/components/ui/common/badge"
import { getCategoryIconById } from "@/components/ui/common/get-category-icon"
import { ItemDescriptionCell } from "@/components/ui/common/item-description-cell"
import { DataTableColumn } from "@/components/ui/data-table"
import { SoldItem, User } from "@/types"

export const ItemSoldColumns = (_user?: User): DataTableColumn<SoldItem>[] => [
  {
    key: "item-description",
    header: (
      <div className="ml-5 flex items-center gap-2">
        <Package className="size-3" />
        <span>Item Description</span>
      </div>
    ),
    mobileLabel: "Item Description",
    cell: (row) => <ItemDescriptionCell item={row as any} />,
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
    cell: (row) => (
      <div className="flex flex-wrap gap-1.5">
        {row.size && (
          <Badge variant="secondary" className="gap-1.5 font-normal">
            <Ruler className="size-3" />
            <span>{row.size}</span>
          </Badge>
        )}
        {row.color && (
          <Badge variant="secondary" className="gap-1.5 font-normal">
            <div
              className="size-3 rounded-full border border-gray-300"
              style={{ backgroundColor: row.color.toLowerCase() }}
            />
            <span className="capitalize">{row.color}</span>
          </Badge>
        )}
        {!row.size && !row.color && (
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
    cell: (row) => <div>{row.brand ?? "—"}</div>,
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
    cell: (row) => (
      <div className="flex flex-wrap gap-1.5">
        {row.category ? (
          <Badge variant="outline" className="gap-1.5 font-normal">
            {row.category?.id && getCategoryIconById(row.category.id, [])}
            <span className="capitalize">
              {row.category?.name ?? "Unknown"}
            </span>
          </Badge>
        ) : (
          <span className="text-sm text-muted-foreground">—</span>
        )}
      </div>
    ),
  },
  {
    key: "sold-units",
    header: (
      <div className="flex items-center justify-end gap-2 text-right">
        <ShoppingCart className="size-3" />
        <span>Sold Units</span>
      </div>
    ),
    mobileLabel: "Sold Units",
    showInMobileCard: true,
    cell: (row) => (
      <div className="font-medium text-right">
        {row.sold_units ?? 0}{" "}
        {row.conversion_units?.[0]?.purchase_uom?.name ?? "N/A"}
      </div>
    ),
  },
  {
    key: "supplier",
    header: (
      <div className="flex items-center gap-2">
        <Truck className="size-3" />
        <span>Supplier</span>
      </div>
    ),
    mobileLabel: "Supplier",
    showInMobileCard: true,
    cell: (row) => (
      <div className="flex gap-2 items-center text-sm">
        <Building2 className="size-3 text-gray-400" />
        {row.supplier?.name ?? "Unknown Supplier"}
      </div>
    ),
  },
  {
    key: "last-transaction",
    header: (
      <div className="flex items-center gap-2">
        <Clock className="size-3" />
        <span>Last Transaction</span>
      </div>
    ),
    mobileLabel: "Last Transaction",
    cell: (row) => (
      <div className="text-sm">
        {row.created_at ? (
          <span>{new Date(row.created_at).toLocaleDateString()}</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </div>
    ),
  },
]
