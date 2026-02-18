import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import { motion } from "framer-motion"
import {
  Loader2,
  MapPin,
  Search,
  Star,
  User,
  UserCircle,
  Users,
} from "lucide-react"
import { useState } from "react"

import { Badge } from "@/components/ui/common/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/common/card"
import { Input } from "@/components/ui/inputs/input"
import { API_ROUTES } from "@/config/api-routes"
import { useDebounce } from "@/hooks/ui/use-debounce"
import { cn } from "@/lib/cn"
import { formatCompactCurrency, formatCurrency } from "@/lib/format"
import { Customer, PaginatedCustomers } from "@/types"

export const QuickCustomerSearch = () => {
  const [search, setSearch] = useState("")
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  )
  const [isFocused, setIsFocused] = useState(false)

  const debouncedSearch = useDebounce(search, 300)

  const { data: customers = [], isLoading } = useQuery({
    queryKey: ["quick-customer-search", debouncedSearch],
    queryFn: async () => {
      if (!debouncedSearch) return []
      const response = await axios.get<PaginatedCustomers>(
        API_ROUTES.SEARCH_CUSTOMER,
        {
          params: { query: debouncedSearch },
        },
      )
      return response.data.data
    },
    enabled: !!debouncedSearch && !selectedCustomer,
  })

  const handleSelect = (customer: Customer) => {
    setSelectedCustomer(customer)
    setSearch(customer.name)
    setIsFocused(false)
  }

  const creditData = selectedCustomer?.credit
  const creditLimit = Number(creditData?.limit) || 1
  const usedCredit = Number(creditData?.balance) || 0

  const utilization = (usedCredit / creditLimit) * 100
  const clampedUtilization = Math.min(Math.max(utilization, 0), 100)

  const getCreditHealthColor = () => {
    if (clampedUtilization > 90)
      return "from-red-500 to-red-600 dark:from-red-600 dark:to-red-700"
    if (clampedUtilization > 70)
      return "from-amber-500 to-amber-600 dark:from-amber-600 dark:to-amber-700"
    if (clampedUtilization > 50)
      return "from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700"
    return "from-emerald-500 to-emerald-600 dark:from-emerald-600 dark:to-emerald-700"
  }

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return "text-emerald-500 dark:text-emerald-400"
    if (rating >= 3.5) return "text-blue-500 dark:text-blue-400"
    if (rating >= 2.5) return "text-amber-500 dark:text-amber-400"
    return "text-red-500 dark:text-red-400"
  }

  // Refactored: Access rating from nested credit object
  const ratingValue = Number(creditData?.rating) || 0
  const filledStars = Math.floor(ratingValue)

  return (
    <div className="group relative h-full rounded-xl transition-all duration-300 hover:shadow-lg">
      <div
        className="absolute -inset-px rounded-xl bg-linear-to-r from-[#349083] to-[#e3ea4e] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        aria-hidden="true"
      />

      <Card className="relative h-full flex flex-col border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm overflow-visible">
        <CardHeader className="border-b border-border/40 pb-3 sm:pb-4 bg-linear-to-br from-zinc-50/50 to-zinc-100/30 dark:from-zinc-900/50 dark:to-zinc-800/30 shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-linear-to-r from-[#349083] to-[#e3ea4e] shadow-sm">
                  <Users className="h-3.5 w-3.5 text-white" />
                </div>
                <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                  Quick Customer Search
                </CardTitle>
              </div>
              <CardDescription className="text-[11px] text-muted-foreground/70 leading-relaxed">
                Search and view customer details
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-3 sm:p-4 space-y-3 sm:space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
              {isLoading ? (
                <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
              ) : (
                <Search className="h-4 w-4 text-muted-foreground group-focus-within:text-[#349083] transition-colors" />
              )}
            </div>

            <Input
              type="search"
              placeholder="Search by name or code..."
              className="pl-9 pr-4 h-10 bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 font-mono text-sm focus:border-[#349083] focus:ring-[#349083]/20"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                if (selectedCustomer) setSelectedCustomer(null)
              }}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            />

            {isFocused && !selectedCustomer && debouncedSearch && (
              <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-75 overflow-y-auto rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-xl animate-in fade-in zoom-in-95 duration-200">
                {isLoading ? (
                  <div className="p-4 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Searching customers...</span>
                  </div>
                ) : customers.length > 0 ? (
                  <div className="py-1">
                    {customers.map((customer) => (
                      <div
                        key={customer.id}
                        className="cursor-pointer px-3 py-2.5 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors border-b border-border/40 last:border-0 group/item"
                        onClick={() => handleSelect(customer)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="h-9 w-9 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                            <UserCircle className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-foreground group-hover/item:text-[#349083] transition-colors truncate">
                              {customer.name}
                            </div>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <span className="text-[10px] text-muted-foreground font-mono bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
                                {customer.customer_code}
                              </span>
                              {customer.locations && (
                                <span className="text-[10px] text-muted-foreground/70 flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {customer.locations.municipality}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-sm text-muted-foreground flex flex-col items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                      <Users className="h-6 w-6 text-muted-foreground/50" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-medium text-foreground">
                        No customers found
                      </p>
                      <p className="text-xs text-muted-foreground/70">
                        No matches for "{search}"
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {selectedCustomer ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-1 space-y-3"
            >
              <div className="flex items-center gap-3 p-3 rounded-lg bg-linear-to-br from-zinc-50 to-white dark:from-zinc-900/50 dark:to-zinc-900/30 border border-border/50 shadow-sm">
                <div className="h-12 w-12 rounded-full bg-background flex items-center justify-center shrink-0 shadow-md">
                  <User className="h-6 w-6 text-black" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm text-foreground truncate">
                    {selectedCustomer.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-mono text-muted-foreground bg-white dark:bg-zinc-900 px-1.5 py-0.5 rounded border border-border/50">
                      {selectedCustomer.customer_code}
                    </span>
                    {selectedCustomer.locations && (
                      <span className="text-[10px] text-muted-foreground/70 flex items-center gap-1 truncate">
                        <MapPin className="h-3 w-3 shrink-0" />
                        {selectedCustomer.locations.municipality}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2 p-3 rounded-lg bg-white dark:bg-zinc-900 border border-border/50 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Credit Health
                  </span>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[10px] font-mono font-semibold border px-2 py-0.5",
                      clampedUtilization > 90
                        ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800"
                        : clampedUtilization > 70
                          ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800"
                          : "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800",
                    )}
                  >
                    {clampedUtilization.toFixed(1)}%
                  </Badge>
                </div>

                <div className="h-3 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800 shadow-inner">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${clampedUtilization}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className={cn(
                      "h-full bg-linear-to-r shadow-sm",
                      getCreditHealthColor(),
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div className="flex flex-col p-2 rounded-md bg-zinc-50 dark:bg-zinc-800/50">
                    <span className="text-[9px] text-muted-foreground uppercase tracking-wider">
                      Used
                    </span>
                    <span
                      className="font-mono text-xs font-bold text-foreground"
                      title={formatCurrency(usedCredit)}
                    >
                      {formatCompactCurrency(usedCredit)}
                    </span>
                  </div>
                  <div className="flex flex-col p-2 rounded-md bg-zinc-50 dark:bg-zinc-800/50">
                    <span className="text-[9px] text-muted-foreground uppercase tracking-wider">
                      Limit
                    </span>
                    <span
                      className="font-mono text-xs font-bold text-foreground"
                      title={formatCurrency(creditLimit)}
                    >
                      {formatCompactCurrency(creditLimit)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-zinc-900 border border-border/50 shadow-sm">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Credit Rating
                </span>
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "text-sm font-bold tabular-nums",
                      getRatingColor(ratingValue),
                    )}
                  >
                    {ratingValue.toFixed(1)}
                  </span>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star
                        key={i}
                        className={cn(
                          "h-3.5 w-3.5 transition-all",
                          i <= filledStars
                            ? getRatingColor(ratingValue)
                            : "text-zinc-200 dark:text-zinc-700",
                        )}
                        fill={i <= filledStars ? "currentColor" : "none"}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center py-8 text-center">
              <div className="h-16 w-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-3">
                <Search className="h-8 w-8 text-muted-foreground/40" />
              </div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                {search.length > 0 && search.length < 2
                  ? "Keep typing to search..."
                  : "No customer selected"}
              </p>
              <p className="text-xs text-muted-foreground/60 max-w-xs">
                {search.length > 0 && search.length < 2
                  ? "Enter at least 2 characters"
                  : "Search and select a customer to view their details"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
