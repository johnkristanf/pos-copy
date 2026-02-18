import { Deferred, usePage } from "@inertiajs/react"
import { ReactNode } from "react"
import { MeDetailsSection } from "@/components/features/me/me-details-section"
import { MeDetailsSkeleton } from "@/components/features/me/me-details-skeleton"
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
  { label: "Me", href: PAGE_ROUTES.ME_PAGE },
]

export default function MePage() {
  const { auth } = usePage<SharedData>().props
  const user = auth.user
  useRealtimeReload("users", ".user.modified", ["users"])
  return (
    <AppLayout>
      <ContentLayout title={"Current User"} userId={user.id}>
        <DynamicBreadcrumb items={mePage} />
        <Deferred data="user" fallback={<MeDetailsSkeleton />}>
          <MeDetailsSection />
        </Deferred>
      </ContentLayout>
    </AppLayout>
  )
}

MePage.layout = (page: ReactNode) => (
  <PageLayout title="Me" metaDescription="Your current profile information">
    {page}
  </PageLayout>
)
