import { useMemo } from "react"
import { SectionHeader } from "@/components/ui/common/section-header"
import { DataTable } from "@/components/ui/data-table"
import { PaginationInfo } from "@/components/ui/data-table/data-table-pagination"
import { useDynamicDialog } from "@/hooks/ui/use-dynamic-dialog"
import { useRolePermissionFeatureViewer } from "@/hooks/ui/use-role-permission-viewer"
import { PaginatedSupplier, User } from "@/types"
import { CreateSupplierForm } from "./create-supplier-form"
import { getSupplierColumn } from "./supplier-column"
import { SupplierToolbar } from "./supplier-toolbar"
import { motion } from "framer-motion"
import {
  fadeInUp,
  fadeInUpLarge,
  staggerContainerSlow,
} from "@/lib/animation-variants"

interface SupplierSectionProps {
  supplier: PaginatedSupplier
  updatingSupplierId?: number | null
  setUpdatingSupplierId?: (id: number | null) => void
  user: User
}

export const SupplierSection = ({
  supplier,
  updatingSupplierId,
  setUpdatingSupplierId,
  user,
}: SupplierSectionProps) => {
  const { openDialog } = useDynamicDialog()
  const { viewWrapper } = useRolePermissionFeatureViewer()

  const hasActionPermission = useMemo(
    () =>
      viewWrapper([], ["return_to_supplier"], [], ["update", "delete"], user),
    [viewWrapper, user],
  )

  const supplierColumns = useMemo(
    () => getSupplierColumn(setUpdatingSupplierId, user, hasActionPermission),
    [setUpdatingSupplierId, user, hasActionPermission],
  )

  const handleCreateSupplier = () => {
    openDialog({
      title: "Create New Supplier",
      description: "Add a new supplier to the list",
      children: <CreateSupplierForm />,
    })
  }

  const pagination: PaginationInfo = {
    currentPage: supplier?.current_page || 1,
    totalPages: supplier?.last_page || 1,
    totalItems: supplier?.total || 0,
    itemsPerPage: supplier?.per_page || 10,
    hasNextPage: (supplier?.current_page || 1) < (supplier?.last_page || 1),
    hasPreviousPage: (supplier?.current_page || 1) > 1,
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
          headerTitle="Supplier"
          headerSubtitle="Manage item suppliers and vendor information"
        />
      </motion.div>

      <motion.div variants={fadeInUpLarge}>
        <DataTable
          data={supplier?.data || []}
          columns={supplierColumns}
          pagination={pagination}
          useInertia={true}
          toolbar={
            <SupplierToolbar user={user} onCreateNew={handleCreateSupplier} />
          }
          searchPlaceholder="Search supplier by name, address, or terms..."
          emptyMessage="No available supplier as of the moment."
          isRowLoading={(item) => item.id === updatingSupplierId}
        />
      </motion.div>
    </motion.div>
  )
}
