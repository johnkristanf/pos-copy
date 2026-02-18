import { motion } from "framer-motion"
import { useMemo, useState } from "react"
import {
  ItemsUtilityProvider,
  useItemsUtilityContext,
} from "@/components/contexts/items-utility"
import { SectionHeader } from "@/components/ui/common/section-header"
import { DataTable } from "@/components/ui/data-table"
import { PaginationInfo } from "@/components/ui/data-table/data-table-pagination"
import { APP_ASSETS } from "@/config/assets"
import { useDynamicDialog } from "@/hooks/ui/use-dynamic-dialog"
import { useRolePermissionFeatureViewer } from "@/hooks/ui/use-role-permission-viewer"
import { containerVariants, itemVariants } from "@/lib/animation-variants"
import { PaginatedDiscount, User } from "@/types"
import { CreateDiscountForm } from "./create-discount-form"
import { getDiscountColumn } from "./discount-column"
import { DiscountListExport } from "./discount-list-export"
import { DiscountToolbar } from "./discount-toolbar"

interface DiscountSectionProps {
  discounts: PaginatedDiscount
  user: User
}

export const DiscountSection = ({ discounts, user }: DiscountSectionProps) => {
  const { openDialog } = useDynamicDialog()
  const { viewWrapper } = useRolePermissionFeatureViewer()
  const contextData = useItemsUtilityContext()
  const [updatingDiscountId, setUpdatingDiscountId] = useState<number | null>(
    null,
  )

  const hasActionPermission = useMemo(
    () =>
      viewWrapper([], ["price_and_discount"], [], ["update", "delete"], user),
    [viewWrapper, user],
  )

  const discountColumns = useMemo(
    () => getDiscountColumn(setUpdatingDiscountId, user, hasActionPermission),
    [user, hasActionPermission],
  )

  const handleCreateDiscount = () => {
    openDialog({
      title: "Create New Discount",
      description: "Add a new discount for the items",
      children: (
        <ItemsUtilityProvider
          items={contextData.items}
          categories={contextData.categories}
          supplier={contextData.supplier}
        >
          <CreateDiscountForm />
        </ItemsUtilityProvider>
      ),
      dialogClass: "sm:max-w-2xl",
    })
  }

  const handleExportVoidReason = () => {
    openDialog({
      title: "Export Item List",
      description: "Preview and download your item inventory report",
      children: (
        <DiscountListExport
          discounts={discounts?.data ?? []}
          logo={APP_ASSETS.COMPANY_LOGO_PNG}
        />
      ),
    })
  }

  const pagination: PaginationInfo = {
    currentPage: discounts?.current_page ?? 1,
    totalPages: discounts?.last_page ?? 1,
    totalItems: discounts?.total ?? 0,
    itemsPerPage: discounts?.per_page ?? 10,
    hasNextPage: (discounts?.current_page ?? 1) < (discounts?.last_page ?? 1),
    hasPreviousPage: (discounts?.current_page ?? 1) > 1,
  }

  return (
    <motion.div
      className="space-y-3 sm:space-y-4"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div variants={itemVariants}>
        <SectionHeader
          headerTitle="Discount"
          headerSubtitle="Create and Manage Discounts"
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
            data={discounts?.data || []}
            pagination={pagination}
            columns={discountColumns}
            useInertia={true}
            toolbar={
              <DiscountToolbar
                onCreateNew={handleCreateDiscount}
                onExport={handleExportVoidReason}
                user={user}
              />
            }
            searchPlaceholder="Search discount by name..."
            emptyMessage="No defined discount as of the moment."
            isRowLoading={(item) => item.id === updatingDiscountId}
          />
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
