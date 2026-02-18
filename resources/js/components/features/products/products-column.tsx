import { Info, Package, PhilippinePeso, Truck } from "lucide-react"
import { Checkbox } from "@/components/ui/common/checkbox"
import { ItemDescriptionCell } from "@/components/ui/common/item-description-cell"
import { ProductDetails } from "@/components/ui/common/product-details"
import { DataTableColumn } from "@/components/ui/data-table"
import { Product } from "@/types"
import { StockCell } from "../inventory/stock-cell"
import { ProductPrices } from "./product-prices"

export const getProductColumn = (
  ignoreParams: string[] = [],
  onSelectAll?: (checked: boolean) => void,
  onSelectOne?: (item: Product, checked: boolean) => void,
  selectedIds: Set<number> = new Set(),
  isAllSelected: boolean = false,
  enableSelection: boolean = false,
): DataTableColumn<Product>[] => {
  const columns: DataTableColumn<Product>[] = []

  if (enableSelection) {
    columns.push({
      key: "select",
      header: (
        <div className="flex items-center pl-2">
          <Checkbox
            checked={isAllSelected}
            onCheckedChange={(checked) => onSelectAll?.(!!checked)}
            aria-label="Select all"
          />
        </div>
      ),
      cell: (item) => (
        <div className="flex items-center pl-2">
          <Checkbox
            checked={selectedIds.has(item.id)}
            onCheckedChange={(checked) => onSelectOne?.(item, !!checked)}
            aria-label="Select item"
          />
        </div>
      ),
    })
  }

  columns.push(
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
      key: "prices",
      header: (
        <div className="flex items-center gap-2">
          <PhilippinePeso className="size-3" />
          <span>Prices</span>
        </div>
      ),
      mobileLabel: "Prices",
      cell: (product) => <ProductPrices product={product} />,
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
  )

  const paramToColumnKeyMap: Record<string, string> = {
    category_id: "details",
    supplier_id: "supplier",
  }

  const keysToIgnore = ignoreParams.map(
    (param) => paramToColumnKeyMap[param] || param,
  )

  return columns.filter((col) => !keysToIgnore.includes(col.key))
}
