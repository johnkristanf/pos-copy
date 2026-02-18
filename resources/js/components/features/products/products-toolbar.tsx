import { AnimatePresence, motion } from "framer-motion"
import {
  CheckCircle2,
  FileText,
  Folder,
  MapPin,
  RefreshCcw,
  XCircle,
} from "lucide-react"
import { Button } from "@/components/ui/common/button"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/common/select"
import { useDynamicDialog } from "@/hooks/ui/use-dynamic-dialog"
import { Category, Location } from "@/types"
import { ViewQuotation } from "./view-quotation"
import { useFilters } from "@/hooks/ui/use-utility-filter"

interface ProductsToolbarProps {
  categories?: Category[]
  locations?: Location[]
  enableSelection?: boolean
  hasSelectedItems?: boolean
  selectedCount?: number
}

export const ProductsToolbar = ({
  categories = [],
  locations = [],
  enableSelection = false,
  hasSelectedItems = false,
  selectedCount = 0,
}: ProductsToolbarProps) => {
  const { openDialog } = useDynamicDialog()
  const { filters, setFilter } = useFilters({
    category_id: "all",
    location_id: "all",
  })

  const hasActiveFilters =
    filters.category_id !== "all" || filters.location_id !== "all"
  const handleCreateQuotation = () => {
    openDialog({
      title: "Create Quotation",
      description: `Generate quotation for ${selectedCount} selected product${selectedCount !== 1 ? "s" : ""}`,
      children: <ViewQuotation />,
    })
  }

  return (
    <div className="flex flex-col">
      {/* Main Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-2">
        <div className="flex flex-wrap gap-2">
          {/* Category Filter */}
          <Select
            value={filters.category_id}
            onValueChange={(val) => setFilter({ category_id: val })}
          >
            <SelectTrigger className="w-35 sm:w-40 bg-background">
              <div className="flex items-center gap-2">
                <Folder className="h-3.5 w-3.5 text-muted-foreground" />
                <SelectValue placeholder="Category" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Category</SelectLabel>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={String(category.id)}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          {/* Location Filter */}
          <Select
            value={filters.location_id}
            onValueChange={(val) => setFilter({ location_id: val })}
          >
            <SelectTrigger className="w-35 sm:w-40 bg-background">
              <div className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                <SelectValue placeholder="Location" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Location</SelectLabel>
                <SelectItem value="all">All Locations</SelectItem>
                {locations.map((loc) => (
                  <SelectItem key={loc.id} value={String(loc.id)}>
                    {loc.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              setFilter({ category_id: "all", location_id: "all" })
            }
            title="Clear filters"
          >
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </Button>
        )}

        <div className="flex gap-2 self-end sm:self-auto">
          <Button variant={"outline"} onClick={() => window.location.reload()}>
            <RefreshCcw className="mr-2 h-4 w-4" /> Refresh
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {enableSelection && hasSelectedItems && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="overflow-hidden mt-3"
          >
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 sm:px-4 sm:py-3 bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 rounded-lg shadow-sm">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50">
                  <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-blue-900 dark:text-blue-100 leading-none mb-1">
                    {selectedCount} product{selectedCount !== 1 ? "s" : ""}{" "}
                    selected
                  </span>
                  <span className="text-xs text-blue-700/70 dark:text-blue-300/70">
                    Ready to generate quotation document
                  </span>
                </div>
              </div>
              <Button
                onClick={handleCreateQuotation}
                variant="bridge_digital"
                className="w-full sm:w-auto shadow-md hover:shadow-lg transition-all"
              >
                <FileText className="mr-2 h-4 w-4" />
                Create Quotation
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
