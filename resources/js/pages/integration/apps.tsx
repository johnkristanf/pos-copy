import { Deferred, usePage } from "@inertiajs/react"
import { ReactNode } from "react"
import { IntegrationsSection } from "@/components/features/integration/integration-section"
import { IntegrationsSkeleton } from "@/components/features/integration/integration-skeleton"
import { ContentLayout } from "@/components/layouts/content-layout"
import { DynamicBreadcrumb } from "@/components/ui/common/dynamic-breadcrumb"
import { PAGE_ROUTES } from "@/config/page-routes"
import AppLayout from "@/layouts/dashboard-layout"
import PageLayout from "@/layouts/page-layout"
import { BreadcrumbItemProps, PaginatedApps, SharedData } from "@/types"

const integrationPage: BreadcrumbItemProps<string>[] = [
  { label: "Dashboard", href: PAGE_ROUTES.DASHBOARD_PAGE },
  { label: "Integration", href: PAGE_ROUTES.INTEGRATION_APPS_PAGE },
]

interface AppsProps {
  apps?: PaginatedApps
}

export default function AppsPage({ apps }: AppsProps) {
  const { auth } = usePage<SharedData>().props
  const user = auth.user
  return (
    <AppLayout>
      <ContentLayout title={"Integration"} userId={user.id}>
        <DynamicBreadcrumb items={integrationPage} />
        <Deferred data="apps" fallback={<IntegrationsSkeleton />}>
          <IntegrationsSection apps={apps as PaginatedApps} />
        </Deferred>
      </ContentLayout>
    </AppLayout>
  )
}

AppsPage.layout = (page: ReactNode) => (
  <PageLayout
    title="Integration"
    metaDescription="Integrate other Bridge Application to your system"
  >
    {page}
  </PageLayout>
)
