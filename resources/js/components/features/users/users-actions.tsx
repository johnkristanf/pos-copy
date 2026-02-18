import { router } from "@inertiajs/react"
import { Edit, EyeIcon, MoreHorizontal, Trash } from "lucide-react"
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
import {
  Permission,
  Role,
  SpecificUserFeature,
  StockLocation,
  User,
} from "@/types"
import { EditUserForm } from "./edit-user-form"
import { ViewUserInfo } from "./view-user-info"

interface UsersActionsProps {
  user: User
  roles?: Role[]
  features?: SpecificUserFeature[]
  permissions?: Permission[]
  assigned_stock_locations?: StockLocation[]
  onActionStart?: (id: number | null) => void
}

export function UsersActions({
  user,
  roles,
  features,
  permissions,
  assigned_stock_locations,
  onActionStart,
}: UsersActionsProps) {
  const { openDialog, openConfirmation, closeDialog } = useDynamicDialog()

  const fullName = [user.first_name, user.middle_name, user.last_name]
    .filter(Boolean)
    .join(" ")

  const handleView = () => {
    openDialog({
      title: "User Details",
      description: `View details for ${user.first_name} ${user.last_name}`,
      children: (
        <ViewUserInfo
          user={user}
          roles={roles || []}
          features={features || []}
          permissions={permissions || []}
        />
      ),
    })
  }

  const handleEdit = () => {
    openDialog({
      title: "Edit User",
      description: `Update details for ${user.first_name} ${user.last_name}`,
      children: (
        <EditUserForm
          user={user}
          stock_locations={assigned_stock_locations || []}
          roles={roles || []}
          features={features || []}
          permissions={permissions || []}
        />
      ),
    })
  }

  const handleDeleteUser = async () => {
    onActionStart?.(user.id)

    await toast.promise(
      new Promise<void>((resolve, reject) => {
        router.delete(API_ROUTES.DELETE_USER(String(user.id)), {
          preserveScroll: true,
          onSuccess: () => {
            closeDialog()
            resolve()
          },
          onError: (errors) => {
            reject(
              new Error(
                (Object.values(errors)[0] as string) || "Failed to delete user",
              ),
            )
          },
          onFinish: () => {
            onActionStart?.(null)
          },
        })
      }),
      {
        loading: <span className="animate-pulse">Deleting user...</span>,
        success: "User deleted successfully!",
        error: (error) => error.message || "Failed to delete user",
      },
    )
  }

  const handleConfirmDeleteUser = () => {
    openConfirmation({
      title: "Delete User",
      description: `Are you sure you want to delete this user (${fullName})? This cannot be undone.`,
      type: "warning",
      onConfirm: handleDeleteUser,
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
        <DropdownMenuItem onClick={handleView}>
          <EyeIcon className="mr-2 size-4" />
          <span className="text-xs">View Details</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleEdit}>
          <Edit className="mr-2 size-4" />
          <span className="text-xs">Edit User</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleConfirmDeleteUser}
          className="text-destructive"
        >
          <Trash className="mr-2 size-4" />
          <span className="text-xs">Delete User</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
