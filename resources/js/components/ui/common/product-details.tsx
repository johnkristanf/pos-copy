import { Badge } from "@/components/ui/common/badge"
import { InventoryItem, Product } from "@/types"

interface ProductDetailsProps {
  product: Product | InventoryItem
}

export const ProductDetails = ({ product }: ProductDetailsProps) => {
  return (
    <div className="grid grid-cols-[65px_1fr] items-start gap-y-1.5 text-xs min-w-35">
      {/* Brand Row */}
      <span className="text-[10px] uppercase font-semibold text-muted-foreground mt-0.5">
        Brand
      </span>
      <div
        className="font-medium text-foreground truncate leading-tight"
        title={product.brand || "No Brand"}
      >
        {product.brand || (
          <span className="text-muted-foreground italic font-normal">
            No Brand
          </span>
        )}
      </div>

      {/* Category Row */}
      <span className="text-[10px] uppercase font-semibold text-muted-foreground mt-0.5">
        Category
      </span>
      <div className="flex flex-wrap min-w-0">
        <Badge
          variant="outline"
          className="gap-1.5 px-1.5 py-0 h-5 font-normal text-muted-foreground hover:text-foreground transition-colors border-dashed"
        >
          <span
            className="truncate max-w-30 capitalize leading-none"
            title={product.category?.name}
          >
            {product.category?.name ?? "Uncategorized"}
          </span>
        </Badge>
      </div>

      {/* Attributes Row */}
      <span className="text-[10px] uppercase font-semibold text-muted-foreground mt-0.5">
        Attributes
      </span>
      <div className="flex flex-wrap gap-1.5 items-center min-w-0">
        {product.size && (
          <Badge
            variant="secondary"
            className="gap-1.5 px-1.5 py-0 h-5 font-normal bg-muted/50 hover:bg-muted"
          >
            <span className="text-muted-foreground text-[10px] uppercase">
              Size
            </span>
            <span className="font-medium">{product.size}</span>
          </Badge>
        )}

        {product.color && (
          <Badge
            variant="secondary"
            className="gap-1.5 px-1.5 py-0 h-5 font-normal bg-muted/50 hover:bg-muted"
          >
            <span className="text-muted-foreground text-[10px] uppercase">
              Color
            </span>
            <div
              className="size-2 rounded-full border border-gray-300 shadow-sm"
              style={{ backgroundColor: product.color.toLowerCase() }}
            />
            <span className="capitalize">{product.color}</span>
          </Badge>
        )}

        {!product.size && !product.color && (
          <span className="text-muted-foreground italic pl-0.5">—</span>
        )}
      </div>
    </div>
  )
}
