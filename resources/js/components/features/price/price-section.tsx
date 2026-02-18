import { motion } from "framer-motion"
import { useMemo } from "react"
import { useItemsUtilityContext } from "@/components/contexts/items-utility"
import { SectionHeader } from "@/components/ui/common/section-header"
import { DataTable } from "@/components/ui/data-table"
import { PaginationInfo } from "@/components/ui/data-table/data-table-pagination"
import { APP_ASSETS } from "@/config/assets"
import { useDynamicDialog } from "@/hooks/ui/use-dynamic-dialog"
import { useRolePermissionFeatureViewer } from "@/hooks/ui/use-role-permission-viewer"
import { containerVariants, itemVariants } from "@/lib/animation-variants"
import { PaginatedItemPrice, User } from "@/types"
import { getPriceColumn } from "./price-column"
import { PriceListExport } from "./price-list-export"
import { PriceToolbar } from "./price-toolbar"

interface PriceSectionProps {
  item_price: PaginatedItemPrice
  updatingItemId?: number | null
  setUpdatingItemId?: (id: number | null) => void
  user: User
}

export const PriceSection = ({
  item_price,
  updatingItemId,
  setUpdatingItemId,
  user,
}: PriceSectionProps) => {
  const { openDialog } = useDynamicDialog()
  const { viewWrapper } = useRolePermissionFeatureViewer()

  const inventoryContext = useItemsUtilityContext()
  const locations = inventoryContext?.location || []
  const categories = inventoryContext?.categories || []

  const hasActionPermission = useMemo(
    () =>
      viewWrapper(
        [],
        ["price_and_discount"],
        [],
        ["create", "update", "delete"],
        user,
      ),
    [viewWrapper, user],
  )

  const columns = useMemo(
    () => getPriceColumn(setUpdatingItemId, user, hasActionPermission),
    [setUpdatingItemId, user, hasActionPermission],
  )

  const pagination: PaginationInfo = {
    currentPage: item_price?.current_page || 1,
    totalPages: item_price?.last_page || 1,
    totalItems: item_price?.total || 0,
    itemsPerPage: item_price?.per_page || 10,
    hasNextPage: !!item_price?.next_page_url,
    hasPreviousPage: !!item_price?.prev_page_url,
  }

  const handleExportItemPrice = () => {
    openDialog({
      title: "Export Item List",
      description: "Preview and download your item inventory report",
      children: (
        <PriceListExport
          items={item_price?.data ?? []}
          logo={APP_ASSETS.COMPANY_LOGO_PNG}
        />
      ),
    })
  }

  return (
    <motion.div
      className="space-y-4"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div variants={itemVariants}>
        <SectionHeader
          headerTitle="Price Management"
          headerSubtitle="View and update current price settings and history"
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
            data={item_price?.data || []}
            columns={columns}
            pagination={pagination}
            useInertia={true}
            customToolbar={
              <PriceToolbar
                categories={categories}
                locations={locations}
                onExport={handleExportItemPrice}
              />
            }
            searchPlaceholder="Search by item or supplier..."
            emptyMessage="No items have been added."
            isRowLoading={(item) => item.id === updatingItemId}
          />
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
