import { motion } from "framer-motion"
import { Minus, Plus } from "lucide-react"
import { useEffect, useState } from "react"
import { match, P } from "ts-pattern"
import { Button } from "@/components/ui/common/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/common/tooltip"
import { Input } from "@/components/ui/inputs/input"
import { cn } from "@/lib/cn"
import { OrderableItem } from "@/types"
import {
  useCreateOrderActions,
  useCreateOrderStore,
} from "./use-create-order-store"

export const QuantityCell = ({
  item,
  error,
}: {
  item: OrderableItem
  error?: string
}) => {
  const quantity = useCreateOrderStore(
    (state) => state.quantities[item.id] ?? 1,
  )
  const selectedUomId = useCreateOrderStore(
    (state) => state.selectedUoms[item.id],
  )
  const isSelected = useCreateOrderStore(
    (state) => !!state.selectedItems[item.id],
  )
  const { setQuantity } = useCreateOrderActions()

  const [isShaking, setIsShaking] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (isShaking) {
      const timer = setTimeout(() => setIsShaking(false), 400)
      return () => clearTimeout(timer)
    }
  }, [isShaking])

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(null), 2000)
      return () => clearTimeout(timer)
    }
  }, [errorMessage])

  if (!isSelected)
    return <span className="text-muted-foreground text-xs">—</span>

  const maxStock = (() => {
    if (!selectedUomId || !item.stocks_price_per_uom) {
      return (item.stocks ?? []).reduce(
        (total, stock) => total + stock.available_quantity,
        0,
      )
    }

    const stockInfo = item.stocks_price_per_uom.find(
      (s) => s.uom_id === selectedUomId,
    )
    return stockInfo ? stockInfo.available_quantity : 0
  })()

  const uomLabel = (() => {
    if (!selectedUomId || !item.stocks_price_per_uom) return "units"
    const stockInfo = item.stocks_price_per_uom.find(
      (s) => s.uom_id === selectedUomId,
    )
    return stockInfo?.uom_code || "units"
  })()

  const isOutOfStock = maxStock === 0

  if (isOutOfStock) {
    return (
      <div className="ml-7 flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-destructive/10 bg-destructive/5 w-fit">
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive opacity-75" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-destructive" />
        </span>
        <span className="text-destructive text-[10px] font-black uppercase tracking-tight">
          No Stock
        </span>
      </div>
    )
  }

  const handleQuantityChange = (newVal: number) => {
    match(newVal)
      .when(
        (v) => v < 1,
        () => {
          setQuantity(item.id, 1)
          setIsShaking(true)
          setErrorMessage("Min quantity: 1")
        },
      )
      .when(
        (v) => v > maxStock,
        () => {
          const maxAllowed = Math.floor(maxStock)
          setQuantity(item.id, maxAllowed)
          setIsShaking(true)
          setErrorMessage(`Max available: ${maxAllowed} ${uomLabel}`)
        },
      )
      .otherwise((v) => {
        setErrorMessage(null)
        setQuantity(item.id, v)
      })
  }

  const finalErrorMessage = error || errorMessage

  const tooltipMessage = match({ finalErrorMessage, isOutOfStock })
    .with(
      { finalErrorMessage: P.string },
      ({ finalErrorMessage }) => finalErrorMessage,
    )
    .otherwise(() => null)

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="outline"
        size="icon"
        className={cn("size-6 shrink-0", quantity <= 1 && "opacity-50")}
        onClick={(e) => {
          e.stopPropagation()
          handleQuantityChange(quantity - 1)
        }}
      >
        <Minus className="size-3" />
      </Button>

      <Tooltip open={!!tooltipMessage}>
        <TooltipTrigger asChild>
          <div className="relative flex flex-col">
            <motion.div
              animate={isShaking ? { x: [0, -5, 5, -5, 5, 0] } : { x: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            >
              <Input
                type="number"
                min={1}
                max={Math.floor(maxStock)}
                className={cn(
                  "h-8 w-16 text-center transition-colors duration-200 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none font-mono text-xs font-bold",
                  finalErrorMessage &&
                    "border-destructive text-destructive focus-visible:ring-destructive",
                )}
                value={quantity}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10)
                  if (Number.isNaN(val)) {
                    setQuantity(item.id, 1)
                  } else {
                    handleQuantityChange(val)
                  }
                }}
                onClick={(e) => e.stopPropagation()}
              />
            </motion.div>
          </div>
        </TooltipTrigger>
        <TooltipContent
          side="bottom"
          surfaceClass="bg-destructive"
          textClass="text-destructive-foreground"
          arrowFillClass="fill-destructive"
          className="border border-destructive"
        >
          <p className="text-xs font-medium">{tooltipMessage}</p>
        </TooltipContent>
      </Tooltip>

      <Button
        variant="outline"
        size="icon"
        className={cn("size-6 shrink-0", quantity >= maxStock && "opacity-50")}
        onClick={(e) => {
          e.stopPropagation()
          handleQuantityChange(quantity + 1)
        }}
      >
        <Plus className="size-3" />
      </Button>
    </div>
  )
}
