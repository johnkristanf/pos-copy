import {
  Box,
  Check,
  ChevronsUpDown,
  Loader2,
  Store,
  Warehouse,
} from "lucide-react"
import { useState } from "react"
import { Badge } from "@/components/ui/common/badge"
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/common/pop-over"
import { Item } from "@/types"

interface StockDetails {
  store: number | string
  warehouse: number | string
  total: number | string
}

interface ItemSelectorProps {
  items?: Item[]
  onSelect: (item: Item) => void
  isLoading?: boolean
  stockDetails?: StockDetails | null
}

export const ItemSelector = ({
  items = [],
  onSelect,
  isLoading = false,
  stockDetails,
}: ItemSelectorProps) => {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState("")

  const displayDetails = stockDetails || {
    store: 0,
    warehouse: 0,
    total: 0,
  }

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full sm:w-50 justify-between bg-background px-3 font-normal text-sm transition-all hover:bg-accent hover:text-accent-foreground"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="size-3 animate-spin" />
                  <span>Loading...</span>
                </span>
              ) : value ? (
                <span className="truncate">
                  {
                    items?.find((item) => item.description === value)
                      ?.description
                  }
                </span>
              ) : (
                <span className="text-muted-foreground">Select item...</span>
              )}

              {!isLoading && (
                <ChevronsUpDown className="size-3 shrink-0 opacity-50" />
              )}
            </Button>
          </PopoverTrigger>

          <PopoverContent
            className="w-50 p-0 shadow-lg border-border"
            align="start"
          >
            <Command className="border-none">
              <CommandInput placeholder="Search item..." className="h-9" />
              <CommandList>
                <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">
                  No item found.
                </CommandEmpty>
                <CommandGroup>
                  {items.map((item) => (
                    <CommandItem
                      key={item.id}
                      value={item.description}
                      onSelect={(currentValue) => {
                        setValue(currentValue === value ? "" : currentValue)
                        onSelect(item)
                        setOpen(false)
                      }}
                      className="flex items-center justify-between py-2"
                    >
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-medium leading-none">
                          {item.description}
                        </span>
                        <span className="font-mono text-[10px] text-muted-foreground">
                          {item.sku}
                        </span>
                      </div>
                      {value === item.description && (
                        <Check className="h-4 w-4 opacity-100" />
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        <div className="flex flex-wrap items-center gap-1 animate-in fade-in slide-in-from-left-1 h-5">
          <Badge
            variant="secondary"
            className="rounded-md border border-border bg-background font-normal text-muted-foreground hover:bg-background h-full"
          >
            <Store className="size-3" />
            <span className="text-xs">Store</span>
            <span className="ml-1.5 font-mono font-medium text-foreground">
              {displayDetails.store ?? 0}
            </span>
          </Badge>

          <Badge
            variant="secondary"
            className="rounded-md border border-border bg-background font-normal text-muted-foreground hover:bg-background h-full"
          >
            <Warehouse className="size-3" />
            <span className="text-xs">Warehouse</span>
            <span className="ml-1.5 font-mono font-medium text-foreground">
              {displayDetails.warehouse ?? 0}
            </span>
          </Badge>

          <Badge
            variant="secondary"
            className="rounded-md border border-border bg-secondary/50 font-normal text-muted-foreground hover:bg-secondary/50 h-full px-2"
          >
            <Box className="size-3 text-foreground" />
            <span className="text-xs">Total</span>
            <span className="ml-1.5 font-mono font-bold text-foreground">
              {displayDetails.total ?? 0}
            </span>
          </Badge>
        </div>
      </div>
    </div>
  )
}
