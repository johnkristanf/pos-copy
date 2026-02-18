import { Building2, Info, Package, Settings, Tag, Truck } from "lucide-react"
import { ItemDescriptionCell } from "@/components/ui/common/item-description-cell"
import { ProductDetails } from "@/components/ui/common/product-details"
import { DataTableColumn } from "@/components/ui/data-table"
import { Category, Item, Supplier, UnitOfMeasure, User } from "@/types"
import { ItemAction } from "./item-action"

const getSupplierName = (
  supplierId: number,
  suppliers: Supplier[] = [],
): string => {
  const supplier = suppliers?.find((s) => s.id === supplierId)
  return supplier?.name ?? "Unknown Supplier"
}

export const getItemListColumn = (
  categories: Category[] = [],
  suppliers: Supplier[] = [],
  unit_of_measures: UnitOfMeasure[] = [],
  items: Item[] = [],
  onActionStart?: (id: number | null) => void,
  user?: User,
  hasActionPermission: boolean = true,
): DataTableColumn<Item>[] => {
  const columns: DataTableColumn<Item>[] = [
    {
      key: "item-description",
      header: (
        <div className="ml-5 flex items-center gap-2 whitespace-nowrap">
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
        <div className="flex items-center gap-2 whitespace-nowrap">
          <Info className="size-3" />
          <span>Details</span>
        </div>
      ),
      mobileLabel: "Details",
      cell: (product) => <ProductDetails product={product} />,
    },
    {
      key: "min-quantity",
      header: (
        <div className="flex items-center gap-2 whitespace-nowrap">
          <Tag className="size-3" />
          <span>Min Qty</span>
        </div>
      ),
      mobileLabel: "Min Quantity",
      cell: (item) => (
        <div className="text-center">
          {item.min_quantity}{" "}
          {item.conversion_units?.[0]?.purchase_uom?.name ?? "N/A"}
        </div>
      ),
    },
    {
      key: "max-quantity",
      header: (
        <div className="flex items-center gap-2 whitespace-nowrap">
          <Tag className="size-3" />
          <span>Max Qty</span>
        </div>
      ),
      mobileLabel: "Max Quantity",
      cell: (item) => (
        <div className="text-center">
          {item.max_quantity}{" "}
          {item.conversion_units?.[0]?.purchase_uom?.name ?? "N/A"}
        </div>
      ),
    },
    {
      key: "supplier",
      header: (
        <div className="flex items-center gap-2 whitespace-nowrap">
          <Truck className="size-3" />
          <span>Supplier</span>
        </div>
      ),
      mobileLabel: "Supplier",
      showInMobileCard: true,
      cell: (item) => (
        <div>
          <div className="flex gap-2 items-center">
            <Building2 className="size-3 text-gray-400" />
            {getSupplierName(item.supplier_id, suppliers)}
          </div>
        </div>
      ),
    },
  ]

  if (hasActionPermission) {
    columns.push({
      key: "action",
      header: (
        <div className="flex items-center gap-2 whitespace-nowrap">
          <Settings className="size-3" />
          <span>Actions</span>
        </div>
      ),
      className: "w-[100px] text-center",
      showInMobileCard: false,
      cell: (item) => (
        <div className="flex justify-center">
          <ItemAction
            category={categories}
            supplier={suppliers}
            unit_of_measures={unit_of_measures}
            items={items}
            item={item}
            onActionStart={onActionStart}
            user={user}
          />
        </div>
      ),
    })
  }

  return columns
}
