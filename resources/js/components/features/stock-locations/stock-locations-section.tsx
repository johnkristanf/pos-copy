import { motion } from "framer-motion"
import { useMemo, useState } from "react"
import { SectionHeader } from "@/components/ui/common/section-header"
import { DataTable } from "@/components/ui/data-table"
import { PaginationInfo } from "@/components/ui/data-table/data-table-pagination"
import { useDynamicDialog } from "@/hooks/ui/use-dynamic-dialog"
import { useRolePermissionFeatureViewer } from "@/hooks/ui/use-role-permission-viewer"
import { containerVariants, itemVariants } from "@/lib/animation-variants"
import { PaginatedStockLocations, User } from "@/types"
import { CreateStockLocationsForm } from "./create-stock-locations-form"
import { getStockLocationsColumn } from "./stock-locations-column"
import { StockLocationsToolbar } from "./stock-locations-toolbar"

interface StockLocationsSectionProps {
  stockLocations: PaginatedStockLocations
  user: User
}

export const StockLocationsSection = ({
  stockLocations,
  user,
}: StockLocationsSectionProps) => {
  const { openDialog } = useDynamicDialog()
  const { viewWrapper } = useRolePermissionFeatureViewer()
  const [updatingLocationId, setUpdatingLocationId] = useState<number | null>(
    null,
  )

  const hasActionPermission = useMemo(
    () =>
      viewWrapper([], ["tenant_management"], [], ["update", "delete"], user),
    [viewWrapper, user],
  )

  const columns = useMemo(
    () =>
      getStockLocationsColumn(setUpdatingLocationId, user, hasActionPermission),
    [user, hasActionPermission],
  )

  const pagination: PaginationInfo = {
    currentPage: stockLocations?.current_page || 1,
    totalPages: stockLocations?.last_page || 1,
    totalItems: stockLocations?.total || 0,
    itemsPerPage: stockLocations?.per_page || 10,
    hasNextPage:
      (stockLocations?.current_page || 1) < (stockLocations?.last_page || 1),
    hasPreviousPage: (stockLocations?.current_page || 1) > 1,
  }

  const handleCreateStockLocation = () => {
    openDialog({
      title: "Create New Stock Location",
      description: "Add a new stock location",
      children: <CreateStockLocationsForm />,
      dialogClass: "sm:max-w-lg",
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
          headerTitle="Stock Locations"
          headerSubtitle="Create and manage stock locations"
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
            data={stockLocations?.data || []}
            columns={columns}
            pagination={pagination}
            useInertia={true}
            toolbar={
              <StockLocationsToolbar
                onCreateNew={handleCreateStockLocation}
                user={user}
              />
            }
            searchPlaceholder="Search stock location by name or tag..."
            emptyMessage="No stock locations have been added."
            isRowLoading={(item) => item.id === updatingLocationId}
          />
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
