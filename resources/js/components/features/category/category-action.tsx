import { router } from "@inertiajs/react"
import { Edit, MoreHorizontal, Trash } from "lucide-react"
import toast from "react-hot-toast"
import { Button } from "@/components/ui/common/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/common/dropdown-menu"
import { API_ROUTES } from "@/config/api-routes"
import { useDynamicDialog } from "@/hooks/ui/use-dynamic-dialog"
import { useRolePermissionFeatureViewer } from "@/hooks/ui/use-role-permission-viewer"
import { Category, User } from "@/types"
import { EditCategoryForm } from "./edit-category-form"

interface CategoryActionProps {
  category: Category
  onActionStart?: (id: number | null) => void
  user?: User
}

export function CategoryAction({
  category,
  onActionStart,
  user,
}: CategoryActionProps) {
  const { openDialog, openConfirmation, closeDialog } = useDynamicDialog()
  const { viewWrapper } = useRolePermissionFeatureViewer()

  const canEdit = viewWrapper([], ["item_management"], [], ["update"], user)
  const canDelete = viewWrapper([], ["item_management"], [], ["delete"], user)

  if (!canEdit && !canDelete) {
    return null
  }

  const handleEdit = () => {
    openDialog({
      title: "Edit Category",
      description: `Update details for ${category.name}`,
      children: <EditCategoryForm category={category} />,
      dialogClass: "sm:max-w-lg",
    })
  }

  const handleDeleteCategory = async () => {
    onActionStart?.(category.id)
    await toast.promise(
      new Promise<void>((resolve, reject) => {
        router.delete(API_ROUTES.DELETE_CATEGORY(category.id), {
          preserveScroll: true,
          onSuccess: () => {
            closeDialog()
            resolve()
          },
          onError: (errors) => {
            reject(
              new Error(
                (Object.values(errors)[0] as string) ||
                  "Failed to delete category",
              ),
            )
          },
          onFinish: () => {
            onActionStart?.(null)
          },
        })
      }),
      {
        loading: <span className="animate-pulse">Deleting category...</span>,
        success: "Category deleted successfully!",
        error: (error) => error.message || "Failed to delete category",
      },
    )
  }

  const handleConfirmDeleteCategory = () => {
    openConfirmation({
      title: "Delete Category",
      description: `Are you sure you want to delete this category (${category.name})? This cannot be undone.`,
      type: "warning",
      onConfirm: handleDeleteCategory,
      confirmText: "Confirm",
      cancelText: "Cancel",
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="size-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {canEdit && (
          <DropdownMenuItem onClick={handleEdit}>
            <Edit className="mr-2 size-4" />
            <span className="text-xs">Edit Category</span>
          </DropdownMenuItem>
        )}

        {canDelete && (
          <DropdownMenuItem
            onClick={handleConfirmDeleteCategory}
            className="text-destructive"
          >
            <Trash className="mr-2 size-4" />
            <span className="text-xs">Delete Category</span>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
