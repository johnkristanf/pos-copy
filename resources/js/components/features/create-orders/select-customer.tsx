import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import {
  AlertCircle,
  Check,
  Loader2,
  MapPin,
  PlusIcon,
  SearchIcon,
} from "lucide-react"
import { useEffect, useState } from "react"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/common/avatar"
import { Button } from "@/components/ui/common/button"
import {
  Command,
  CommandEmpty,
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
import { useDebounce } from "@/hooks/ui/use-debounce"
import { useDynamicDialog } from "@/hooks/ui/use-dynamic-dialog"
import { cn } from "@/lib/cn"
import { Customer, PaginatedCustomers } from "@/types"
import { CreateCustomerForm } from "../customers/create-customer-form"
import {
  useDraftOrderActions,
  useDraftOrderState,
} from "./use-draft-order-store"

interface SelectCustomerProps {
  returnForm?: boolean
  onCustomerChange?: (customer: Customer | null) => void
}

export const SelectCustomer = ({
  returnForm,
  onCustomerChange,
}: SelectCustomerProps) => {
  const { selectedCustomer } = useDraftOrderState()
  const { setCustomer } = useDraftOrderActions()
  const [open, setOpen] = useState(false)

  const [inputValue, setInputValue] = useState("")
  const debouncedSearchQuery = useDebounce(inputValue, 300)
  const [queryError, setQueryError] = useState<string | null>(null)

  const { openDialog } = useDynamicDialog()

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCustomer(null)
    if (onCustomerChange) onCustomerChange(null)
  }

  const {
    data: customers = [],
    isLoading,
    isFetching,
    isError,
    error,
  } = useQuery({
    queryKey: ["customers", debouncedSearchQuery],
    queryFn: async () => {
      const response = await axios.get<PaginatedCustomers>(
        API_ROUTES.SEARCH_CUSTOMER,
        {
          params: { query: debouncedSearchQuery },
        },
      )
      return response.data.data
    },
    enabled: open,
    placeholderData: (previousData) => previousData,
    retry: false,
  })

  useEffect(() => {
    if (isError) {
      setQueryError(error?.message || "Failed to search customers.")
    } else {
      setQueryError(null)
    }
  }, [isError, error])

  const handleCreateNew = () => {
    setOpen(false)
    openDialog({
      title: "Create New Customer",
      description: "Add a new customer to the system",
      children: <CreateCustomerForm />,
    })
  }

  const formatAddress = (customer: Customer) => {
    if (!customer?.locations) return "No address available"
    const loc = customer.locations
    return [loc.barangay, loc.municipality, loc.province]
      .filter(Boolean)
      .join(", ")
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
    <div className="flex flex-col gap-3 p-3 sm:p-4">
      <div className="flex flex-row items-center justify-between">
        <h3 className="font-semibold text-sm text-foreground/90">
          {returnForm ? "Return Request from" : "Billed to"}
        </h3>
        {selectedCustomer && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
            onClick={handleClear}
          >
            Clear Selection
          </Button>
        )}
      </div>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between h-auto py-3 px-3 sm:px-4 transition-all duration-200 hover:bg-muted/50",
              !selectedCustomer &&
                "text-muted-foreground border-dashed border-2 hover:border-primary/50",
            )}
          >
            {selectedCustomer ? (
              <div className="flex items-center gap-3 text-left w-full min-w-0">
                <Avatar className="size-9 sm:size-10 rounded-full border border-border shadow-sm shrink-0">
                  <AvatarImage
                    src={selectedCustomer.customer_img || undefined}
                    alt={selectedCustomer.name}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                    {getInitials(selectedCustomer.name)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex flex-col min-w-0 flex-1 gap-0.5">
                  <span className="font-semibold text-sm truncate text-foreground">
                    {selectedCustomer.name}
                  </span>
                  <div className="flex flex-col sm:flex-row sm:items-center text-xs text-muted-foreground gap-1 sm:gap-2">
                    <span className="truncate flex items-center gap-1.5 font-medium w-9">
                      {selectedCustomer.contact_no || "N/A"}
                    </span>
                    <span className="hidden sm:inline-block text-border">
                      •
                    </span>
                    <span className="truncate flex items-center gap-1.5 opacity-80 min-w-0">
                      <MapPin className="h-3 w-3 shrink-0" />
                      <span className="truncate">
                        {formatAddress(selectedCustomer)}
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2.5 text-muted-foreground font-medium w-full">
                <div className="bg-primary/10 p-1.5 rounded-md text-primary shrink-0">
                  <SearchIcon className="h-4 w-4" />
                </div>
                <span className="truncate">
                  Search and select a customer...
                </span>
              </div>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[calc(100vw-2rem)] sm:w-100 md:w-112.5 p-0 rounded-xl shadow-xl overflow-hidden border-border/50 flex flex-col max-h-[60vh] sm:max-h-112.5"
          align="start"
          sideOffset={8}
        >
          <Command
            shouldFilter={false}
            className="bg-popover flex flex-col h-full overflow-hidden"
          >
            <div
              className="flex items-center border-b px-3 bg-muted/20 shrink-0"
              cmdk-input-wrapper=""
            >
              <SearchIcon className="mr-2 size-4 shrink-0 text-muted-foreground" />
              <input
                className="flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Search by name..."
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value)
                  setQueryError(null)
                }}
              />
            </div>

            {queryError && (
              <div className="mx-3 mt-3 flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-2.5 text-xs text-destructive font-medium shrink-0">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{queryError}</span>
              </div>
            )}

            <CommandList className="flex-1 overflow-y-auto overscroll-contain scrollbar-thin">
              {isLoading || isFetching ? (
                <div className="py-8 flex flex-col items-center justify-center gap-3 text-sm text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  <span>Searching customers...</span>
                </div>
              ) : (
                <>
                  {customers.length === 0 &&
                    !isLoading &&
                    debouncedSearchQuery &&
                    !queryError && (
                      <CommandEmpty className="py-8 text-center text-sm text-muted-foreground">
                        <span className="block font-medium text-foreground mb-1">
                          No customers found.
                        </span>
                        <span className="text-xs">
                          Try adjusting your search terms.
                        </span>
                      </CommandEmpty>
                    )}

                  {customers.length > 0 && (
                    <CommandGroup
                      heading="Matching Customers"
                      className="p-1.5"
                    >
                      {customers.map((customer) => (
                        <CommandItem
                          key={customer.id}
                          value={String(customer.id)}
                          onSelect={() => {
                            setCustomer(customer)
                            setOpen(false)
                            setInputValue("")
                            if (onCustomerChange) {
                              onCustomerChange(customer)
                            }
                          }}
                          className="flex items-center gap-3 py-2.5 px-3 rounded-lg cursor-pointer aria-selected:bg-muted"
                        >
                          <Avatar className="h-9 w-9 rounded-full border shadow-sm shrink-0 bg-background">
                            <AvatarImage
                              src={customer.customer_img || undefined}
                              alt={customer.name}
                              className="object-cover"
                            />
                            <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-semibold">
                              {getInitials(customer.name)}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex flex-col min-w-0 flex-1 gap-0.5">
                            <span className="font-semibold text-sm text-foreground truncate">
                              {customer.name}
                            </span>
                            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground min-w-0">
                              <MapPin className="h-3 w-3 shrink-0" />
                              <span className="truncate">
                                {formatAddress(customer)}
                              </span>
                            </div>
                          </div>

                          <div className="shrink-0 flex items-center justify-center w-5">
                            <Check
                              className={cn(
                                "h-4 w-4 text-primary transition-all duration-200",
                                selectedCustomer?.id === customer.id
                                  ? "opacity-100 scale-100"
                                  : "opacity-0 scale-50",
                              )}
                            />
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
                </>
              )}
            </CommandList>
            <div className="p-2.5 border-t border-border/50 bg-muted/10 shrink-0">
              <Button
                variant="ghost"
                className="w-full justify-start text-primary font-medium hover:text-primary hover:bg-primary/10"
                onClick={handleCreateNew}
              >
                <div className="bg-primary/20 p-1 rounded-md mr-3">
                  <PlusIcon className="h-4 w-4" />
                </div>
                Create New Customer
              </Button>
            </div>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
