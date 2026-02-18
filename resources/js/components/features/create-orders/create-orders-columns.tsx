import { Box, GitCommit, Hash, Package, PhilippinePeso } from "lucide-react"
import { Checkbox } from "@/components/ui/common/checkbox"
import { ItemDetails } from "@/components/ui/common/item-details"
import { DataTableColumn } from "@/components/ui/data-table"
import { OrderableItem, UnitOfMeasure } from "@/types"
import {
  CreateOrderPriceCell,
  CreateOrderPriceHeader,
} from "./create-order-price"
import { CreateOrderStockCell } from "./create-order-stock-cell"
import { QuantityCell } from "./quantity-cell"
import { SubtotalCell } from "./sub-total-cell"
import { UomSelector } from "./uom-selector"
import { OrderItemError, PriceType } from "./use-create-order-store"

export const getCreateOrderColumns = (
  onSelectAll?: (checked: boolean) => void,
  onSelectOne?: (item: OrderableItem, checked: boolean) => void,
  selectedIds: Set<number> = new Set(),
  isAllSelected: boolean = false,
  unitOfMeasures: UnitOfMeasure[] = [],
  setUom?: (itemId: number, uomId: number) => void,
  selectedUoms: Record<number, number> = {},
  // setPriceType?: (itemId: number, priceType: PriceType) => void,
  selectedPriceTypes: Record<number, PriceType> = {},
  errors: Record<number, OrderItemError> = {},
  selectedItems: Record<number, OrderableItem> = {},
): DataTableColumn<OrderableItem>[] => [
  {
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
    className: "w-10 sticky left-0 z-10",
  },
  {
    key: "description",
    header: (
      <div className="flex items-center gap-1.5">
        <Package className="size-3.5" />
        <span>Items</span>
      </div>
    ),
    mobileLabel: "Item",
    cell: (item) => <ItemDetails item={item} />,
    className: "min-w-[180px] max-w-[280px]",
  },
  {
    key: "uom",
    header: (
      <div className="flex items-center justify-center gap-1.5">
        <GitCommit className="size-3.5" />
        <span>Unit</span>
      </div>
    ),
    mobileLabel: "Unit",
    cell: (item) => (
      <UomSelector
        item={item}
        unitOfMeasures={unitOfMeasures}
        isSelected={selectedIds.has(item.id)}
        onValueChange={(newId) => setUom?.(item.id, newId)}
        selectedValue={selectedUoms[item.id]}
        error={errors[item.id]?.uom}
      />
    ),
    className: "w-[110px]",
  },
  {
    key: "price",
    header: <CreateOrderPriceHeader />,
    mobileLabel: "Unit Price",
    cell: (item) => (
      <CreateOrderPriceCell
        item={item}
        selectedItems={selectedItems}
        selectedIds={selectedIds}
        selectedPriceTypes={selectedPriceTypes}
        errors={errors}
      />
    ),
    className: "w-[150px]",
  },
  {
    key: "quantity",
    header: (
      <div className="flex items-center justify-center gap-1.5 pl-3">
        <Hash className="size-3.5" />
        <span>Quantity</span>
      </div>
    ),
    mobileLabel: "Quantity",
    cell: (item) => (
      <QuantityCell item={item} error={errors[item.id]?.quantity} />
    ),
    className: "w-[90px]",
  },
  {
    key: "subtotal",
    header: (
      <div className="flex items-center justify-center gap-1.5">
        <PhilippinePeso className="size-3.5" />
        <span>Subtotal</span>
      </div>
    ),
    mobileLabel: "Subtotal",
    cell: (item) => <SubtotalCell item={item} />,
    className: "w-[100px]",
  },
  {
    key: "stock_availability",
    header: (
      <div className="flex items-center justify-center gap-1.5">
        <Box className="size-3.5" />
        <span>Stock</span>
      </div>
    ),
    mobileLabel: "Stock",
    cell: (item) => (
      <CreateOrderStockCell
        item={item as any}
        selectedUomId={selectedUoms[item.id]}
      />
    ),
    className: "w-[140px]",
  },
]
