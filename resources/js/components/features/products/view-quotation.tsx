import { Minus, Plus, QrCode, ShoppingCart, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/common/button"
import { ScrollArea } from "@/components/ui/common/scroll-area"
import { Input } from "@/components/ui/inputs/input"
import { APP_ASSETS } from "@/config/assets"
import { useDynamicDialog } from "@/hooks/ui/use-dynamic-dialog"
import { formatCurrency } from "@/lib/format"
import { ProductQuotationPrint } from "./products-quotation-print"
import {
  useProductSelectionActions,
  useSelectedProducts,
} from "./use-quotation-store"

export const ViewQuotation = () => {
  const { openDialog, closeDialog } = useDynamicDialog()
  const selectedProducts = useSelectedProducts()
  const { updateQuantity, toggleItem } = useProductSelectionActions()

  const items = Object.values(selectedProducts)

  const subtotal = items.reduce(
    (sum, item) => sum + (Number(item.product.unit_price) || 0) * item.quantity,
    0,
  )
  const taxRate = 0.12
  const tax = subtotal * taxRate
  const total = subtotal + tax

  const handleGenerate = () => {
    openDialog({
      title: "Quotation Preview",
      description: "Preview and download quotation document",
      children: (
        <ProductQuotationPrint
          items={items}
          logo={APP_ASSETS.COMPANY_LOGO_PNG}
        />
      ),
    })
  }

  return (
    <div className="flex flex-col h-full max-h-[85vh]">
      {items.length > 0 ? (
        <div className="flex flex-col flex-1 min-h-0">
          <ScrollArea className="flex-1 px-6">
            <div className="py-4">
              <table className="w-full">
                <thead className="bg-transparent border-b">
                  <tr>
                    <th className="pb-3 text-left text-xs font-semibold text-muted-foreground w-[45%]">
                      Item
                    </th>
                    <th className="pb-3 text-center text-xs font-semibold text-muted-foreground w-[20%]">
                      Quantity
                    </th>
                    <th className="pb-3 text-right text-xs font-semibold text-muted-foreground w-[15%]">
                      Unit Price
                    </th>
                    <th className="pb-3 text-right text-xs font-semibold text-muted-foreground w-[15%]">
                      Total
                    </th>
                    <th className="pb-3 w-[5%]"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {items.map((item) => (
                    <tr
                      key={item.product.id}
                      className="group transition-colors hover:bg-muted/30"
                    >
                      <td className="py-3 pr-4">
                        <div className="flex flex-col gap-1">
                          <span className="font-medium text-sm leading-tight text-foreground line-clamp-2">
                            {item.product.description}
                          </span>
                          <span className="flex items-center gap-1 text-[10px] text-muted-foreground font-mono bg-muted/50 px-1.5 py-0.5 rounded-sm w-fit">
                            <QrCode className="h-3 w-3" />
                            {item.product.sku}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-2">
                        <div className="flex items-center justify-center">
                          <div className="flex items-center h-8 bg-background border border-input rounded-md overflow-hidden shadow-sm transition-all focus-within:ring-1 focus-within:ring-ring">
                            <button
                              type="button"
                              className="px-2 h-full text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              disabled={item.quantity <= 1}
                              onClick={() =>
                                updateQuantity(
                                  item.product.id,
                                  item.quantity - 1,
                                )
                              }
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <Input
                              className="h-full w-10 text-center text-xs font-medium border-0 px-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                              type="number"
                              min={1}
                              max={
                                item.product.total_available_stock ?? undefined
                              }
                              value={item.quantity}
                              onChange={(e) => {
                                const val = Math.max(1, Number(e.target.value))
                                updateQuantity(item.product.id, val)
                              }}
                            />
                            <button
                              type="button"
                              className="px-2 h-full text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              disabled={
                                item.quantity >=
                                (item.product.total_available_stock || Infinity)
                              }
                              onClick={() =>
                                updateQuantity(
                                  item.product.id,
                                  item.quantity + 1,
                                )
                              }
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-2 text-sm text-right text-muted-foreground font-medium">
                        {formatCurrency(Number(item.product.unit_price))}
                      </td>
                      <td className="py-3 pl-2 text-sm font-semibold text-right text-foreground">
                        {formatCurrency(
                          Number(item.product.unit_price) * item.quantity,
                        )}
                      </td>

                      <td className="py-3 text-right pl-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          onClick={() => toggleItem(item.product, false)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ScrollArea>

          <div className="shrink-0 bg-muted/20 border-t px-6 py-4">
            <div className="flex justify-end">
              <div className="w-full sm:w-64 space-y-2 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal ({items.length} items)</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Tax (12%)</span>
                  <span>{formatCurrency(tax)}</span>
                </div>
                <div className="border-t pt-2 mt-2 flex justify-between font-bold text-lg text-foreground">
                  <span>Total</span>
                  <span className="text-primary">{formatCurrency(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center flex-1 min-h-75 text-center px-6">
          <div className="flex items-center justify-center h-16 w-16 bg-muted rounded-full mb-4">
            <ShoppingCart className="h-8 w-8 text-muted-foreground/60" />
          </div>
          <h4 className="text-base font-semibold text-foreground">
            No products selected
          </h4>
          <p className="text-sm text-muted-foreground mt-1 max-w-62.5">
            Please select at least one product from the inventory to generate a
            quotation.
          </p>
        </div>
      )}

      <div className="px-6 py-4 bg-background border-t shrink-0 flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
        <Button
          onClick={closeDialog}
          variant="ghost"
          className="sm:w-auto w-full"
        >
          Cancel
        </Button>
        <Button
          onClick={handleGenerate}
          disabled={items.length === 0}
          variant="bridge_digital"
          className="sm:w-auto w-full shadow-md"
        >
          Generate Quotation
        </Button>
      </div>
    </div>
  )
}
