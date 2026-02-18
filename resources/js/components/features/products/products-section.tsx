import { useMemo } from "react"
import { useItemsUtilityContext } from "@/components/contexts/items-utility"
import { SectionHeader } from "@/components/ui/common/section-header"
import { DataTable } from "@/components/ui/data-table"
import { PaginationInfo } from "@/components/ui/data-table/data-table-pagination"
import { PaginatedProducts } from "@/types"
import { getProductColumn } from "./products-column"
import { ProductsToolbar } from "./products-toolbar"
import {
  useProductSelectionActions,
  useSelectedProducts,
} from "./use-quotation-store"
import { motion } from "framer-motion"
import { containerVariants, itemVariants } from "@/lib/animation-variants"

interface ProductsSectionProps {
  products: PaginatedProducts
  enableSelection?: boolean
  updatingProductId?: number | null
}

export const ProductsSection = ({
  products,
  enableSelection = false,
  updatingProductId,
}: ProductsSectionProps) => {
  const { toggleItem, toggleAll } = useProductSelectionActions()
  const selectedItems = useSelectedProducts()
  const data = products?.data || []

  const inventoryContext = useItemsUtilityContext()
  const locations = inventoryContext?.location || []
  const categories = inventoryContext?.categories || []

  const selectedIds = useMemo(
    () => new Set(Object.keys(selectedItems).map(Number)),
    [selectedItems],
  )

  const currentIds = useMemo(() => data.map((product) => product.id), [data])
  const hasSelectedItems = Object.keys(selectedItems).length > 0
  const selectedCount = Object.keys(selectedItems).length
  const isAllSelected =
    currentIds.length > 0 && currentIds.every((id) => selectedIds.has(id))

  const productsColumns = useMemo(
    () =>
      getProductColumn(
        [],
        (checked) => toggleAll(data, checked),
        (product, checked) => toggleItem(product, checked),
        selectedIds,
        isAllSelected,
        enableSelection,
      ),
    [selectedIds, isAllSelected, data, toggleAll, toggleItem, enableSelection],
  )

  const pagination: PaginationInfo = {
    currentPage: products?.current_page || 1,
    totalPages: products?.last_page || 1,
    totalItems: products?.total || 0,
    itemsPerPage: products?.per_page || 10,
    hasNextPage: !!products?.next_page_url,
    hasPreviousPage: !!products?.prev_page_url,
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
          headerTitle="Products"
          headerSubtitle="Item Inventory Overview and Management"
        />
      </motion.div>

      <motion.div className="flex flex-col gap-4" variants={itemVariants}>
        <motion.div
          className="flex-1 w-full min-w-0"
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
            data={data}
            columns={productsColumns}
            useInertia={true}
            searchPlaceholder="Search inventory by item or supplier..."
            customToolbar={
              <ProductsToolbar
                categories={categories}
                locations={locations}
                enableSelection={enableSelection}
                hasSelectedItems={hasSelectedItems}
                selectedCount={selectedCount}
              />
            }
            emptyMessage="No items have been added for this return."
            pagination={pagination}
            isRowLoading={(item) => item.id === updatingProductId}
          />
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
