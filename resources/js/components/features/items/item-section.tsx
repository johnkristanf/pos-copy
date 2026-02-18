import { motion } from "framer-motion"
import { useEffect, useMemo } from "react"
import { useItemsUtilityContext } from "@/components/contexts/items-utility"
import { SectionHeader } from "@/components/ui/common/section-header"
import { DataTable } from "@/components/ui/data-table"
import { PaginationInfo } from "@/components/ui/data-table/data-table-pagination"
import { APP_ASSETS } from "@/config/assets"
import { useDynamicDialog } from "@/hooks/ui/use-dynamic-dialog"
import { useRolePermissionFeatureViewer } from "@/hooks/ui/use-role-permission-viewer"
import {
  fadeInUp,
  fadeInUpLarge,
  staggerContainerSlow,
} from "@/lib/animation-variants"
import { PaginatedItems, User } from "@/types"
import { CreateItemForm } from "./create-item-form"
import { getItemListColumn } from "./item-column"
import { ItemListExport } from "./item-list-export"
import { ItemToolbar } from "./item-toolbar"
import { useItemStore } from "./use-item-store"

interface ItemSectionProps {
  items: PaginatedItems
  updatingItemId?: number | null
  setUpdatingItemId?: (id: number | null) => void
  user: User
}

export const ItemSection = ({
  items,
  updatingItemId,
  setUpdatingItemId,
  user,
}: ItemSectionProps) => {
  const { openDialog } = useDynamicDialog()
  const { viewWrapper } = useRolePermissionFeatureViewer()

  const setDependencies = useItemStore((state) => state.setDependencies)
  const contextData = useItemsUtilityContext()

  useEffect(() => {
    setDependencies({
      items: items?.data || [],
      categories: contextData.categories || [],
      suppliers: contextData.supplier || [],
      unitOfMeasures: contextData.unit_of_measures || [],
    })
  }, [items, contextData, setDependencies])

  const hasActionPermission = useMemo(
    () => viewWrapper([], ["item_management"], [], ["update", "delete"], user),
    [viewWrapper, user],
  )

  const itemListColumn = useMemo(
    () =>
      items
        ? getItemListColumn(
            contextData.categories,
            contextData.supplier,
            contextData.unit_of_measures,
            items.data,
            setUpdatingItemId,
            user,
            hasActionPermission,
          )
        : [],
    [
      contextData.categories,
      contextData.supplier,
      contextData.unit_of_measures,
      items,
      setUpdatingItemId,
      user,
      hasActionPermission,
    ],
  )

  const pagination: PaginationInfo = {
    currentPage: items?.current_page ?? 1,
    totalPages: items?.last_page ?? 1,
    totalItems: items?.total ?? 0,
    itemsPerPage: items?.per_page ?? 10,
    hasNextPage: (items?.current_page ?? 1) < (items?.last_page ?? 1),
    hasPreviousPage: (items?.current_page ?? 1) > 1,
  }

  const handleCreateItem = () => {
    openDialog({
      title: "Create New Item",
      description: "Add a new item to the inventory",
      children: <CreateItemForm />,
    })
  }

  const handleExportItems = () => {
    openDialog({
      title: "Export Item List",
      description: "Preview and download your item inventory report",
      children: (
        <ItemListExport
          items={items?.data ?? []}
          categories={contextData.categories || []}
          suppliers={contextData.supplier || []}
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
          headerTitle="Item List"
          headerSubtitle="Complete item listing and management"
        />
      </motion.div>

      <motion.div variants={fadeInUpLarge}>
        <DataTable
          data={items?.data ?? []}
          pagination={pagination}
          columns={itemListColumn}
          useInertia={true}
          searchPlaceholder="Search by item or supplier..."
          customToolbar={
            <ItemToolbar
              createItem={handleCreateItem}
              user={user}
              onExport={handleExportItems}
              items={items?.data ?? []}
              categories={contextData.categories}
              suppliers={contextData.supplier}
            />
          }
          emptyMessage="No items have been added."
          isRowLoading={(item) => item.id === updatingItemId}
        />
      </motion.div>
    </motion.div>
  )
}
