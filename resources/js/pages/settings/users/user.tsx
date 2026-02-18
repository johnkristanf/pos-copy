import { usePage } from "@inertiajs/react"
import { ReactNode } from "react"
import { ContentLayout } from "@/components/layouts/content-layout"
import { DynamicBreadcrumb } from "@/components/ui/common/dynamic-breadcrumb"
import { PAGE_ROUTES } from "@/config/page-routes"
import { useRealtimeReload } from "@/hooks/api/use-realtime-reload"
import AppLayout from "@/layouts/dashboard-layout"
import PageLayout from "@/layouts/page-layout"
import { BreadcrumbItemProps, SharedData } from "@/types"

const mePage: BreadcrumbItemProps<string>[] = [
  { label: "Dashboard", href: PAGE_ROUTES.DASHBOARD_PAGE },
  { label: "Users", href: PAGE_ROUTES.USERS_PAGE },
  { label: "User", href: PAGE_ROUTES.USER_PAGE("") },
]

export default function UserPage() {
  const { auth } = usePage<SharedData>().props
  const user = auth.user
  useRealtimeReload("users", ".user.modified", ["users"])
  return (
    <AppLayout>
      <ContentLayout title={"User"} userId={user.id}>
        <DynamicBreadcrumb items={mePage} />
        <div>User</div>
      </ContentLayout>
    </AppLayout>
  )
}

UserPage.layout = (page: ReactNode) => (
  <PageLayout title="User" metaDescription="User profile information">
    {page}
  </PageLayout>
)
