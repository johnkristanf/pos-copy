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
import { Category, Item, Supplier, UnitOfMeasure, User } from "@/types"
import { EditItemForm } from "./edit-item-form"

interface ItemActionsProps {
  category: Category[]
  supplier: Supplier[]
  unit_of_measures: UnitOfMeasure[]
  items: Item[]
  item: Item
  onActionStart?: (id: number | null) => void
  user?: User
  onPrint?: (item: Item) => void
}

export const ItemAction = ({
  category,
  supplier,
  unit_of_measures,
  items,
  item,
  onActionStart,
  user,
  onPrint,
}: ItemActionsProps) => {
  const { openDialog, openConfirmation, closeDialog } = useDynamicDialog()
  const { viewWrapper } = useRolePermissionFeatureViewer()

  const canEdit = viewWrapper([], ["item_management"], [], ["update"], user)
  const canDelete = viewWrapper([], ["item_management"], [], ["delete"], user)
  const canPrint = viewWrapper([], ["item_management"], [], ["print"], user)

  if (!canEdit && !canDelete && !canPrint) {
    return null
  }

  const handleEdit = () => {
    openDialog({
      title: "Edit Item",
      description: `Update details for ${item.description}`,
      children: (
        <EditItemForm
          category={category}
          supplier={supplier}
          unit_of_measures={unit_of_measures}
          items={items}
          item={item}
        />
      ),
    })
  }

  const handleDeleteItem = async () => {
    onActionStart?.(item.id)

    await toast.promise(
      new Promise<void>((resolve, reject) => {
        router.delete(API_ROUTES.DELETE_ITEM(String(item.id)), {
          preserveScroll: true,
          onSuccess: () => {
            closeDialog()
            resolve()
          },
          onError: (errors) => {
            reject(
              new Error(
                (Object.values(errors)[0] as string) || "Failed to delete item",
              ),
            )
          },
          onFinish: () => {
            onActionStart?.(null)
          },
        })
      }),
      {
        loading: <span className="animate-pulse">Deleting item...</span>,
        success: "Item deleted successfully!",
        error: (error) => error.message || "Failed to delete item",
      },
    )
  }

  const handleConfirmDeleteItem = () => {
    openConfirmation({
      title: "Delete Item",
      description: `Are you sure you want to delete this item (${item.description})? This cannot be undone.`,
      type: "warning",
      onConfirm: handleDeleteItem,
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
            <span className="text-xs">Edit Item</span>
          </DropdownMenuItem>
        )}

        {canPrint && onPrint && (
          <DropdownMenuItem onClick={() => onPrint(item)}>
            <Printer className="mr-2 size-4" />
            <span className="text-xs">Print</span>
          </DropdownMenuItem>
        )}

        {canDelete && (
          <DropdownMenuItem
            onClick={handleConfirmDeleteItem}
            className="text-destructive"
          >
            <Trash className="mr-2 size-4" />
            <span className="text-xs">Delete Item</span>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
