import { ReturnHeader } from "@/components/ui/common/return-header"
import { ReturnToolbar } from "@/components/ui/common/return-toolbar"
import { DataTable } from "@/components/ui/data-table"
import { useDynamicDialog } from "@/hooks/ui/use-dynamic-dialog"
import { ReturnToSupplierForm } from "./return-to-supplier-form"
import { PaginationInfo } from "@/components/ui/data-table/data-table-pagination"
import { getReturnToSupplierColumn } from "./return-to-supplier-column"
import { useMemo } from "react"
import { PaginatedReturnToSupplier, User } from "@/types"
import { useRolePermissionFeatureViewer } from "@/hooks/ui/use-role-permission-viewer"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/common/tabs"
import { useQueryState } from "nuqs"
import { motion } from "framer-motion"
import { containerVariants, itemVariants } from "@/lib/animation-variants"

interface ReturnToSupplierSectionProps {
  user?: User
  returns?: PaginatedReturnToSupplier
}

export const ReturnToSupplierSection = ({
  user,
  returns,
}: ReturnToSupplierSectionProps) => {
  const { viewWrapper } = useRolePermissionFeatureViewer()
  const { openDialog } = useDynamicDialog()

  const hasActionPermission = useMemo(
    () => viewWrapper([], ["return_to_supplier"], [], ["read"], user),
    [viewWrapper, user],
  )

  const hasApprovePermission = useMemo(
    () => viewWrapper([], ["return_to_supplier"], [], ["approve"], user),
    [viewWrapper, user],
  )

  const hasPrintPermission = useMemo(
    () => viewWrapper([], ["return_to_supplier"], [], ["print"], user),
    [viewWrapper, user],
  )

  const [status, setStatus] = useQueryState("status", {
    defaultValue: "pending",
    shallow: false,
  })

  const returnFromSupplierColumn = useMemo(
    () =>
      getReturnToSupplierColumn(
        hasActionPermission,
        hasApprovePermission,
        hasPrintPermission,
        status,
      ),
    [hasActionPermission, hasApprovePermission, hasPrintPermission, status],
  )

  const pagination: PaginationInfo = {
    currentPage: returns?.current_page || 1,
    totalPages: returns?.last_page || 1,
    totalItems: returns?.total || 0,
    itemsPerPage: returns?.per_page || 10,
    hasNextPage: (returns?.current_page || 1) < (returns?.last_page || 1),
    hasPreviousPage: (returns?.current_page || 1) > 1,
  }

  const handleCreateNew = () => {
    openDialog({
      title: "Create Return To Supplier Form",
      description: "Add a return to supplier request",
      children: <ReturnToSupplierForm />,
    })
  }

  return (
    <motion.div
      key={user?.id}
      className="space-y-3 sm:space-y-4"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div variants={itemVariants}>
        <ReturnHeader
          headerTitle="Return to Supplier"
          headerSubtitle="Supplier Return Authorization and Processing"
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
            key={`${user?.id}-${status}`}
            data={returns?.data || []}
            columns={returnFromSupplierColumn}
            pagination={pagination}
            useInertia={true}
            searchPlaceholder="Search return form by date..."
            toolbar={
              <ReturnToolbar
                onCreateNew={handleCreateNew}
                isOnReturnToSupplier={true}
                user={user}
              />
            }
            emptyMessage="No items have been added for this return."
          />
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
