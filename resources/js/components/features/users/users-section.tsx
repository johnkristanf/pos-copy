import { useMemo } from "react"
import { DataTable } from "@/components/ui/data-table"
import { PaginationInfo } from "@/components/ui/data-table/data-table-pagination"
import { useDynamicDialog } from "@/hooks/ui/use-dynamic-dialog"
import {
  PaginatedUsers,
  Permission,
  Role,
  SpecificUserFeature,
  StockLocation,
} from "@/types"
import { CreateUserForm } from "./create-user-form"
import { MobileUsersCard } from "./mobile-users-card"
import { getUsersColumns } from "./users-column"
import { UsersToolbar } from "./users-toolbar"

interface UsersSectionProps {
  users?: PaginatedUsers
  assigned_stock_locations: StockLocation[]
  roles: Role[]
  features: SpecificUserFeature[]
  permissions: Permission[]
  updatingUserId: number | null
  setUpdatingUserId: (id: number | null) => void
}

export function UsersSection({
  users,
  assigned_stock_locations: stock_locations,
  roles,
  features,
  permissions,
  updatingUserId,
  setUpdatingUserId,
}: UsersSectionProps) {
  const { openDialog } = useDynamicDialog()

  const usersColumn = useMemo(
    () =>
      getUsersColumns(
        roles,
        features,
        permissions,
        stock_locations,
        setUpdatingUserId,
      ),
    [roles, features, permissions, stock_locations, setUpdatingUserId],
  )

  if (!users) {
    return null
  }

  const pagination: PaginationInfo = {
    currentPage: users.current_page,
    totalPages: users.last_page,
    totalItems: users.total,
    itemsPerPage: users.per_page,
    hasNextPage: users.current_page < users.last_page,
    hasPreviousPage: users.current_page > 1,
  }

  const handleCreateNew = () => {
    openDialog({
      title: "Create New User",
      description: "Add a new user to the system",
      children: (
        <CreateUserForm
          stock_locations={stock_locations}
          roles={roles}
          features={features}
          permissions={permissions}
        />
      ),
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold">Users</h2>
          <p className="text-muted-foreground text-xs sm:text-sm">
            Manage system users and their permissions
          </p>
        </div>
      </div>

      <DataTable
        data={users.data}
        pagination={pagination}
        useInertia={true}
        columns={usersColumn}
        toolbar={<UsersToolbar onCreateNew={handleCreateNew} />}
        searchPlaceholder="Search users by name or email..."
        emptyMessage="No users found"
        mobileCardComponent={(user) => <MobileUsersCard user={user} />}
        enableMobileCards={true}
        isRowLoading={(user) => user.id === updatingUserId}
      />
    </div>
  )
}
