import { motion } from "framer-motion"
import { useMemo } from "react"
import { SectionHeader } from "@/components/ui/common/section-header"
import { DataTable } from "@/components/ui/data-table"
import { PaginationInfo } from "@/components/ui/data-table/data-table-pagination"
import { APP_ASSETS } from "@/config/assets"
import { useDynamicDialog } from "@/hooks/ui/use-dynamic-dialog"
import {
  fadeInUp,
  fadeInUpLarge,
  staggerContainerSlow,
} from "@/lib/animation-variants"
import { Category, Location, PaginatedInventoryItem, User } from "@/types"
import { getInventoryColumn } from "./inventory-columns"
import { InventoryExport } from "./inventory-list-export"
import { InventoryToolbar } from "./inventory-toolbar"

interface InventorySectionProps {
  item_stock: PaginatedInventoryItem
  categories?: Category[]
  locations?: Location[]
  updatingItemId?: number | null
  user: User
}

export const InventorySection = ({
  item_stock,
  categories = [],
  locations = [],
  updatingItemId,
  user,
}: InventorySectionProps) => {
  const { openDialog } = useDynamicDialog()
  const inventoryColumns = useMemo(() => getInventoryColumn(), [])

  const pagination: PaginationInfo = {
    currentPage: item_stock?.current_page || 1,
    totalPages: item_stock?.last_page || 1,
    totalItems: item_stock?.total || 0,
    itemsPerPage: item_stock?.per_page || 10,
    hasNextPage: !!item_stock?.next_page_url,
    hasPreviousPage: !!item_stock?.prev_page_url,
  }

  const handleExportInventory = () => {
    openDialog({
      title: "Export Item List",
      description: "Preview and download your item inventory report",
      children: (
        <InventoryExport
          items={item_stock?.data ?? []}
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
      variants={staggerContainerSlow}
    >
      <motion.div variants={fadeInUp}>
        <SectionHeader
          headerTitle="Item Inventory"
          headerSubtitle="Item Inventory Overview and Management"
        />
      </motion.div>

      <motion.div variants={fadeInUpLarge}>
        <DataTable
          data={item_stock?.data || []}
          columns={inventoryColumns}
          useInertia={true}
          searchPlaceholder="Search by item or supplier..."
          customToolbar={
            <InventoryToolbar
              categories={categories}
              locations={locations}
              user={user}
              onExport={handleExportInventory}
            />
          }
          emptyMessage="No items have been added."
          pagination={pagination}
          isRowLoading={(item) => item.id === updatingItemId}
        />
      </motion.div>
    </motion.div>
  )
}
