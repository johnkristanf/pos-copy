import {
  Box,
  Building2,
  Calendar,
  Folder,
  Package,
  Palette,
  PhilippinePeso,
  Ruler,
  Settings,
  Tag,
  Truck,
} from "lucide-react"
import { Badge } from "@/components/ui/common/badge"
import { Button } from "@/components/ui/common/button"
import {
  getCategoryIconById,
  getCategoryName,
} from "@/components/ui/common/get-category-icon"
import { DataTableColumn } from "@/components/ui/data-table"
import {
  Category,
  Item,
  StockIn,
  StockLocation,
  Supplier,
  UnitOfMeasure,
} from "@/types"

const getSupplierName = (
  supplierId: number,
  suppliers: Supplier[] = [],
): string => {
  const supplier = suppliers?.find((s) => s.id === supplierId)
  return supplier?.name ?? "Unknown Supplier"
}

interface StockInColumnsProps {
  items: Item[]
  categories: Category[]
  supplier: Supplier[]
  stockLocation: StockLocation[]
  unit_of_measures: UnitOfMeasure[]
  onStockIn: (stockIn: StockIn) => void
  canStockIn?: boolean
}

export const getStockInColumns = ({
  categories = [],
  supplier = [],
  onStockIn,
  canStockIn,
}: StockInColumnsProps): DataTableColumn<StockIn>[] => {
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
      cell: (stockIn) => (
        <div className="ml-5">
          <div className="font-medium">{stockIn.item.description}</div>
          {stockIn.item.description && (
            <div className="text-sm text-muted-foreground">
              {stockIn.item.sku}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "quantity",
      header: (
        <div className="flex items-center gap-2">
          <Box className="size-3" />
          <span>Quantity</span>
        </div>
      ),
      mobileLabel: "Quantity",
      cell: (stockIn) => (
        <div className="font-medium">{stockIn.purchased_quantity}</div>
      ),
    },
    {
      key: "attributes",
      header: (
        <div className="flex items-center gap-2">
          <Palette className="size-3" />
          <span>Attributes</span>
        </div>
      ),
      mobileLabel: "Attributes",
      cell: (stockIn) => (
        <div className="flex flex-wrap gap-1.5">
          {stockIn.item.size && (
            <Badge variant="secondary" className="gap-1.5 font-normal">
              <Ruler className="size-3" />
              <span>{stockIn.item.size}</span>
            </Badge>
          )}
          {stockIn.item.color && (
            <Badge variant="secondary" className="gap-1.5 font-normal">
              <div
                className="size-3 rounded-full border border-gray-300"
                style={{ backgroundColor: stockIn.item.color }}
              />
              <span className="capitalize">{stockIn.item.color}</span>
            </Badge>
          )}
          {!stockIn.item.size && !stockIn.item.color && (
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
      cell: (stockIn) => <div>{stockIn.item.brand}</div>,
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
      cell: (stockIn) => (
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="outline" className="gap-1.5 font-normal">
            {getCategoryIconById(stockIn.item.category?.id ?? 0, categories)}
            <span className="capitalize">
              {getCategoryName(stockIn.item.category?.id ?? 0, categories)}
            </span>
          </Badge>
        </div>
      ),
    },
    {
      key: "supplier",
      header: (
        <div className="flex items-center gap-2">
          <Building2 className="size-3" />
          <span>Supplier</span>
        </div>
      ),
      mobileLabel: "Supplier",
      showInMobileCard: true,
      cell: (stockIn) => (
        <div>
          <div className="flex gap-2 items-center">
            <Truck className="size-3 text-gray-400" />
            {getSupplierName(stockIn.item.supplier?.id ?? 0, supplier)}
          </div>
        </div>
      ),
    },
    {
      key: "received_in_pro",
      header: (
        <div className="flex items-center gap-2">
          <Calendar className="size-3" />
          <span>Received in PRO</span>
        </div>
      ),
      mobileLabel: "Received in PRO",
      showInMobileCard: true,
      cell: (stockIn) => (
        <div className="font-medium">{stockIn.purchased.received_at}</div>
      ),
    },
    {
      key: "unit_price",
      header: (
        <div className="flex items-center justify-center gap-2 text-center">
          <PhilippinePeso className="size-3" />
          <span>Unit Price</span>
        </div>
      ),
      mobileLabel: "Unit Price",
      showInMobileCard: true,
      cell: (stockIn) => (
        <div className="font-medium">
          ₱{stockIn.unit_price?.toLocaleString() ?? "0.00"}
        </div>
      ),
    },
    {
      key: "action",
      mobileLabel: "Action",
      header: (
        <div className="flex items-center gap-2">
          <Settings className="size-3" />
          <span>Actions</span>
        </div>
      ),
      className: "w-[100px] text-center",
      showInMobileCard: false,
      cell: (stockIn) =>
        canStockIn ? (
          <Button onClick={() => onStockIn(stockIn)} variant={"bridge_digital"}>
            Stock In
          </Button>
        ) : null,
    },
  ]
}
