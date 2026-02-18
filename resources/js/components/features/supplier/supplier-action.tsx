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
import { Supplier, User } from "@/types"
import { EditSupplierForm } from "./edit-supplier"

interface SupplierActionsProps {
  supplier: Supplier
  onActionStart?: (id: number | null) => void
  user?: User
}

export function SupplierAction({
  supplier,
  onActionStart,
  user,
}: SupplierActionsProps) {
  const { openDialog, openConfirmation, closeDialog } = useDynamicDialog()
  const { viewWrapper } = useRolePermissionFeatureViewer()

  const canEdit = viewWrapper([], ["return_to_supplier"], [], ["update"], user)
  const canDelete = viewWrapper(
    [],
    ["return_to_supplier"],
    [],
    ["delete"],
    user,
  )

  const handleEdit = () => {
    openDialog({
      title: "Edit Supplier",
      description: `Update details for ${supplier.name}`,
      children: <EditSupplierForm supplier={supplier} />,
    })
  }

  const handleDeleteSupplier = async () => {
    onActionStart?.(supplier.id)

    await toast.promise(
      new Promise<void>((resolve, reject) => {
        router.delete(API_ROUTES.DELETE_SUPPLIER(String(supplier.id)), {
          preserveScroll: true,
          onSuccess: () => {
            closeDialog()
            resolve()
          },
          onError: (errors) => {
            reject(
              new Error(
                (Object.values(errors)[0] as string) ||
                  "Failed to delete supplier",
              ),
            )
          },
          onFinish: () => {
            onActionStart?.(null)
          },
        })
      }),
      {
        loading: <span className="animate-pulse">Deleting supplier...</span>,
        success: "Supplier deleted successfully!",
        error: (error) => error.message || "Failed to delete supplier",
      },
    )
  }

  const handleConfirmDeleteCategory = () => {
    openConfirmation({
      title: "Delete Supplier",
      description: `Are you sure you want to delete this supplier (${supplier.name})? This cannot be undone.`,
      type: "warning",
      onConfirm: handleDeleteSupplier,
      confirmText: "Confirm",
      cancelText: "Cancel",
    })
  }

  if (!canEdit && !canDelete) {
    return null
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
            <span className="text-xs">Edit Supplier</span>
          </DropdownMenuItem>
        )}
        {canDelete && (
          <DropdownMenuItem
            onClick={handleConfirmDeleteCategory}
            className="text-destructive"
          >
            <Trash className="mr-2 size-4" />
            <span className="text-xs">Delete Supplier</span>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
