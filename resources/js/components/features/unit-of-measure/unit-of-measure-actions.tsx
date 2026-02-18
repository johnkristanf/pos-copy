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
import { UnitOfMeasure, User } from "@/types"
import { EditUnitOfMeasureForm } from "./edit-unit-of-measure-form"

interface UnitOfMeasureActionProps {
  unitOfMeasure: UnitOfMeasure
  onActionStart?: (id: number | null) => void
  user?: User
}

export function UnitOfMeasureAction({
  unitOfMeasure,
  onActionStart,
  user,
}: UnitOfMeasureActionProps) {
  const { openDialog, openConfirmation, closeDialog } = useDynamicDialog()
  const { viewWrapper } = useRolePermissionFeatureViewer()

  const canEdit = viewWrapper([], ["item_management"], [], ["update"], user)
  const canDelete = viewWrapper([], ["item_management"], [], ["delete"], user)

  const handleEdit = () => {
    openDialog({
      title: "Edit Unit Of Measure",
      description: `Update details for ${unitOfMeasure.name}`,
      children: <EditUnitOfMeasureForm unitOfMeasure={unitOfMeasure} />,
    })
  }

  const handleDeleteUnitOfMeasure = async () => {
    onActionStart?.(unitOfMeasure.id)

    await toast.promise(
      new Promise<void>((resolve, reject) => {
        router.delete(
          API_ROUTES.DELETE_UNIT_OF_MEASURE(String(unitOfMeasure.id)),
          {
            preserveScroll: true,
            onSuccess: () => {
              closeDialog()
              resolve()
            },
            onError: (errors) => {
              reject(
                new Error(
                  (Object.values(errors)[0] as string) ||
                    "Failed to delete unit of measure",
                ),
              )
            },
            onFinish: () => {
              onActionStart?.(null)
            },
          },
        )
      }),
      {
        loading: (
          <span className="animate-pulse">Deleting unit of measure...</span>
        ),
        success: "Unit of measure deleted successfully!",
        error: (error) => error.message || "Failed to delete unit of measure",
      },
    )
  }

  const handleConfirmDeleteCategory = () => {
    openConfirmation({
      title: "Delete Category",
      description: `Are you sure you want to delete this unit of measure (${unitOfMeasure.name})? This cannot be undone.`,
      type: "warning",
      onConfirm: handleDeleteUnitOfMeasure,
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
            <span className="text-xs">Edit Unit of Measure</span>
          </DropdownMenuItem>
        )}
        {canDelete && (
          <DropdownMenuItem
            onClick={handleConfirmDeleteCategory}
            className="text-destructive"
          >
            <Trash className="mr-2 size-4" />
            <span className="text-xs">Delete Unit of Measure</span>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
