import { formatCurrency } from "@/lib/format"
import { Product } from "@/types"

interface ProductPricesProps {
  product: Product
}

export const ProductPrices = ({ product }: ProductPricesProps) => {
  const renderPrice = (price: string | number | null | undefined) => {
    if (price === null || price === undefined) return "—"
    return formatCurrency(Number(price))
  }

  return (
    <div className="flex flex-col gap-1 text-xs">
      <div className="flex justify-between items-center gap-2">
        <span className="text-muted-foreground font-medium">Unit:</span>
        <span className="font-semibold text-foreground">
          {renderPrice(product.unit_price)}
        </span>
      </div>
      <div className="flex justify-between items-center gap-2">
        <span className="text-muted-foreground font-medium">Credit:</span>
        <span className="font-semibold text-foreground">
          {renderPrice(product.credit_price)}
        </span>
      </div>
      {/* <div className="flex justify-between items-center gap-2">
        <span className="text-muted-foreground font-medium">Wholesale:</span>
        <span className="font-semibold text-foreground">
          {renderPrice(product.wholesale_price)}
        </span>
      </div> */}
    </div>
  )
}
