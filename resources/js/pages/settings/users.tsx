import { Deferred, usePage } from "@inertiajs/react"
import { ReactNode, useState } from "react"
import { UsersSection } from "@/components/features/users/users-section"
import { UsersSkeleton } from "@/components/features/users/users-skeleton"
import { ContentLayout } from "@/components/layouts/content-layout"
import { DynamicBreadcrumb } from "@/components/ui/common/dynamic-breadcrumb"
import { PAGE_ROUTES } from "@/config/page-routes"
import { useRealtimeReload } from "@/hooks/api/use-realtime-reload"
import AppLayout from "@/layouts/dashboard-layout"
import PageLayout from "@/layouts/page-layout"
import {
  BreadcrumbItemProps,
  PaginatedUsers,
  Permission,
  Role,
  SharedData,
  SpecificUserFeature,
  StockLocation,
} from "@/types"

const usersPage: BreadcrumbItemProps<string>[] = [
  { label: "Dashboard", href: PAGE_ROUTES.DASHBOARD_PAGE },
  { label: "Users", href: PAGE_ROUTES.USERS_PAGE },
]

interface UsersPageProps {
  users?: PaginatedUsers
  stock_locations: StockLocation[]
  roles: Role[]
  features: SpecificUserFeature[]
  permissions: Permission[]
}

export default function UsersPage({
  users,
  stock_locations,
  roles,
  features,
  permissions,
}: UsersPageProps) {
  const { auth } = usePage<SharedData>().props
  const user = auth.user
  const [updatingUserId, setUpdatingUserId] = useState<number | null>(null)

  useRealtimeReload(
    "users",
    ".user.modified",
    ["users"],
    (event) => {
      if (event?.id) {
        setUpdatingUserId(event.id)
      }
    },
    () => {
      setUpdatingUserId(null)
    },
  )

  useRealtimeReload("stock-locations", ".stock-location.modified", [
    "stockLocations",
  ])

  return (
    <AppLayout>
      <ContentLayout title="Users" userId={user.id}>
        <DynamicBreadcrumb items={usersPage} />
        {users ? (
          <UsersSection
            users={users}
            assigned_stock_locations={stock_locations}
            roles={roles}
            features={features}
            permissions={permissions}
            updatingUserId={updatingUserId}
            setUpdatingUserId={setUpdatingUserId}
          />
        ) : (
          <Deferred data="users" fallback={<UsersSkeleton />}>
            <UsersSection
              users={users as unknown as PaginatedUsers}
              assigned_stock_locations={stock_locations}
              roles={roles}
              features={features}
              permissions={permissions}
              updatingUserId={updatingUserId}
              setUpdatingUserId={setUpdatingUserId}
            />
          </Deferred>
        )}
      </ContentLayout>
    </AppLayout>
  )
}

UsersPage.layout = (page: ReactNode) => (
  <PageLayout title="Users" metaDescription="Manage users for the system">
    {page}
  </PageLayout>
)
