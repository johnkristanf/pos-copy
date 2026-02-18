import { motion } from "framer-motion"
import { useQueryState } from "nuqs"
import { useMemo } from "react"
import { ReturnHeader } from "@/components/ui/common/return-header"
import { ReturnToolbar } from "@/components/ui/common/return-toolbar"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/common/tabs"
import { DataTable } from "@/components/ui/data-table"
import { PaginationInfo } from "@/components/ui/data-table/data-table-pagination"
import { useDynamicDialog } from "@/hooks/ui/use-dynamic-dialog"
import { useRolePermissionFeatureViewer } from "@/hooks/ui/use-role-permission-viewer"
import { containerVariants, itemVariants } from "@/lib/animation-variants"
import { PaginatedReturnFromCustomer, StockLocation, User } from "@/types"
import { getReturnFromCustomerColumns } from "./return-from-customer-column"
import { ReturnFromCustomerForm } from "./return-from-customer-form"

interface ReturnFromCustomerSectionProps {
  user?: User
  returns: PaginatedReturnFromCustomer
  stockLocations: StockLocation[]
}

export const ReturnFromCustomerSection = ({
  user,
  returns,
  stockLocations,
}: ReturnFromCustomerSectionProps) => {
  const { viewWrapper } = useRolePermissionFeatureViewer()
  const { openDialog } = useDynamicDialog()

  const hasActionPermission = useMemo(
    () => viewWrapper([], ["return_from_customer"], [], ["read"], user),
    [viewWrapper, user],
  )

  const hasApprovePermission = useMemo(
    () => viewWrapper([], ["return_from_customer"], [], ["approve"], user),
    [viewWrapper, user],
  )

  const hasPrintPermission = useMemo(
    () => viewWrapper([], ["return_from_customer"], [], ["print"], user),
    [viewWrapper, user],
  )

  const [status, setStatus] = useQueryState("status", {
    defaultValue: "pending",
    shallow: false,
  })

  const returnFromCustomerColumns = useMemo(
    () =>
      getReturnFromCustomerColumns(
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
      title: "Create Return Form",
      description: "Add a return from customer request",
      children: <ReturnFromCustomerForm stockLocations={stockLocations} />,
    })
  }
  return (
    <motion.div
      className="space-y-3 sm:space-y-4"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div variants={itemVariants}>
        <ReturnHeader
          headerTitle="Return From Customer"
          headerSubtitle="Customer Return Authorization and Processing"
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
            data={returns.data}
            columns={returnFromCustomerColumns}
            pagination={pagination}
            useInertia={true}
            searchPlaceholder="Search return form by date..."
            toolbar={
              <ReturnToolbar
                onCreateNew={handleCreateNew}
                isOnReturnToCustomer={true}
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
