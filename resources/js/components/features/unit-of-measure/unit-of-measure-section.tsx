import { useMemo } from "react"
import { SectionHeader } from "@/components/ui/common/section-header"
import { DataTable } from "@/components/ui/data-table"
import { PaginationInfo } from "@/components/ui/data-table/data-table-pagination"
import { useDynamicDialog } from "@/hooks/ui/use-dynamic-dialog"
import { useRolePermissionFeatureViewer } from "@/hooks/ui/use-role-permission-viewer"
import { PaginatedUnitOfMeasure, User } from "@/types"
import { CreateUnitOfMeasureForm } from "./create-unit-of-measure-form"
import { getUnitOfMeasureColumn } from "./unit-of-measure-column"
import { UnitOfMeasureToolbar } from "./unit-of-measure-toolbar"
import { motion } from "framer-motion"
import {
  fadeInUp,
  fadeInUpLarge,
  staggerContainerSlow,
} from "@/lib/animation-variants"

interface UnitOfMeasureSectionProps {
  unitOfMeasure: PaginatedUnitOfMeasure
  updatingUomId?: number | null
  setUpdatingUomId?: (id: number | null) => void
  user: User
}

export const UnitOfMeasureSection = ({
  unitOfMeasure,
  updatingUomId,
  setUpdatingUomId,
  user,
}: UnitOfMeasureSectionProps) => {
  const { openDialog } = useDynamicDialog()
  const { viewWrapper } = useRolePermissionFeatureViewer()

  const hasActionPermission = useMemo(
    () => viewWrapper([], ["item_management"], [], ["update", "delete"], user),
    [viewWrapper, user],
  )

  const unitOfMeasureColumns = useMemo(
    () => getUnitOfMeasureColumn(setUpdatingUomId, user, hasActionPermission),
    [setUpdatingUomId, user, hasActionPermission],
  )

  const handleCreateUnitOfMeasure = () => {
    openDialog({
      title: "Create New Unit of Measure",
      description: "Add a new unit of measure for the items",
      children: <CreateUnitOfMeasureForm />,
      dialogClass: "sm:max-w-lg",
    })
  }

  const pagination: PaginationInfo = {
    currentPage: unitOfMeasure?.current_page || 1,
    totalPages: unitOfMeasure?.last_page || 1,
    totalItems: unitOfMeasure?.total || 0,
    itemsPerPage: unitOfMeasure?.per_page || 10,
    hasNextPage:
      (unitOfMeasure?.current_page || 1) < (unitOfMeasure?.last_page || 1),
    hasPreviousPage: (unitOfMeasure?.current_page || 1) > 1,
  }

  return (
    <motion.div
      className="space-y-4"
      initial="hidden"
      animate="visible"
      variants={staggerContainerSlow}
    >
      <motion.div variants={fadeInUp}>
        <SectionHeader
          headerTitle="Item Unit of Measure"
          headerSubtitle="Create and manage measurement units for items"
        />
      </motion.div>

      <motion.div variants={fadeInUpLarge}>
        <DataTable
          data={unitOfMeasure?.data || []}
          columns={unitOfMeasureColumns}
          pagination={pagination}
          useInertia={true}
          toolbar={
            <UnitOfMeasureToolbar
              user={user}
              onCreateNew={handleCreateUnitOfMeasure}
            />
          }
          searchPlaceholder="Search unit of measure..."
          emptyMessage="No units of measure found."
          isRowLoading={(item) => item.id === updatingUomId}
        />
      </motion.div>
    </motion.div>
  )
}
