import { motion } from "framer-motion"
import { useMemo } from "react"
import { useItemsUtilityContext } from "@/components/contexts/items-utility"
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
import { PaginatedStockTransfer, User } from "@/types"
import { CreateStockTransferForm } from "./create-stock-transfer-form"
import { getStockTransferColumns } from "./stock-transfer-column"
import { StockTransferExport } from "./stock-transfer-list-export"
import { StockTransferToolbar } from "./stock-transfer-toolbar"

interface StockTransferSectionProps {
  stockTransfers: PaginatedStockTransfer
  updatingStockTransferId?: number | null
  user: User
}

export const StockTransferSection = ({
  stockTransfers,
  updatingStockTransferId,
  user,
}: StockTransferSectionProps) => {
  const { items, stockLocation, categories } = useItemsUtilityContext()

  const safeCategories = categories || []

  const stockTransferColumns = useMemo(
    () => getStockTransferColumns({ categories: safeCategories, user }),
    [safeCategories, user],
  )

  const { openDialog } = useDynamicDialog()

  const pagination: PaginationInfo = useMemo(
    () => ({
      currentPage: stockTransfers?.current_page || 1,
      totalPages: stockTransfers?.last_page || 1,
      totalItems: stockTransfers?.total || 0,
      itemsPerPage: stockTransfers?.per_page || 10,
      hasNextPage:
        (stockTransfers?.current_page || 1) < (stockTransfers?.last_page || 1),
      hasPreviousPage: (stockTransfers?.current_page || 1) > 1,
    }),
    [stockTransfers],
  )

  const handleCreateStockTransfer = () => {
    openDialog({
      title: "Create New Stock Transfer",
      description: "Add a new stock transfer",
      children: (
        <CreateStockTransferForm
          items={items ?? []}
          stockLocation={stockLocation ?? []}
        />
      ),
      dialogClass: "",
    })
  }

  const handleExportStockTransfer = () => {
    openDialog({
      title: "Export Item List",
      description: "Preview and download your item inventory report",
      children: (
        <StockTransferExport
          transfers={stockTransfers?.data ?? []}
          categories={categories || []}
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
          headerTitle="Stock Transfer"
          headerSubtitle="Select and Manage Items for Transfer"
        />
      </motion.div>

      <motion.div variants={fadeInUpLarge}>
        <DataTable
          data={stockTransfers?.data || []}
          columns={stockTransferColumns}
          pagination={pagination}
          useInertia={true}
          toolbar={
            <StockTransferToolbar
              onCreateNew={handleCreateStockTransfer}
              user={user}
              onExport={handleExportStockTransfer}
            />
          }
          searchPlaceholder="Search by item or supplier..."
          emptyMessage="No items have been added."
          isRowLoading={(item) => item.id === updatingStockTransferId}
        />
      </motion.div>
    </motion.div>
  )
}
