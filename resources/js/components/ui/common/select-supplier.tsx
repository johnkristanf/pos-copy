import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import {
  AlertCircle,
  Check,
  ChevronsUpDown,
  Loader2,
  MapPin,
  SearchIcon,
} from "lucide-react"
import { KeyboardEvent, useEffect, useState } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/common/avatar"
import { Button } from "@/components/ui/common/button"
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/common/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/common/pop-over"
import { API_ROUTES } from "@/config/api-routes"
import { cn } from "@/lib/cn"
import { PaginatedSupplier, Supplier } from "@/types"

interface SelectSupplierProps {
  selectedSupplier?: Supplier | null
  onSupplierChange?: (supplier: Supplier | null) => void
  label?: string
}

export const SelectSupplier = ({
  selectedSupplier: externalSelectedSupplier,
  onSupplierChange,
  label = "Supplier",
}: SelectSupplierProps) => {
  const [internalSelectedSupplier, setInternalSelectedSupplier] =
    useState<Supplier | null>(null)
  const [open, setOpen] = useState(false)

  const [inputValue, setInputValue] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [queryError, setQueryError] = useState<string | null>(null)

  const selectedSupplier =
    externalSelectedSupplier !== undefined
      ? externalSelectedSupplier
      : internalSelectedSupplier

  const setSupplier = (supplier: Supplier | null) => {
    if (externalSelectedSupplier === undefined) {
      setInternalSelectedSupplier(supplier)
    }
    if (onSupplierChange) {
      onSupplierChange(supplier)
    }
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    setSupplier(null)
  }

  const {
    data: suppliers = [],
    isLoading,
    isFetching,
    isError,
    error,
  } = useQuery({
    queryKey: ["suppliers", searchQuery],
    queryFn: async () => {
      const response = await axios.get<PaginatedSupplier>(
        API_ROUTES.SEARCH_SUPPLIER,
        {
          params: { query: searchQuery },
        },
      )
      return response.data.data
    },
    enabled: true,
    placeholderData: (previousData) => previousData,
    retry: false,
  })

  useEffect(() => {
    if (isError) {
      setQueryError(error?.message || "Failed to search suppliers.")
    } else {
      setQueryError(null)
    }
  }, [isError, error])

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      setSearchQuery(inputValue)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="flex flex-col gap-3 p-4 bg-card rounded-lg border">
      <div className="flex flex-row justify-between">
        <h3 className="font-semibold text-sm">{label}</h3>
        {selectedSupplier && (
          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs text-muted-foreground hover:text-destructive"
              onClick={handleClear}
            >
              Clear Selection
            </Button>
          </div>
        )}
      </div>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-auto"
          >
            {selectedSupplier ? (
              <div className="flex items-center gap-2 text-left w-full">
                <Avatar className="size-8 rounded-full border shrink-0">
                  <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-medium">
                    {getInitials(selectedSupplier.name)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex flex-col min-w-0 flex-1 gap-0.5">
                  <span className="font-medium text-sm truncate">
                    {selectedSupplier.name}
                  </span>
                  <div className="flex flex-col text-xs text-muted-foreground gap-0.5">
                    {selectedSupplier.contact_person && (
                      <span className="truncate flex items-center gap-1">
                        {selectedSupplier.contact_person}
                      </span>
                    )}
                    {selectedSupplier.address && (
                      <span className="truncate flex items-center gap-1 text-[10px] opacity-80">
                        <MapPin className="h-3 w-3" />
                        {selectedSupplier.address}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-muted-foreground">
                <SearchIcon className="h-4 w-4" />
                <span className="truncate">Search supplier...</span>
              </div>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[320px] p-0" align="start">
          <Command shouldFilter={false}>
            <div
              className="flex items-center border-b px-3"
              cmdk-input-wrapper=""
            >
              <SearchIcon className="mr-2 size-4 shrink-0 opacity-50" />
              <input
                className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Search supplier... (Press Enter)"
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value)
                  setQueryError(null)
                }}
                onKeyDown={handleKeyDown}
              />
            </div>

            {queryError && (
              <div className="mx-2 mt-2 flex items-center gap-2 rounded-md border border-destructive/50 bg-destructive/10 p-2 text-xs text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{queryError}</span>
              </div>
            )}

            <CommandList>
              {isLoading || isFetching ? (
                <div className="py-6 text-center text-sm text-muted-foreground flex items-center justify-center">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Searching...
                </div>
              ) : (
                <>
                  {suppliers.length > 0 && (
                    <CommandGroup heading="Suppliers">
                      {suppliers.map((supplier) => (
                        <CommandItem
                          key={supplier.id}
                          value={String(supplier.id)}
                          onSelect={() => {
                            setSupplier(supplier)
                            setOpen(false)
                            setInputValue("")
                            setSearchQuery("")
                          }}
                          className="flex items-center gap-1 py-1"
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4 shrink-0",
                              selectedSupplier?.id === supplier.id
                                ? "opacity-100"
                                : "opacity-0",
                            )}
                          />

                          <Avatar className="h-8 w-8 rounded-full border shrink-0">
                            <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-medium">
                              {getInitials(supplier.name)}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex flex-col min-w-0 flex-1 gap-0.5">
                            <span className="font-medium text-sm truncate">
                              {supplier.name}
                            </span>
                            <div className="flex flex-col text-xs text-muted-foreground gap-0.5">
                              {supplier.contact_person && (
                                <span className="truncate flex items-center gap-1">
                                  {supplier.contact_person}
                                </span>
                              )}
                              {supplier.address && (
                                <span className="truncate flex items-center gap-1 text-[10px] opacity-80">
                                  <MapPin className="h-3 w-3" />
                                  {supplier.address}
                                </span>
                              )}
                            </div>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
