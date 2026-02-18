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
import { PaginatedSoldItem, User } from "@/types"
import { ItemSoldColumns } from "./item-sold-column"
import { SoldItemsExport } from "./item-sold-export"
import { SoldItemToolbar } from "./item-sold-toolbar"

interface ItemSoldSectionProps {
  updatingItemId?: number | null
  user: User
  soldItem: PaginatedSoldItem
}

export const ItemSoldSection = ({
  updatingItemId,
  user,
  soldItem,
}: ItemSoldSectionProps) => {
  const { openDialog } = useDynamicDialog()
  const { categories, supplier } = useItemsUtilityContext()
  const itemSoldColumns = useMemo(() => ItemSoldColumns(user), [user])

  const pagination: PaginationInfo = {
    currentPage: soldItem?.current_page || 1,
    totalPages: soldItem?.last_page || 1,
    totalItems: soldItem?.total || 0,
    itemsPerPage: soldItem?.per_page || 10,
    hasNextPage: !!soldItem?.next_page_url,
    hasPreviousPage: !!soldItem?.prev_page_url,
  }

  const handleExportItems = () => {
    openDialog({
      title: "Export Item Sold List",
      description: "Preview and download your item sold report",
      children: (
        <SoldItemsExport
          items={soldItem?.data ?? []}
          categories={categories || []}
          suppliers={supplier || []}
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
          headerTitle="Item Sold"
          headerSubtitle="Track and review sold items"
        />
      </motion.div>

      <motion.div variants={fadeInUpLarge}>
        <DataTable
          data={soldItem.data}
          pagination={pagination}
          columns={itemSoldColumns}
          useInertia={true}
          searchPlaceholder="Search by item or supplier..."
          customToolbar={
            <SoldItemToolbar onExport={handleExportItems} user={user} />
          }
          emptyMessage="No sold items as of the moment."
          isRowLoading={(item) => item.id === updatingItemId}
        />
      </motion.div>
    </motion.div>
  )
}
