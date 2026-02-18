import { useMemo, useState } from "react"
import { SectionHeader } from "@/components/ui/common/section-header"
import { DataTable } from "@/components/ui/data-table"
import { PaginationInfo } from "@/components/ui/data-table/data-table-pagination"
import { APP_ASSETS } from "@/config/assets"
import { useDynamicDialog } from "@/hooks/ui/use-dynamic-dialog"
import { useRolePermissionFeatureViewer } from "@/hooks/ui/use-role-permission-viewer"
import { PaginatedVoidReasons, Role, User } from "@/types"
import { CreateVoidReasonForm } from "./create-void-reason-form"
import { getVoidReasonsColumn } from "./void-reason-column"
import { VoidReasonToolbar } from "./void-reason-toolbar"
import { motion } from "framer-motion"
import { containerVariants, itemVariants } from "@/lib/animation-variants"
import { VoidReasonListExport } from "./void-reason-list-export"

interface VoidReasonSectionProps {
  voidReason: PaginatedVoidReasons
  user: User
  roles: Role[]
}

export const VoidReasonSection = ({
  voidReason,
  user,
  roles,
}: VoidReasonSectionProps) => {
  const { openDialog } = useDynamicDialog()
  const { viewWrapper } = useRolePermissionFeatureViewer()
  const [updatingVoidReasonId, setUpdatingVoidReasonId] = useState<
    number | null
  >(null)

  const hasActionPermission = useMemo(
    () =>
      viewWrapper(
        [],
        [
          "price_and_discount",
          "override_order_wholesale_discount",
          "item_wholesale_discount",
        ],
        [],
        ["update", "delete"],
        user,
      ),
    [viewWrapper, user],
  )

  const columns = useMemo(
    () =>
      getVoidReasonsColumn(
        setUpdatingVoidReasonId,
        user,
        hasActionPermission,
        roles,
      ),
    [user, hasActionPermission],
  )

  const pagination: PaginationInfo = {
    currentPage: voidReason?.current_page || 1,
    totalPages: voidReason?.last_page || 1,
    totalItems: voidReason?.total || 0,
    itemsPerPage: voidReason?.per_page || 10,
    hasNextPage: (voidReason?.current_page || 1) < (voidReason?.last_page || 1),
    hasPreviousPage: (voidReason?.current_page || 1) > 1,
  }

  const handleCreateVoidReason = () => {
    openDialog({
      title: "Create New Void Reason",
      description: "Add a new void reason",
      children: <CreateVoidReasonForm roles={roles} />,
      dialogClass: "sm:max-w-lg",
    })
  }

  const handleExportVoidReason = () => {
    openDialog({
      title: "Export Item List",
      description: "Preview and download your item inventory report",
      children: (
        <VoidReasonListExport
          voidReasons={voidReason?.data ?? []}
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
          headerTitle="Void Reason"
          headerSubtitle="Create and Manage Void Reasons"
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
            data={voidReason?.data || []}
            columns={columns}
            pagination={pagination}
            useInertia={true}
            toolbar={
              <VoidReasonToolbar
                onCreateNew={handleCreateVoidReason}
                onExport={handleExportVoidReason}
                user={user}
              />
            }
            searchPlaceholder="Search void reason by code or type..."
            emptyMessage="No void reasons have been added."
            isRowLoading={(item) => item.id === updatingVoidReasonId}
          />
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
