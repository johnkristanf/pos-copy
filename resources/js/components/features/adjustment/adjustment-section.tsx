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
import { PaginatedStockAdjustment, User } from "@/types"
import { getAdjustmentColumns } from "./adjustment-column"
import { StockAdjustmentExport } from "./adjustment-list-export"
import { AdjustmentToolbar } from "./adjustment-toolbar"
import { CreateAdjustmentForm } from "./create-adjustment-form"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/common/tabs"
import { useQueryState } from "nuqs"

interface AdjustmentSectionProps {
  stockAdjustment: PaginatedStockAdjustment
  user: User
}

export const AdjustmentSection = ({
  stockAdjustment,
  user,
}: AdjustmentSectionProps) => {
  const { items, stockLocation } = useItemsUtilityContext()
  const [status, setStatus] = useQueryState("status", {
    defaultValue: "pending",
    shallow: false,
  })
  const adjustmentColumns = useMemo(
    () => getAdjustmentColumns(user, status),
    [user, status],
  )
  const { openDialog } = useDynamicDialog()

  const handleCreateStockAdjustment = () => {
    openDialog({
      title: "Create New Stock Adjustment",
      description: "Add a new stock adjustment",
      children: (
        <CreateAdjustmentForm
          items={items ?? []}
          stockLocation={stockLocation ?? []}
        />
      ),
      dialogClass: "",
    })
  }

  const pagination: PaginationInfo = {
    currentPage: stockAdjustment?.current_page || 1,
    totalPages: stockAdjustment?.last_page || 1,
    totalItems: stockAdjustment?.total || 0,
    itemsPerPage: stockAdjustment?.per_page || 10,
    hasNextPage:
      (stockAdjustment?.current_page || 1) < (stockAdjustment?.last_page || 1),
    hasPreviousPage: (stockAdjustment?.current_page || 1) > 1,
  }

  const handleExportAdjustment = () => {
    openDialog({
      title: "Export Item List",
      description: "Preview and download your item inventory report",
      children: (
        <StockAdjustmentExport
          adjustments={stockAdjustment?.data ?? []}
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
          headerTitle="Stock Adjustment"
          headerSubtitle="Create and manage items for adjustment"
        />

        <Tabs
          value={status || "pending"}
          onValueChange={(value) => setStatus(value)}
          className="w-full mt-2"
        >
          <TabsList>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>
        </Tabs>
      </motion.div>

      <motion.div variants={fadeInUpLarge}>
        <DataTable
          data={stockAdjustment?.data || []}
          columns={adjustmentColumns}
          pagination={pagination}
          useInertia={true}
          toolbar={
            <AdjustmentToolbar
              onCreateNew={handleCreateStockAdjustment}
              user={user}
              onExport={handleExportAdjustment}
            />
          }
          searchPlaceholder="Search by item or location..."
          emptyMessage="No stock adjustments have been created yet."
        />
      </motion.div>
    </motion.div>
  )
}
