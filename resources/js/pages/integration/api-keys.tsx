import { Deferred, usePage } from "@inertiajs/react"
import { ReactNode } from "react"
import { ApiKeysSection } from "@/components/features/api-keys/api-key-section"
import { ApiKeysSkeleton } from "@/components/features/api-keys/api-keys-skeleton"
import { ContentLayout } from "@/components/layouts/content-layout"
import { DynamicBreadcrumb } from "@/components/ui/common/dynamic-breadcrumb"
import { PAGE_ROUTES } from "@/config/page-routes"
import AppLayout from "@/layouts/dashboard-layout"
import PageLayout from "@/layouts/page-layout"
import {
  App,
  AppFeature,
  BreadcrumbItemProps,
  KeyExpirationOption,
  PaginatedApiKeys,
  SharedData,
} from "@/types"

interface ApiKeysPageProps {
  apiKeys?: PaginatedApiKeys
  app: App
  features: AppFeature[]
  keyExpirationOptions: KeyExpirationOption[]
  filters?: any
}

export default function ApiKeysPage({
  apiKeys,
  app,
  features,
  keyExpirationOptions,
  filters,
}: ApiKeysPageProps) {
  const { auth } = usePage<SharedData>().props
  const user = auth.user
  const apiKeysBreadcrumb: BreadcrumbItemProps<string>[] = [
    { label: "Dashboard", href: PAGE_ROUTES.DASHBOARD_PAGE },
    { label: "Integration", href: PAGE_ROUTES.INTEGRATION_APPS_PAGE },
    {
      label: app.name,
      href: PAGE_ROUTES.INTEGRATION_API_KEYS_PAGE(app.slug, String(app.id)),
    },
  ]

  return (
    <AppLayout>
      <ContentLayout title={"API Keys"} userId={user.id}>
        <DynamicBreadcrumb items={apiKeysBreadcrumb} />
        <Deferred data="apiKeys" fallback={<ApiKeysSkeleton />}>
          <ApiKeysSection
            apiKeys={apiKeys as PaginatedApiKeys}
            app={app}
            features={features}
            keyExpirationOptions={keyExpirationOptions}
            filters={filters}
          />
        </Deferred>
      </ContentLayout>
    </AppLayout>
  )
}

ApiKeysPage.layout = (page: ReactNode) => (
  <PageLayout
    title="API Keys"
    metaDescription="Manage API keys for your integration projects"
  >
    {page}
  </PageLayout>
)
