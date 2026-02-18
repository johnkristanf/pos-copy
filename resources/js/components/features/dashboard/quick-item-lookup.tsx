import { Link } from "@inertiajs/react"
import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import {
  AlertCircle,
  ArrowUpRight,
  Box,
  Loader2,
  Package,
  PackageOpen,
  Search,
  ZoomIn,
} from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"
import { UomSelector } from "@/components/features/create-orders/uom-selector"
import { Button } from "@/components/ui/common/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/common/card"
import { Input } from "@/components/ui/inputs/input"
import { ImagePreview } from "@/components/ui/media/image-preview"
import { API_ROUTES } from "@/config/api-routes"
import { PAGE_ROUTES } from "@/config/page-routes"
import { useDebounce } from "@/hooks/ui/use-debounce"
import { useDynamicDialog } from "@/hooks/ui/use-dynamic-dialog"
import { useImagePreviewStore } from "@/hooks/ui/use-image-preview"
import { cn } from "@/lib/cn"
import {
  formatCompactCurrency,
  formatCompactNumber,
  formatCurrency,
} from "@/lib/format"
import { OrderableItem, UnitOfMeasure } from "@/types"
import { ItemLookupResult, useItemLookupStore } from "./use-item-lookup-store"

const fetchLookupItems = async (query: string): Promise<ItemLookupResult[]> => {
  const { data } = await axios.get(API_ROUTES.QUICK_ITEM_LOOKUP, {
    params: { query },
  })
  return data
}

interface QuickItemLookupProps {
  isCashier?: boolean
}

