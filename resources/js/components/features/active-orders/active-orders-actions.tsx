import { MoreHorizontal, XCircle } from "lucide-react"
import { Button } from "@/components/ui/common/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/common/dropdown-menu"
import { useDynamicDialog } from "@/hooks/ui/use-dynamic-dialog"
import { useRolePermissionFeatureViewer } from "@/hooks/ui/use-role-permission-viewer"
import { Order, User } from "@/types"
import { OverrideVoidOrderForm } from "./override-void-order-form"

interface ActiveOrdersActionsProps {
  order: Order
  user?: User
}

export const ActiveOrdersActions = ({ order }: ActiveOrdersActionsProps) => {
  const { viewWrapper } = useRolePermissionFeatureViewer()
  const { openDialog, closeDialog } = useDynamicDialog()

  const canCancel = viewWrapper([], ["create_order"], [], ["delete"])

  const handleVoidOrder = () => {
    return openDialog({
      title: "Void Order",
      description: "Void this specific order",
      children: (
        <OverrideVoidOrderForm
          orderId={order.id}
          onSuccess={closeDialog}
          onCancel={closeDialog}
        />
      ),
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {canCancel && (
          <DropdownMenuItem className="text-black" onSelect={handleVoidOrder}>
            <XCircle className="mr-2 h-4 w-4" />
            Void Order
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
