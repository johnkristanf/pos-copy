import {
  Building2,
  Folder,
  Package,
  Paintbrush,
  PhilippinePeso,
  Ruler,
  Settings,
  Tag,
  Truck,
} from "lucide-react"
import { Badge } from "@/components/ui/common/badge"
import { getCategoryIconById } from "@/components/ui/common/get-category-icon"
import { ItemDescriptionCell } from "@/components/ui/common/item-description-cell"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/common/tooltip"
import { DataTableColumn } from "@/components/ui/data-table"
import { formatCompactCurrency, formatCurrency } from "@/lib/format"
import { ItemPrice, User } from "@/types"
import { PriceAction } from "./price-action"

export const getPriceColumn = (
  onActionStart?: (id: number | null) => void,
  user?: User,
  hasActionPermission: boolean = true,
): DataTableColumn<ItemPrice>[] => {
  const columns: DataTableColumn<ItemPrice>[] = [
    {
      key: "item-description",
      header: (
        <div className="ml-5 flex items-center gap-2">
          <Package className="size-3" />
          <span>Item Description</span>
        </div>
      ),
      mobileLabel: "Item Description",
      cell: (item) => <ItemDescriptionCell item={item as any} />,
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
      cell: (item) => (
        <div className="flex flex-wrap gap-1.5">
          {item.size && (
            <Badge variant="secondary" className="gap-1.5 font-normal">
              <Ruler className="size-3" />
              <span>{item.size}</span>
            </Badge>
          )}
          {item.color && (
            <Badge variant="secondary" className="gap-1.5 font-normal">
              <div
                className="size-3 rounded-full border border-gray-300"
                style={{ backgroundColor: item.color.toLowerCase() }}
              />
              <span className="capitalize">{item.color}</span>
            </Badge>
          )}
          {!item.size && !item.color && (
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
      cell: (item) => <div>{item.brand}</div>,
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
      cell: (item) => (
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="outline" className="gap-1.5 font-normal">
            {item.category?.id && getCategoryIconById(item.category.id, [])}
            <span className="capitalize">
              {item.category?.name ?? "Unknown"}
            </span>
          </Badge>
        </div>
      ),
    },
    {
      key: "uom",
      header: (
        <div className="flex items-center gap-2">
          <Tag className="size-3" />
          <span className="whitespace-nowrap">Unit of Measure</span>
        </div>
      ),
      mobileLabel: "Unit of Measure",
      cell: (item) => (
        <div className="text-center">
          {item.conversion_units?.[0]?.purchase_uom?.name ?? "N/A"}
        </div>
      ),
    },
    {
      key: "unit-price",
      header: (
        <div className="flex items-center justify-end gap-2 text-right">
          <PhilippinePeso className="size-3" />
          <span>Unit</span>
        </div>
      ),
      mobileLabel: "Unit Price",
      showInMobileCard: true,
      cell: (item) => (
        <div className="font-medium text-left flex flex-col items-end">
          {item.selling_prices?.unit_price ? (
            <Tooltip>
              <TooltipTrigger className="cursor-help border-b border-dashed border-muted-foreground/30 hover:text-primary transition-colors">
                {formatCompactCurrency(Number(item.selling_prices.unit_price))}
              </TooltipTrigger>
              <TooltipContent side="top" className="font-medium">
                {formatCurrency(Number(item.selling_prices.unit_price))}
              </TooltipContent>
            </Tooltip>
          ) : (
            <span className="text-xs italic text-muted-foreground">
              Not Set
            </span>
          )}
        </div>
      ),
    },
    {
      key: "wholesale-price",
      header: (
        <div className="flex items-center justify-end gap-2 text-right">
          <PhilippinePeso className="size-3" />
          <span>Wholesale</span>
        </div>
      ),
      mobileLabel: "Wholesale Price",
      cell: (item) => (
        <div className="font-medium text-left flex flex-col items-end">
          {item.selling_prices?.wholesale_price ? (
            <Tooltip>
              <TooltipTrigger className="cursor-help border-b border-dashed border-muted-foreground/30 hover:text-primary transition-colors">
                {formatCompactCurrency(
                  Number(item.selling_prices.wholesale_price),
                )}
              </TooltipTrigger>
              <TooltipContent side="top" className="font-medium">
                {formatCurrency(Number(item.selling_prices.wholesale_price))}
              </TooltipContent>
            </Tooltip>
          ) : (
            <span className="text-xs italic text-muted-foreground">
              Not Set
            </span>
          )}
        </div>
      ),
    },
    {
      key: "credit-price",
      header: (
        <div className="flex items-center justify-end gap-2 text-right">
          <PhilippinePeso className="size-3" />
          <span>Credit</span>
        </div>
      ),
      mobileLabel: "Credit Price",
      cell: (item) => (
        <div className="font-medium text-left flex flex-col items-end mr-4">
          {item.selling_prices?.credit_price ? (
            <Tooltip>
              <TooltipTrigger className="cursor-help border-b border-dashed border-muted-foreground/30 hover:text-primary transition-colors">
                {formatCompactCurrency(
                  Number(item.selling_prices.credit_price),
                )}
              </TooltipTrigger>
              <TooltipContent side="top" className="font-medium">
                {formatCurrency(Number(item.selling_prices.credit_price))}
              </TooltipContent>
            </Tooltip>
          ) : (
            <span className="text-xs italic text-muted-foreground">
              Not Set
            </span>
          )}
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
      cell: (item) => (
        <div className="flex gap-2 items-center text-sm">
          <Building2 className="size-3 text-gray-400" />
          {item.supplier?.name ?? "Unknown Supplier"}
        </div>
      ),
    },
  ]

  if (hasActionPermission) {
    columns.push({
      key: "action",
      header: (
        <div className="flex items-center justify-center gap-2">
          <Settings className="size-3" />
          <span>Actions</span>
        </div>
      ),
      className: "w-[100px] text-center",
      showInMobileCard: false,
      cell: (item) => (
        <div className="flex justify-center">
          <PriceAction
            item_price={item}
            onActionStart={onActionStart}
            user={user}
          />
        </div>
      ),
    })
  }

  return columns
}
