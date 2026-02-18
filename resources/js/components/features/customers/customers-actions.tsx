import { Link, router } from "@inertiajs/react"
import { Edit, Eye, MoreHorizontal, Trash2 } from "lucide-react"
import { useState } from "react"
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
import { PAGE_ROUTES } from "@/config/page-routes"
import { useDynamicDialog } from "@/hooks/ui/use-dynamic-dialog"
import { useRolePermissionFeatureViewer } from "@/hooks/ui/use-role-permission-viewer"
import { Customer, User } from "@/types"
import { EditCustomerForm } from "./edit-customer-form"

interface CustomersActionsProps {
  customer: Customer
  onActionStart?: (id: number | null) => void
  user?: User
}

export function CustomersActions({
  customer,
  onActionStart,
  user,
}: CustomersActionsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { openDialog, openConfirmation } = useDynamicDialog()
  const { viewWrapper } = useRolePermissionFeatureViewer()

  const canEdit = viewWrapper([], ["customer_profile"], [], ["update"], user)

  const canDelete = viewWrapper([], ["customer_profile"], [], ["delete"], user)

  const handleDelete = () => {
    openConfirmation({
      type: "warning",
      title: "Delete Customer",
      description:
        "Are you sure you want to delete this customer? This action cannot be undone.",
      confirmText: "Delete",
      onConfirm: () => {
        onActionStart?.(customer.id)
        toast.promise(
          new Promise<void>((resolve, reject) => {
            router.delete(API_ROUTES.DELETE_CUSTOMER(customer.id), {
              preserveScroll: true,
              onSuccess: () => resolve(),
              onError: () => reject(),
              onFinish: () => onActionStart?.(null),
            })
          }),
          {
            loading: "Deleting customer...",
            success: "Customer deleted successfully",
            error: "Failed to delete customer",
          },
        )
      },
    })
  }

  const handleEdit = () => {
    openDialog({
      title: "Edit Customer",
      description: "Update the current existing customer profile",
      children: <EditCustomerForm customer={customer} />,
    })
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="size-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link
            href={PAGE_ROUTES.CUSTOMER_PROFILE_PAGE(customer.id)}
            className="w-full cursor-pointer"
          >
            <Eye className="mr-2 size-4" />
            View Customer
          </Link>
        </DropdownMenuItem>

        {canEdit && (
          <DropdownMenuItem onClick={handleEdit}>
            <Edit className="mr-2 size-4" />
            Edit Customer
          </DropdownMenuItem>
        )}

        {canDelete && (
          <DropdownMenuItem
            onClick={handleDelete}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 size-4" />
            Delete Customer
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
