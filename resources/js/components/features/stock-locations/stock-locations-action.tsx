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
import { StockLocation, User } from "@/types"
import { EditStockLocationsForm } from "./edit-stock-location-form"

interface StockLocationActionProps {
  stockLocation: StockLocation
  onActionStart?: (id: number | null) => void
  user?: User
}

export function StockLocationAction({
  stockLocation,
  onActionStart,
  user,
}: StockLocationActionProps) {
  const { openDialog, openConfirmation, closeDialog } = useDynamicDialog()
  const { viewWrapper } = useRolePermissionFeatureViewer()

  const canEdit = viewWrapper([], ["tenant_management"], [], ["update"], user)
  const canDelete = viewWrapper([], ["tenant_management"], [], ["delete"], user)

  const handleEdit = () => {
    openDialog({
      title: "Edit Stock Location",
      description: `Update details for ${stockLocation.name}`,
      children: <EditStockLocationsForm stockLocation={stockLocation} />,
    })
  }

  const handleDeleteStockLocation = async () => {
    onActionStart?.(stockLocation.id)

    await toast.promise(
      new Promise<void>((resolve, reject) => {
        router.delete(
          API_ROUTES.DELETE_STOCK_LOCATION(String(stockLocation.id)),
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
                    "Failed to delete stock location",
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
          <span className="animate-pulse">Deleting stock location...</span>
        ),
        success: "Stock location deleted successfully!",
        error: (error) => error.message || "Failed to delete stock location",
      },
    )
  }

  const handleConfirmDeleteStockLocation = () => {
    openConfirmation({
      title: "Delete Stock Location",
      description: `Are you sure you want to delete this stock location (${stockLocation.name})? This cannot be undone.`,
      type: "warning",
      onConfirm: handleDeleteStockLocation,
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
            <span className="text-xs">Edit Stock Location</span>
          </DropdownMenuItem>
        )}
        {canDelete && (
          <DropdownMenuItem
            onClick={handleConfirmDeleteStockLocation}
            className="text-destructive"
          >
            <Trash className="mr-2 size-4" />
            <span className="text-xs">Delete Stock Location</span>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
