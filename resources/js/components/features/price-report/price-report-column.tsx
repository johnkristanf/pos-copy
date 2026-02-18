import {
  ArrowUpDown,
  Folder,
  Package,
  Paintbrush,
  PhilippinePeso,
  QrCode,
  Ruler,
  ShoppingCart,
  Tag,
  TrendingUp,
} from "lucide-react"
import { Badge } from "@/components/ui/common/badge"
import { getCategoryIcon } from "@/components/ui/common/get-category-icon"
import { DataTableColumn } from "@/components/ui/data-table"
import { formatCurrency } from "@/lib/format"
import { Item } from "@/types"

export const getPriceReportColumn = (): DataTableColumn<Item>[] => [
  {
    key: "item-description",
    header: (
      <div className="ml-5 flex items-center gap-2 whitespace-nowrap">
        <Package className="size-3" />
        <span>Item Description</span>
      </div>
    ),
    mobileLabel: "Item Description",
    cell: (item) => (
      <div className="ml-5">
        <div className="font-medium flex items-center gap-3">
          <div className="flex flex-col">
            <div className="font-medium">{item.description}</div>
            <kbd className="text-xs text-muted-foreground font-mono flex flex-row gap-1">
              <QrCode className="size-3.5" />
              {item.sku}
            </kbd>
          </div>
        </div>
      </div>
    ),
  },
  {
    key: "attributes",
    header: (
      <div className="flex items-center gap-2 whitespace-nowrap">
        <Paintbrush className="size-3" />
        <span>Item Attributes</span>
      </div>
    ),
    mobileLabel: "Item Attributes",
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
              style={{ backgroundColor: item.color }}
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
      <div className="flex items-center gap-2 whitespace-nowrap">
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
      <div className="flex items-center gap-2 whitespace-nowrap">
        <Folder className="size-3" />
        <span>Category</span>
      </div>
    ),
    mobileLabel: "Category",
    cell: (item) => (
      <div className="flex flex-wrap gap-1.5">
        <Badge variant="outline" className="gap-1.5 font-normal">
          {getCategoryIcon(item.category?.name)}
          <span className="capitalize">{item.category?.name}</span>
        </Badge>
      </div>
    ),
  },
  {
    key: "purchase-price",
    header: (
      <div className="flex items-center gap-2 whitespace-nowrap">
        <PhilippinePeso className="size-3" />
        <span>Purchase Price</span>
      </div>
    ),
    mobileLabel: "Purchase Price",
    cell: (item) => {
      const price = Number(item.selling_prices?.unit_price)

      return (
        <div className="text-right font-medium">
          {Number.isNaN(price) || !item.selling_prices?.unit_price ? (
            <span className="text-xs italic text-muted-foreground">
              No price set
            </span>
          ) : (
            `₱${price.toFixed(2)}`
          )}
        </div>
      )
    },
  },
  {
    key: "selling-price",
    header: (
      <div className="flex items-center gap-2 whitespace-nowrap">
        <PhilippinePeso className="size-3" />
        <span>Selling Price</span>
      </div>
    ),
    mobileLabel: "Selling Price",
    cell: (item) => {
      const price = Number(item?.selling_prices?.unit_price)

      return (
        <div className="text-right font-medium">
          {Number.isNaN(price) || !item.selling_prices?.unit_price ? (
            <span className="text-xs italic text-muted-foreground">
              No price set
            </span>
          ) : (
            formatCurrency(price)
          )}
        </div>
      )
    },
  },
  {
    key: "total-sold",
    header: (
      <div className="flex items-center gap-2 whitespace-nowrap">
        <ShoppingCart className="size-3" />
        <span>Total Sold</span>
      </div>
    ),
    mobileLabel: "Total Sold",
    cell: (item) => <div className="text-center">{item.sold_units ?? 0}</div>,
  },
  {
    key: "price-change-ytd",
    header: (
      <div className="flex items-center gap-2 whitespace-nowrap">
        <TrendingUp className="size-3" />
        <span>YTD Price Change</span>
      </div>
    ),
    mobileLabel: "YTD Price Change",
    cell: (item) => {
      const priceChange = item.selling_prices?.item_id ?? 0
      const isPositive = priceChange > 0
      const isNegative = priceChange < 0

      return (
        <div className="flex items-center justify-center gap-1.5">
          <Badge
            variant={isPositive ? "low" : isNegative ? "strong" : "secondary"}
            className="gap-1 font-normal"
          >
            <ArrowUpDown className="size-3" />
            <span>
              {isPositive ? "+" : ""}
              {priceChange.toFixed(1)}%
            </span>
          </Badge>
        </div>
      )
    },
  },
]
