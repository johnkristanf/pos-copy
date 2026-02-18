import { Check, ChevronsUpDown } from "lucide-react"
import { useMemo, useState } from "react"
import { Button } from "@/components/ui/common/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/common/command"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/common/hover-card"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/common/pop-over"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/common/tooltip"
import { cn } from "@/lib/cn"
import { OrderableItem, UnitOfMeasure } from "@/types"
import { UomTreeCell } from "./uom-tree-cell"

interface UomSelectorProps {
  item: OrderableItem
  unitOfMeasures: UnitOfMeasure[]
  isSelected: boolean
  onValueChange?: (uomId: number) => void
  selectedValue?: number | null
  error?: string
}

export const UomSelector = ({
  item,
  unitOfMeasures,
  isSelected,
  onValueChange,
  selectedValue,
  error,
}: UomSelectorProps) => {
  const [open, setOpen] = useState(false)

  const currentUomId = useMemo(() => {
    if (selectedValue) return selectedValue

    if (item.stocks_price_per_uom && item.stocks_price_per_uom.length > 0) {
      return item.stocks_price_per_uom[0].uom_id
    }

    return (
      item.conversion_units?.[0]?.purchase_uom_id ??
      item.conversion_units?.[0]?.base_uom_id ??
      null
    )
  }, [selectedValue, item.conversion_units, item.stocks_price_per_uom])

  const validUoms = useMemo(() => {
    if (item.stocks_price_per_uom && item.stocks_price_per_uom.length > 0) {
      const availableUomIds = new Set(
        item.stocks_price_per_uom.map((s) => s.uom_id),
      )
      return unitOfMeasures.filter((u) => availableUomIds.has(u.id))
    }

    if (!item.conversion_units || item.conversion_units.length === 0) return []

    const uomSet = new Set<number>()

    item.conversion_units.forEach((c) => {
      uomSet.add(c.purchase_uom_id)
      uomSet.add(c.base_uom_id)
    })

    return unitOfMeasures.filter((u) => uomSet.has(u.id))
  }, [item.conversion_units, item.stocks_price_per_uom, unitOfMeasures])

  const selectedUomLabel = useMemo(() => {
    const uom = unitOfMeasures.find((u) => u.id === currentUomId)
    return uom?.code ?? uom?.name ?? "Select Unit"
  }, [currentUomId, unitOfMeasures])

  const triggerButton = (
    <Button
      variant="outline"
      role="combobox"
      aria-expanded={open}
      disabled={!isSelected}
      className={cn(
        "w-27.5 justify-between text-xs h-8",
        !isSelected && "opacity-50 cursor-not-allowed text-muted-foreground",
        error && "border-destructive text-destructive",
      )}
    >
      <span className="truncate">{selectedUomLabel}</span>
      <ChevronsUpDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
    </Button>
  )

  const content = (
    <div className="flex justify-center">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>{triggerButton}</PopoverTrigger>
        <PopoverContent className="w-35 p-0" align="center">
          <Command>
            <CommandInput
              placeholder="Search unit..."
              className="h-8 text-xs"
            />
            <CommandList>
              <CommandEmpty>No unit found.</CommandEmpty>
              <CommandGroup>
                {validUoms.map((uom) => (
                  <CommandItem
                    key={uom.id}
                    value={uom.name}
                    onSelect={() => {
                      onValueChange?.(uom.id)
                      setOpen(false)
                    }}
                    className="text-xs"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-3 w-3",
                        currentUomId === uom.id ? "opacity-100" : "opacity-0",
                      )}
                    />
                    {uom.code ?? uom.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )

  const withHoverCard = (
    <HoverCard openDelay={200}>
      <HoverCardTrigger asChild>{content}</HoverCardTrigger>
      <HoverCardContent
        className="w-auto min-w-50 p-3 shadow-lg border-slate-200"
        side="left"
        align="start"
      >
        <div className="space-y-2">
          <h4 className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider border-b pb-1 mb-1">
            Conversion Hierarchy
          </h4>
          <UomTreeCell item={item} unitOfMeasures={unitOfMeasures} />
        </div>
      </HoverCardContent>
    </HoverCard>
  )

  if (error) {
    return (
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>{withHoverCard}</TooltipTrigger>
        <TooltipContent
          side="bottom"
          className="bg-destructive text-destructive-foreground"
        >
          {error}
        </TooltipContent>
      </Tooltip>
    )
  }

  return withHoverCard
}
