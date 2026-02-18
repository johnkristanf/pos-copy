import { motion } from "framer-motion"
import { useEffect, useMemo } from "react"
import { useItemsUtilityContext } from "@/components/contexts/items-utility"
import { SectionHeader } from "@/components/ui/common/section-header"
import { DataTable } from "@/components/ui/data-table"
import { PaginationInfo } from "@/components/ui/data-table/data-table-pagination"
import { APP_ASSETS } from "@/config/assets"
import { useDynamicDialog } from "@/hooks/ui/use-dynamic-dialog"
import { useRolePermissionFeatureViewer } from "@/hooks/ui/use-role-permission-viewer"
import { containerVariants, itemVariants } from "@/lib/animation-variants"
import { Item, PaginatedStockIn, StockIn, StockLocation, User } from "@/types"
import { getStockInColumns } from "./stock-in-columns"
import { StockInForm } from "./stock-in-form"
import { StockInExport } from "./stock-in-list-export"
import { StockInToolbar } from "./stock-in-toolbar"
import { useStockInStore } from "./use-stock-in-store"

interface StockInSectionProps {
  items: Item[]
  stockLocation: StockLocation[]
  purchased_items: PaginatedStockIn
  updatingStockInId?: number | null
  user: User
}

export const StockInSection = ({
  items = [],
  stockLocation = [],
  purchased_items,
  updatingStockInId,
  user,
}: StockInSectionProps) => {
  const { openDialog } = useDynamicDialog()
  const { setDependencies } = useStockInStore()
  const { viewWrapper } = useRolePermissionFeatureViewer()

  const inventoryContext = useItemsUtilityContext()
  const locations = inventoryContext?.location || []
  const categories = inventoryContext?.categories || []
  const unit_of_measures = inventoryContext?.unit_of_measures || []
  const supplier = inventoryContext?.supplier || []

  const canStockIn = viewWrapper([], ["stock_in"], [], ["create"], user)

  useEffect(() => {
    setDependencies({
      items,
      categories,
      suppliers: supplier,
      stockLocations: stockLocation,
      unitOfMeasures: unit_of_measures,
    })
  }, [items, categories, supplier, stockLocation, unit_of_measures])

  const pagination: PaginationInfo = {
    currentPage: purchased_items?.current_page || 1,
    totalPages: purchased_items?.last_page || 1,
    totalItems: purchased_items?.total || 0,
    itemsPerPage: purchased_items?.per_page || 10,
    hasNextPage:
      (purchased_items?.current_page || 1) < (purchased_items?.last_page || 1),
    hasPreviousPage: (purchased_items?.current_page || 1) > 1,
  }

  const handleStockIn = (stockIn?: StockIn) => {
    openDialog({
      title: "Item Stock In",
      description: "Stock in items to the inventory",
      children: (
        <StockInForm initialData={stockIn || ({} as Partial<StockIn>)} />
      ),
      dialogClassName: "sm:max-w-4xl",
    })
  }

  const stockInColumns = useMemo(() => {
    return getStockInColumns({
      items,
      categories,
      supplier,
      stockLocation,
      unit_of_measures,
      onStockIn: (stockIn: StockIn) => handleStockIn(stockIn),
      canStockIn,
    })
  }, [
    items,
    categories,
    supplier,
    stockLocation,
    unit_of_measures,
    handleStockIn,
    canStockIn,
  ])

  const handleExportStockIn = () => {
    openDialog({
      title: "Export Item List",
      description: "Preview and download your item inventory report",
      children: (
        <StockInExport
          stockIns={purchased_items?.data ?? []}
          logo={APP_ASSETS.COMPANY_LOGO_PNG}
        />
      ),
    })
  }

  return (
    <motion.div
      className="space-y-3 sm:space-y-4"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div variants={itemVariants}>
        <SectionHeader
          headerTitle="Item Stock In"
          headerSubtitle="Item Inventory Overview and Management"
        />
      </motion.div>

      <motion.div
        variants={itemVariants}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.2,
          type: "spring" as const,
          stiffness: 80,
          damping: 15,
        }}
      >
        <DataTable
          data={purchased_items?.data || []}
          columns={stockInColumns}
          pagination={pagination}
          useInertia={true}
          searchPlaceholder="Search by item or supplier..."
          customToolbar={
            <StockInToolbar
              onStockIn={() => handleStockIn()}
              categories={categories}
              locations={locations}
              user={user}
              onExport={handleExportStockIn}
            />
          }
          emptyMessage="No items have been added."
          isRowLoading={(item) => item.id === updatingStockInId}
        />
      </motion.div>
    </motion.div>
  )
}
