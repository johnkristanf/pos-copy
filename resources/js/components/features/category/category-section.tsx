import { useMemo } from "react"
import { SectionHeader } from "@/components/ui/common/section-header"
import { DataTable } from "@/components/ui/data-table"
import { PaginationInfo } from "@/components/ui/data-table/data-table-pagination"
import { useDynamicDialog } from "@/hooks/ui/use-dynamic-dialog"
import { useRolePermissionFeatureViewer } from "@/hooks/ui/use-role-permission-viewer"
import { PaginatedCategories, User } from "@/types"
import { getCategoryColumn } from "./category-column"
import { CategoryToolbar } from "./category-toolbar"
import { CreateCategoryForm } from "./create-category-form"
import { motion } from "framer-motion"
import {
  fadeInUp,
  fadeInUpLarge,
  staggerContainerSlow,
} from "@/lib/animation-variants"

interface CategorySectionProps {
  categories: PaginatedCategories
  updatingCategoryId?: number | null
  setUpdatingCategoryId?: (id: number | null) => void
  user: User
}

export const CategorySection = ({
  categories,
  updatingCategoryId,
  setUpdatingCategoryId,
  user,
}: CategorySectionProps) => {
  const { openDialog } = useDynamicDialog()
  const { viewWrapper } = useRolePermissionFeatureViewer()

  const hasActionPermission = useMemo(
    () => viewWrapper([], ["item_management"], [], ["update", "delete"], user),
    [viewWrapper, user],
  )

  const categoryColumns = useMemo(
    () => getCategoryColumn(setUpdatingCategoryId, user, hasActionPermission),
    [setUpdatingCategoryId, user, hasActionPermission],
  )

  const handleCreateCategory = () => {
    openDialog({
      title: "Create New Category",
      description: "Add a new category for the items",
      children: <CreateCategoryForm />,
      dialogClass: "sm:max-w-lg",
    })
  }

  const pagination: PaginationInfo = {
    currentPage: categories?.current_page || 1,
    totalPages: categories?.last_page || 1,
    totalItems: categories?.total || 0,
    itemsPerPage: categories?.per_page || 10,
    hasNextPage: (categories?.current_page || 1) < (categories?.last_page || 1),
    hasPreviousPage: (categories?.current_page || 1) > 1,
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
          headerTitle="Category"
          headerSubtitle="Create and manage item categories"
        />
      </motion.div>

      <motion.div variants={fadeInUpLarge}>
        <DataTable
          data={categories?.data || []}
          columns={categoryColumns}
          pagination={pagination}
          useInertia={true}
          toolbar={
            <CategoryToolbar onCreateNew={handleCreateCategory} user={user} />
          }
          searchPlaceholder="Search category..."
          emptyMessage="No categories found."
          isRowLoading={(item) => item.id === updatingCategoryId}
        />
      </motion.div>
    </motion.div>
  )
}