export const QuickItemLookUp = ({ isCashier }: QuickItemLookupProps) => {
  const { query, selectedItem, setQuery, setSelectedItem } =
    useItemLookupStore()
  const { openDialog } = useDynamicDialog()
  const { setImage } = useImagePreviewStore()
  const [showSuggestions, setShowSuggestions] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const debouncedQuery = useDebounce(query, 300)

  const {
    data: results = [],
    isFetching,
    isError,
  } = useQuery({
    queryKey: ["dashboard-item-lookup", debouncedQuery],
    queryFn: () => fetchLookupItems(debouncedQuery),
    enabled: debouncedQuery.length >= 2,
    staleTime: 1000 * 60,
    retry: false,
  })

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [wrapperRef])

  useEffect(() => {
    if (debouncedQuery.length >= 2 && !selectedItem) {
      setShowSuggestions(true)
    }
  }, [debouncedQuery, selectedItem])

  const handleSelect = (item: ItemLookupResult) => {
    setSelectedItem(item)
    setQuery(item.name)
    setShowSuggestions(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
    if (selectedItem) setSelectedItem(null)
  }

  const uomData = useMemo(() => {
    if (!selectedItem) return { item: null, uoms: [] }

    const uomMap = new Map<number, UnitOfMeasure>()

    selectedItem.conversion_units.forEach((cu) => {
      if (cu.purchase_uom) {
        uomMap.set(cu.purchase_uom.id, {
          id: cu.purchase_uom.id,
          name: cu.purchase_uom.name,
          code: cu.purchase_uom.code,
          is_active: true,
          created_at: "",
          updated_at: "",
        } as UnitOfMeasure)
      }
    })

    const itemForSelector = {
      ...selectedItem,
      conversion_units: selectedItem.conversion_units.map((cu) => ({
        ...cu,
        item_id: selectedItem.id,
        created_at: "",
        updated_at: "",
        purchase_uom: cu.purchase_uom
          ? {
              ...cu.purchase_uom,
              created_at: "",
              updated_at: "",
              is_active: true,
            }
          : undefined,
      })),
    } as unknown as OrderableItem

    return {
      item: itemForSelector,
      uoms: Array.from(uomMap.values()),
    }
  }, [selectedItem])

  const cleanImageUrl = selectedItem?.image_url
    ? selectedItem.image_url.replace(/\\/g, "/")
    : null

  const handleImageClick = (e: React.MouseEvent) => {
    e.stopPropagation()

    if (cleanImageUrl && selectedItem) {
      setImage(cleanImageUrl, {
        alt: selectedItem.description,
      })

      openDialog({
        title: "Preview Item Image",
        description: selectedItem.description,
        children: <ImagePreview />,
      })
    }
  }

  return (
    <div className="group relative rounded-xl transition-all duration-300 hover:shadow-lg">
      <div
        className="absolute -inset-px rounded-xl bg-linear-to-r from-[#349083] to-[#e3ea4e] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        aria-hidden="true"
      />

      <Card className="relative flex flex-col border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm overflow-visible">
        <CardHeader className="border-b border-border/40 pb-3 sm:pb-4 bg-linear-to-br from-zinc-50/50 to-zinc-100/30 dark:from-zinc-900/50 dark:to-zinc-800/30 shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-linear-to-r from-[#349083] to-[#e3ea4e] shadow-sm">
                  <Box className="h-3.5 w-3.5 text-white" />
                </div>
                <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                  Quick Product Lookup
                </CardTitle>
              </div>
              <CardDescription className="text-[11px] text-muted-foreground/70 leading-relaxed">
                Search and view product details instantly
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-3 sm:p-4 space-y-3 sm:space-y-4 min-h-0">
          <div className="relative group" ref={wrapperRef}>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
              {isFetching ? (
                <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
              ) : (
                <Search className="h-4 w-4 text-muted-foreground group-focus-within:text-[#349083] transition-colors" />
              )}
            </div>

            <Input
              type="search"
              value={query}
              onChange={handleInputChange}
              placeholder="Scan SKU or Search Product..."
              className={cn(
                "pl-9 pr-4 h-10 bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 font-mono text-sm focus:border-[#349083] focus:ring-[#349083]/20",
                showSuggestions &&
                  results.length > 0 &&
                  "rounded-b-none border-b-0",
              )}
              onFocus={() => {
                if (query.length >= 2) setShowSuggestions(true)
              }}
            />

            {showSuggestions && (
              <div className="absolute w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 border-t-0 rounded-b-lg shadow-xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden z-50">
                {isError ? (
                  <div className="p-4 text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    <span>Failed to load items. Please try again.</span>
                  </div>
                ) : results.length > 0 ? (
                  <ul className="max-h-75 overflow-auto scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-700">
                    {results.map((item) => (
                      <li
                        key={item.id}
                        onClick={() => handleSelect(item)}
                        className="px-3 py-2.5 text-sm cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors flex justify-between items-start gap-3 border-b border-border/40 last:border-0 group/item"
                      >
                        <div className="flex gap-3 items-center min-w-0 flex-1">
                          <div className="h-10 w-10 rounded-md bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 overflow-hidden border border-border/50 group-hover/item:border-[#349083]/30 transition-colors">
                            {item.image_url ? (
                              <img
                                src={item.image_url.replace(/\\/g, "/")}
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <Package className="h-5 w-5 text-muted-foreground/50" />
                            )}
                          </div>
                          <div className="flex flex-col gap-1 min-w-0 flex-1">
                            <span className="font-semibold text-sm text-foreground group-hover/item:text-[#349083] transition-colors line-clamp-1">
                              {item.name}
                            </span>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[10px] text-muted-foreground font-mono bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
                                {item.sku}
                              </span>
                              {item.category && (
                                <span className="text-[10px] text-muted-foreground/70">
                                  {item.category.code}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <span
                            className={cn(
                              "text-[10px] font-mono px-2 py-0.5 rounded-full border font-semibold",
                              item.total_available_stock > 0
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800"
                                : "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800",
                            )}
                          >
                            {formatCompactNumber(item.total_available_stock)}
                          </span>
                          <span className="text-xs font-bold text-foreground">
                            {formatCompactCurrency(item.price)}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : !isFetching && debouncedQuery.length >= 2 ? (
                  <div className="p-8 text-center text-sm text-muted-foreground flex flex-col items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                      <PackageOpen className="h-6 w-6 text-muted-foreground/50" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-medium text-foreground">
                        No items found
                      </p>
                      <p className="text-xs text-muted-foreground/70">
                        No matches for "{query}"
                      </p>
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </div>

          <div className="flex-1 rounded-lg border border-border/60 bg-zinc-50/50 dark:bg-zinc-900/20 overflow-hidden min-h-0 flex flex-col shadow-sm">
            <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 border-b border-border/40 bg-white/50 dark:bg-zinc-900/30 backdrop-blur-sm shrink-0">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider truncate flex-1 mr-2">
                {selectedItem?.description || "Products Details"}
              </span>
              {selectedItem && (
                <span className="text-[10px] font-mono text-muted-foreground bg-white dark:bg-zinc-900 border border-border/50 px-2 py-1 rounded-md shadow-sm">
                  {selectedItem.sku}
                </span>
              )}
            </div>

            <div className="flex-1 p-3 sm:p-4 relative overflow-auto">
              {!selectedItem && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/60 dark:bg-zinc-950/60 backdrop-blur-sm z-10 text-center p-4">
                  <div className="p-3 rounded-full bg-zinc-100 dark:bg-zinc-800 mb-3">
                    <Search className="h-6 w-6 text-muted-foreground/50" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    {query.length > 0 && query.length < 2
                      ? "Keep typing to search..."
                      : "No product selected"}
                  </p>
                  <p className="text-xs text-muted-foreground/60">
                    {query.length > 0 && query.length < 2
                      ? "Enter at least 2 characters"
                      : "Search and select an product to view details"}
                  </p>
                </div>
              )}

              <div className="space-y-3 sm:space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  <div className="sm:col-span-1">
                    <div
                      className={cn(
                        "aspect-square rounded-lg border-2 border-border/50 bg-white dark:bg-zinc-900 flex items-center justify-center overflow-hidden relative group/image transition-all",
                        cleanImageUrl &&
                          "cursor-zoom-in hover:border-[#349083]/50 hover:shadow-md",
                      )}
                      onClick={handleImageClick}
                    >
                      {cleanImageUrl ? (
                        <>
                          <img
                            src={cleanImageUrl}
                            alt="Item"
                            className="w-full h-full object-cover transition-transform duration-300 group-hover/image:scale-110"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover/image:bg-black/40 transition-colors flex items-center justify-center">
                            <ZoomIn className="h-8 w-8 text-white opacity-0 group-hover/image:opacity-100 transition-opacity" />
                          </div>
                        </>
                      ) : (
                        <Package className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground/30" />
                      )}
                    </div>
                  </div>

                  <div className="sm:col-span-2 space-y-3">
                    <div className="grid grid-cols-2 gap-2 sm:gap-3">
                      <div className="flex flex-col p-3 rounded-lg bg-white dark:bg-zinc-900 border border-border/50 shadow-sm group/stock relative overflow-hidden">
                        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 relative">
                          Store Stock
                        </span>
                        <span
                          className="font-mono text-xl sm:text-2xl font-bold text-foreground tracking-tight relative"
                          title={
                            selectedItem
                              ? selectedItem.store_stock.toLocaleString()
                              : undefined
                          }
                        >
                          {selectedItem
                            ? formatCompactNumber(selectedItem.store_stock)
                            : "--"}
                        </span>
                      </div>
                      <div className="flex flex-col p-3 rounded-lg bg-white dark:bg-zinc-900 border border-border/50 shadow-sm group/stock relative overflow-hidden">
                        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 relative">
                          Warehouse
                        </span>
                        <span
                          className="font-mono text-xl sm:text-2xl font-bold text-foreground tracking-tight relative"
                          title={
                            selectedItem
                              ? selectedItem.warehouse_stock.toLocaleString()
                              : undefined
                          }
                        >
                          {selectedItem
                            ? formatCompactNumber(selectedItem.warehouse_stock)
                            : "--"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs bg-white dark:bg-zinc-900 p-2.5 rounded-lg border border-border/50">
                      <div className="flex gap-2 sm:gap-3 text-muted-foreground flex-wrap">
                        <span
                          className="flex items-center gap-1"
                          title={
                            selectedItem?.min_quantity
                              ? selectedItem.min_quantity.toLocaleString()
                              : undefined
                          }
                        >
                          <span className="font-medium">Min:</span>
                          <span className="font-mono font-semibold text-foreground">
                            {selectedItem?.min_quantity
                              ? formatCompactNumber(selectedItem.min_quantity)
                              : "-"}
                          </span>
                        </span>
                        <span className="text-border">•</span>
                        <span
                          className="flex items-center gap-1"
                          title={
                            selectedItem?.max_quantity
                              ? selectedItem.max_quantity.toLocaleString()
                              : undefined
                          }
                        >
                          <span className="font-medium">Max:</span>
                          <span className="font-mono font-semibold text-foreground">
                            {selectedItem?.max_quantity
                              ? formatCompactNumber(selectedItem.max_quantity)
                              : "-"}
                          </span>
                        </span>
                      </div>

                      {selectedItem &&
                        selectedItem.conversion_units.length > 0 &&
                        uomData.item && (
                          <UomSelector
                            item={uomData.item}
                            unitOfMeasures={uomData.uoms}
                            isSelected={true}
                            onValueChange={() => {}}
                          />
                        )}
                    </div>
                  </div>
                </div>

                {/* Price Section */}
                <div className="pt-3 border-t border-dashed border-border/60 flex justify-between items-center bg-white dark:bg-zinc-900 p-3 sm:p-4 rounded-lg shadow-sm">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Selling Price
                    </span>
                    {selectedItem?.brand && (
                      <span className="text-xs text-muted-foreground/70">
                        {selectedItem.brand}
                      </span>
                    )}
                  </div>
                  <span
                    className="font-mono text-2xl sm:text-3xl font-bold text-[#349083] tabular-nums tracking-tight"
                    title={
                      selectedItem
                        ? formatCurrency(selectedItem.price)
                        : undefined
                    }
                  >
                    {selectedItem
                      ? formatCompactCurrency(selectedItem.price)
                      : "--"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {!isCashier && (
            <div className="shrink-0">
              <Button
                variant="outline"
                size="sm"
                className="w-full h-9 text-xs font-medium justify-between group border-border/50 hover:border-[#349083]/50 hover:bg-[#349083]/5 hover:text-[#349083] transition-all"
                asChild
              >
                <Link href={PAGE_ROUTES.PRODUCTS_PAGE}>
                  <span>View Full Product List</span>
                  <ArrowUpRight className="h-3.5 w-3.5 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
