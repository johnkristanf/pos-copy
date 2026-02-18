import { useForm } from "@inertiajs/react"
import { Check, Package } from "lucide-react"
import { useState } from "react"
import toast from "react-hot-toast"
import { Button } from "@/components/ui/common/button"
import { ScrollArea } from "@/components/ui/common/scroll-area"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/common/sheet"
import { Input } from "@/components/ui/inputs/input"
import { API_ROUTES } from "@/config/api-routes"
import { useDynamicDialog } from "@/hooks/ui/use-dynamic-dialog"
import { cn } from "@/lib/cn"
import { Order, OrderItem } from "@/types"

interface ServeOrderItemsProps {
  selectedOrder: Order | null
  open: boolean
  onOpenChange: (open: boolean) => void
  className?: string
}

export function ServeOrderItems({
  selectedOrder,
  open,
  onOpenChange,
  className,
}: ServeOrderItemsProps) {
  const { post, processing, setData, data, reset } = useForm({
    order_item_id: null as number | null,
    quantity_to_serve: 0,
  })

  const { openConfirmation } = useDynamicDialog()

  const handleConfirm = (item: OrderItem, qty: number) => {
    const serveLoc = item.serve_locations
    const remaining =
      (serveLoc?.quantity_to_serve ?? 0) - (serveLoc?.quantity_served ?? 0)

    if (qty <= 0) return toast.error("Enter qty")
    if (qty > remaining) return toast.error(`Max ${remaining}`)

    setData({
      order_item_id: item.id,
      quantity_to_serve: qty,
    })

    openConfirmation({
      title: "Serve Item",
      description: `Serve ${qty} x ${item.item?.description}?`,
      confirmText: "Serve",
      cancelText: "Cancel",
      type: "warning",
      onConfirm: () => {
        const submitPromise = new Promise<void>((resolve, reject) => {
          post(API_ROUTES.SERVE_ORDER, {
            preserveScroll: true,
            onSuccess: () => {
              reset()
              resolve()
            },
            onError: (errors) => {
              const errorMessage =
                Object.values(errors).flat()[0] || "Failed to serve item."
              reject(errorMessage)
            },
          })
        })

        toast.promise(submitPromise, {
          loading: "Serving...",
          success: `Served ${qty} ${item.item?.description}`,
          error: (err) => cn(err),
        })
      },
    })
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange} modal={false}>
      <SheetContent
        hideOverlay
        className={cn(
          "flex flex-col gap-0 p-0 shadow-2xl border-l min-w-100 w-auto max-w-none transition-[width] duration-300 ease-in-out",
          className,
        )}
      >
        <SheetHeader className="px-3 py-2.5 border-b border-border/40 bg-muted/30 shrink-0 text-left flex-row items-center gap-2.5 space-y-0 min-h-12.5">
          <div className="p-1 rounded-md bg-linear-to-r from-[#349083] to-[#e3ea4e] shadow-xs shrink-0">
            <Package className="h-3 w-3 text-white" />
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <SheetTitle className="text-xs font-bold text-foreground uppercase tracking-wide truncate">
              Order #{selectedOrder?.id}
            </SheetTitle>
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/80 leading-tight">
              <span>{selectedOrder?.order_items?.length ?? 0} items</span>
              <span>•</span>
              <span className="truncate">Ready to serve</span>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-hidden relative flex flex-col bg-background">
          {selectedOrder && (
            <ScrollArea className="flex-1 h-full w-full">
              <div className="divide-y divide-border/30">
                {selectedOrder.order_items?.map((item: OrderItem) => (
                  <ServeItemRow
                    key={item.id}
                    item={item}
                    processing={processing}
                    isFormActive={data.order_item_id === item.id}
                    onUpdateData={(qty) =>
                      setData({
                        order_item_id: item.id,
                        quantity_to_serve: qty,
                      })
                    }
                    onConfirm={handleConfirm}
                  />
                ))}
              </div>
            </ScrollArea>
          )}

          <div
            className="absolute bottom-0 left-0 right-0 h-4 pointer-events-none z-20 bg-linear-to-t from-background to-transparent"
            aria-hidden="true"
          />
        </div>
      </SheetContent>
    </Sheet>
  )
}

