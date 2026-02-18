import { router } from "@inertiajs/react"
import { Edit, MoreHorizontal, Printer, Trash } from "lucide-react"
import toast from "react-hot-toast"
import {
  ItemsUtilityProvider,
  useItemsUtilityContext,
} from "@/components/contexts/items-utility"
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
import { Discount, User } from "@/types"
import { EditDiscountForm } from "./edit-discount-form"

interface DiscountActionsProps {
  discount: Discount
  onActionStart?: (id: number | null) => void
  user?: User
  onPrint?: (discount: Discount) => void
}

export function DiscountAction({
  discount,
  onActionStart,
  user,
  onPrint,
}: DiscountActionsProps) {
  const { openDialog, openConfirmation, closeDialog } = useDynamicDialog()
  const contextData = useItemsUtilityContext()
  const { viewWrapper } = useRolePermissionFeatureViewer()

  const canEdit = viewWrapper([], ["price_and_discount"], [], ["update"], user)
  const canDelete = viewWrapper(
    [],
    ["price_and_discount"],
    [],
    ["delete"],
    user,
  )
  const canPrint = viewWrapper([], ["price_and_discount"], [], ["print"], user)

  const handleEdit = () => {
    openDialog({
      title: "Edit Discount",
      description: `Update details for ${discount.name}`,
      children: (
        <ItemsUtilityProvider
          items={contextData.items}
          categories={contextData.categories}
          supplier={contextData.supplier}
        >
          <EditDiscountForm discount={discount} />
        </ItemsUtilityProvider>
      ),
    })
  }

  const handleDeleteDiscount = async () => {
    onActionStart?.(discount.id)

    await toast.promise(
      new Promise<void>((resolve, reject) => {
        router.delete(API_ROUTES.DELETE_DISCOUNT(String(discount.id)), {
          preserveScroll: true,
          onSuccess: () => {
            closeDialog()
            resolve()
          },
          onError: (errors) => {
            reject(
              new Error(
                (Object.values(errors)[0] as string) ||
                  "Failed to delete discount",
              ),
            )
          },
          onFinish: () => {
            onActionStart?.(null)
          },
        })
      }),
      {
        loading: <span className="animate-pulse">Deleting discount...</span>,
        success: "Discount deleted successfully!",
        error: (error) => error.message || "Failed to delete discount",
      },
    )
  }

  const handleConfirmDeleteDiscount = () => {
    openConfirmation({
      title: "Delete Discount",
      description: `Are you sure you want to delete this discount (${discount.name})? This cannot be undone.`,
      type: "warning",
      onConfirm: handleDeleteDiscount,
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
            <span className="text-xs">Edit Discount</span>
          </DropdownMenuItem>
        )}

        {canPrint && onPrint && (
          <DropdownMenuItem onClick={() => onPrint(discount)}>
            <Printer className="mr-2 size-4" />
            <span className="text-xs">Print</span>
          </DropdownMenuItem>
        )}

        {canDelete && (
          <DropdownMenuItem
            onClick={handleConfirmDeleteDiscount}
            className="text-destructive"
          >
            <Trash className="mr-2 size-4" />
            <span className="text-xs">Delete Discount</span>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
