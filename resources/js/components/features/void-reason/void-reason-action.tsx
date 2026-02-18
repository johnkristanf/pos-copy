import { router } from "@inertiajs/react"
import { Edit, MoreHorizontal, Printer, Trash } from "lucide-react"
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
import { Role, User, VoidReason } from "@/types"
import { EditVoidReasonForm } from "./edit-void-reason-form"

interface VoidReasonActionsProps {
  voidReason: VoidReason
  onActionStart?: (id: number | null) => void
  user?: User
  roles?: Role[]
  onPrint?: (voidReason: VoidReason) => void
}

export function VoidReasonAction({
  voidReason,
  onActionStart,
  user,
  roles,
  onPrint,
}: VoidReasonActionsProps) {
  const { openDialog, openConfirmation, closeDialog } = useDynamicDialog()
  const { viewWrapper } = useRolePermissionFeatureViewer()

  const canEdit = viewWrapper(
    [],
    [
      "price_and_discount",
      "override_order_wholesale_discount",
      "item_wholesale_discount",
    ],
    [],
    ["update"],
    user,
  )
  const canDelete = viewWrapper(
    [],
    [
      "price_and_discount",
      "override_order_wholesale_discount",
      "item_wholesale_discount",
    ],
    [],
    ["delete"],
    user,
  )
  const canPrint = viewWrapper(
    [],
    [
      "price_and_discount",
      "override_order_wholesale_discount",
      "item_wholesale_discount",
    ],
    [],
    ["print"],
    user,
  )

  const handleEdit = () => {
    openDialog({
      title: "Edit Void Reason",
      description: `Update details for "${voidReason.void_reason}"`,
      children: (
        <EditVoidReasonForm roles={roles || []} voidReason={voidReason} />
      ),
    })
  }

  const handleDeleteVoidReason = async () => {
    onActionStart?.(voidReason.id)

    await toast.promise(
      new Promise<void>((resolve, reject) => {
        router.delete(API_ROUTES.DELETE_VOID_REASON(voidReason.id), {
          preserveScroll: true,
          onSuccess: () => {
            closeDialog()
            resolve()
          },
          onError: (errors) => {
            reject(
              new Error(
                (Object.values(errors)[0] as string) ||
                  "Failed to delete void reason",
              ),
            )
          },
          onFinish: () => {
            onActionStart?.(null)
          },
        })
      }),
      {
        loading: <span className="animate-pulse">Deleting void reason...</span>,
        success: "Void reason deleted successfully!",
        error: (error) => error.message || "Failed to delete void reason",
      },
    )
  }

  const handleConfirmDeleteVoidReason = () => {
    openConfirmation({
      title: "Delete Void Reason",
      description: `Are you sure you want to delete "${voidReason.void_reason}"? This cannot be undone.`,
      type: "warning",
      onConfirm: handleDeleteVoidReason,
      confirmText: "Confirm",
      cancelText: "Cancel",
    })
  }

  if (!canEdit && !canDelete && !canPrint) {
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
            <span className="text-xs">Edit Void Reason</span>
          </DropdownMenuItem>
        )}

        {canPrint && onPrint && (
          <DropdownMenuItem onClick={() => onPrint(voidReason)}>
            <Printer className="mr-2 size-4" />
            <span className="text-xs">Print</span>
          </DropdownMenuItem>
        )}

        {canDelete && (
          <DropdownMenuItem
            onClick={handleConfirmDeleteVoidReason}
            className="text-destructive"
          >
            <Trash className="mr-2 size-4" />
            <span className="text-xs">Delete Void Reason</span>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