interface ServeItemRowProps {
  item: OrderItem
  processing: boolean
  isFormActive: boolean
  onUpdateData: (qty: number) => void
  onConfirm: (item: OrderItem, qty: number) => void
}

function ServeItemRow({
  item,
  processing,
  isFormActive,
  onUpdateData,
  onConfirm,
}: ServeItemRowProps) {
  const [localQty, setLocalQty] = useState<string>("")
  const serveLoc = item.serve_locations
  const remaining =
    (serveLoc?.quantity_to_serve ?? 0) - (serveLoc?.quantity_served ?? 0)
  const progress =
    (serveLoc?.quantity_served ?? 0) / (serveLoc?.quantity_to_serve ?? 1)
  const isFullyServed = remaining === 0
  const valueLength =
    localQty.length > 0 ? localQty.length : String(remaining).length
  const widthChars = Math.max(2, valueLength)
  const inputWidth = widthChars > 2 ? `${widthChars + 3}ch` : "3.5rem"

  return (
    <div
      className={cn(
        "group relative flex items-center gap-2.5 px-3 py-2 transition-all hover:bg-muted/40",
        isFullyServed && "bg-muted/10 opacity-75 grayscale-[0.3]",
      )}
    >
      <div className="flex-1 min-w-0 flex flex-col justify-center gap-0.5">
        <div className="flex items-center justify-between gap-2">
          <span
            className={cn(
              "text-xs font-medium truncate",
              isFullyServed &&
                "text-muted-foreground line-through decoration-border",
            )}
            title={item.item?.description}
          >
            {item.item?.description}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-muted-foreground shrink-0">
            {item.item?.sku}
          </span>
          <div className="h-1 flex-1 rounded-full bg-secondary/80 overflow-hidden max-w-15">
            <div
              className={cn(
                "h-full transition-all duration-500",
                isFullyServed
                  ? "bg-green-500"
                  : "bg-linear-to-r from-[#349083] to-[#e3ea4e]",
              )}
              style={{ width: `${progress * 100}%` }}
            />
          </div>
          <span
            className={cn(
              "text-[9px] font-semibold tabular-nums",
              isFullyServed
                ? "text-green-600 dark:text-green-500"
                : "text-muted-foreground",
            )}
          >
            {serveLoc?.quantity_served}/{serveLoc?.quantity_to_serve}
          </span>
        </div>
      </div>

      <div className="shrink-0 flex items-center gap-1.5 pl-1 border-l border-transparent group-hover:border-border/40 transition-colors">
        {remaining > 0 ? (
          <>
            <div className="relative flex justify-end">
              <Input
                type="number"
                min={0}
                max={remaining}
                placeholder={String(remaining)}
                value={localQty}
                style={{ width: inputWidth }}
                className={cn(
                  "h-7 px-1 text-center text-xs border-muted-foreground/20 bg-muted/20 focus:bg-background transition-all duration-200",
                  localQty && "bg-background border-primary/50 shadow-xs",
                )}
                onKeyDown={(e) => {
                  if (e.key === "-" || e.key === "e") e.preventDefault()
                  if (e.key === "Enter") {
                    onConfirm(item, Number(localQty))
                  }
                }}
                onChange={(e) => {
                  let val = e.target.value
                  const numVal = Number(val)

                  if (numVal < 0) {
                    val = "0"
                  }

                  if (numVal > remaining) {
                    val = String(remaining)
                    toast.error(`Max items for this is ${remaining}`, {
                      id: "max-err",
                    })
                  }

                  setLocalQty(val)
                  onUpdateData(Number(val))
                }}
              />
            </div>
            <Button
              size="sm"
              className={cn(
                "h-7 w-7 p-0 shrink-0 rounded-md transition-all duration-300",
                !localQty || Number(localQty) <= 0
                  ? "opacity-50 pointer-events-none scale-90"
                  : "opacity-100 scale-100",
              )}
              variant="bridge_digital"
              disabled={processing || (isFormActive && Number(localQty) <= 0)}
              onClick={() => onConfirm(item, Number(localQty))}
              title="Serve Items"
            >
              <Check className="h-3.5 w-3.5" />
            </Button>
          </>
        ) : (
          <div className="size-7 flex items-center justify-center rounded-full bg-green-50 dark:bg-green-900/20">
            <Check className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
          </div>
        )}
      </div>
    </div>
  )
}
