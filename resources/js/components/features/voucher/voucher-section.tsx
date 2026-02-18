import { useMemo, useState } from "react"
import { SectionHeader } from "@/components/ui/common/section-header"
import { DataTable } from "@/components/ui/data-table"
import { PaginationInfo } from "@/components/ui/data-table/data-table-pagination"
import { APP_ASSETS } from "@/config/assets"
import { useDynamicDialog } from "@/hooks/ui/use-dynamic-dialog"
import { useRolePermissionFeatureViewer } from "@/hooks/ui/use-role-permission-viewer"
import { PaginatedVoucher, User } from "@/types"
import { CreateVoucherForm } from "./create-voucher-form"
import { getVoucherColumn } from "./voucher-column"
import { VoucherToolbar } from "./voucher-toolbar"
import { motion } from "framer-motion"
import { containerVariants, itemVariants } from "@/lib/animation-variants"
import { VoucherListExport } from "./voucher-list-export"

interface VoucherSectionProps {
  vouchers: PaginatedVoucher
  user: User
}

export const VoucherSection = ({ vouchers, user }: VoucherSectionProps) => {
  const { openDialog } = useDynamicDialog()
  const { viewWrapper } = useRolePermissionFeatureViewer()
  const [updatingVoucherId, setUpdatingVoucherId] = useState<number | null>(
    null,
  )

  const hasActionPermission = useMemo(
    () =>
      viewWrapper([], ["price_and_discount"], [], ["update", "delete"], user),
    [viewWrapper, user],
  )

  const columns = useMemo(
    () => getVoucherColumn(setUpdatingVoucherId, user, hasActionPermission),
    [user, hasActionPermission],
  )

  const pagination: PaginationInfo = {
    currentPage: vouchers?.current_page || 1,
    totalPages: vouchers?.last_page || 1,
    totalItems: vouchers?.total || 0,
    itemsPerPage: vouchers?.per_page || 10,
    hasNextPage: (vouchers?.current_page || 1) < (vouchers?.last_page || 1),
    hasPreviousPage: (vouchers?.current_page || 1) > 1,
  }

  const handleCreateVoucher = () => {
    openDialog({
      title: "Create New Voucher",
      description: "Add a new voucher",
      children: <CreateVoucherForm />,
      dialogClass: "sm:max-w-lg",
    })
  }

  const handleExportVoucher = () => {
    openDialog({
      title: "Export Item List",
      description: "Preview and download your item inventory report",
      children: (
        <VoucherListExport
          vouchers={vouchers?.data ?? []}
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
          headerTitle="Voucher"
          headerSubtitle="Create and Manage Vouchers"
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
            data={vouchers?.data || []}
            columns={columns}
            pagination={pagination}
            useInertia={true}
            toolbar={
              <VoucherToolbar
                onCreateNew={handleCreateVoucher}
                user={user}
                onExport={handleExportVoucher}
              />
            }
            searchPlaceholder="Search voucher by code or type..."
            emptyMessage="No vouchers have been added."
            isRowLoading={(item) => item.id === updatingVoucherId}
          />
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
