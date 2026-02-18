// resources/js/components/features/price/price-action.tsx

import { router } from "@inertiajs/react"
import { Edit, MoreHorizontal, Plus, Printer, Trash } from "lucide-react"
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
import { ItemPrice, User } from "@/types"
import { CreateItemPriceForm } from "./create-price-form"
import { UpdateItemPriceForm } from "./edit-price-form"

interface PriceActionsProps {
  item_price: ItemPrice
  onActionStart?: (id: number | null) => void
  user?: User
  onPrint?: (item_price: ItemPrice) => void
}

export const PriceAction = ({
  item_price,
  onActionStart,
  user,
  onPrint,
}: PriceActionsProps) => {
  const { openDialog, openConfirmation, closeDialog } = useDynamicDialog()
  const { viewWrapper } = useRolePermissionFeatureViewer()

  // Fixed: Determine if the item has an existing price
  const hasPrice = !!item_price.selling_prices

  const canCreate = viewWrapper(
    [],
    ["price_and_discount"],
    [],
    ["create"],
    user,
  )

  const canUpdate = viewWrapper(
    [],
    ["price_and_discount"],
    [],
    ["update"],
    user,
  )

  const canDelete = viewWrapper(
    [],
    ["price_and_discount"],
    [],
    ["delete"],
    user,
  )

  const canPrint = viewWrapper([], ["price_and_discount"], [], ["print"], user)

  if (!canCreate && !canUpdate && !canDelete && !canPrint) {
    return null
  }

  const handleCreate = () => {
    openDialog({
      title: "Create Item's Price",
      description: `Create price for ${item_price.description}`,
      children: <CreateItemPriceForm item_price={item_price} />,
    })
  }

  const handleEdit = () => {
    openDialog({
      title: "Update Item's Price",
      description: `Update price for ${item_price.description}`,
      children: <UpdateItemPriceForm item_price={item_price} />,
    })
  }

  const handleDeletePrice = async () => {
    onActionStart?.(item_price.id)

    await toast.promise(
      new Promise<void>((resolve, reject) => {
        router.delete(API_ROUTES.DETACH_PRICE(String(item_price.id)), {
          preserveScroll: true,
          onSuccess: () => {
            closeDialog()
            resolve()
          },
          onError: (errors) => {
            reject(
              new Error(
                (Object.values(errors)[0] as string) ||
                  "Failed to delete price",
              ),
            )
          },
          onFinish: () => {
            onActionStart?.(null)
          },
        })
      }),
      {
        loading: (
          <span className="animate-pulse">Deleting item's price...</span>
        ),
        success: "Item's price deleted successfully!",
        error: (error) => error.message || "Failed to delete item's price",
      },
    )
  }

  const handleConfirmDeletePrice = () => {
    openConfirmation({
      title: "Delete Item's Price",
      description: `Are you sure you want to delete the current price of this item (${item_price.description})? This cannot be undone.`,
      type: "warning",
      onConfirm: handleDeletePrice,
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

        {canCreate && !hasPrice && (
          <DropdownMenuItem onClick={handleCreate}>
            <Plus className="mr-2 size-4" />
            <span className="text-xs">Create Price</span>
          </DropdownMenuItem>
        )}

        {canUpdate && hasPrice && (
          <DropdownMenuItem onClick={handleEdit}>
            <Edit className="mr-2 size-4" />
            <span className="text-xs">Update Price</span>
          </DropdownMenuItem>
        )}

        {canPrint && onPrint && (
          <DropdownMenuItem onClick={() => onPrint(item_price)}>
            <Printer className="mr-2 size-4" />
            <span className="text-xs">Print</span>
          </DropdownMenuItem>
        )}

        {canDelete && hasPrice && (
          <DropdownMenuItem
            onClick={handleConfirmDeletePrice}
            className="text-destructive"
          >
            <Trash className="mr-2 size-4" />
            <span className="text-xs">Delete Price</span>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
