import { Info, Package, Truck } from "lucide-react"
import { ItemDescriptionCell } from "@/components/ui/common/item-description-cell"
import { ProductDetails } from "@/components/ui/common/product-details"
import { DataTableColumn } from "@/components/ui/data-table"
import { InventoryItem } from "@/types"
import { StockCell } from "./stock-cell"

export const getInventoryColumn = (
  ignoreParams: string[] = [],
): DataTableColumn<InventoryItem>[] => {
  const columns: DataTableColumn<InventoryItem>[] = [
    {
      key: "item-description",
      header: (
        <div className="ml-5 flex items-center gap-2">
          <Package className="size-3" />
          <span>Item Description</span>
        </div>
      ),
      mobileLabel: "Item Description",
      cell: (product) => <ItemDescriptionCell item={product as any} />,
    },
    {
      key: "details",
      header: (
        <div className="flex items-center gap-2">
          <Info className="size-3" />
          <span>Details</span>
        </div>
      ),
      mobileLabel: "Details",
      cell: (product) => <ProductDetails product={product} />,
    },
    {
      key: "stock-levels",
      header: (
        <div className="flex items-center gap-2">
          <Package className="size-3" />
          <span>Stock Levels</span>
        </div>
      ),
      mobileLabel: "Stock Levels",
      cell: (product) => <StockCell item={product} />,
      className: "w-40",
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
      cell: (product) => (
        <div className="flex gap-2 items-center">
          {product.supplier?.name ?? "Unknown Supplier"}
        </div>
      ),
    },
  ]

  const paramToColumnKeyMap: Record<string, string> = {
    category_id: "category",
    supplier_id: "supplier",
  }

  const keysToIgnore = ignoreParams.map(
    (param) => paramToColumnKeyMap[param] || param,
  )

  return columns.filter((col) => !keysToIgnore.includes(col.key))
}
