import { usePage } from "@inertiajs/react"
import { ReactNode } from "react"
import { VoidReasonSection } from "@/components/features/void-reason/void-reason-section"
import { ContentLayout } from "@/components/layouts/content-layout"
import { DynamicBreadcrumb } from "@/components/ui/common/dynamic-breadcrumb"
import { PAGE_ROUTES } from "@/config/page-routes"
import AppLayout from "@/layouts/dashboard-layout"
import PageLayout from "@/layouts/page-layout"
import {
  BreadcrumbItemProps,
  PaginatedVoidReasons,
  Role,
  SharedData,
} from "@/types"

const paymentMethodPage: BreadcrumbItemProps<string>[] = [
  { label: "Dashboard", href: PAGE_ROUTES.DASHBOARD_PAGE },
  {
    label: "Void Reasons",
    href: PAGE_ROUTES.OPERATIONS_VOID_PAGE,
  },
]

interface VoidPageProps {
  voidReasons: PaginatedVoidReasons
  roles: Role[]
}

export default function Void({ voidReasons, roles }: VoidPageProps) {
  const { auth } = usePage<SharedData>().props
  const user = auth.user

  return (
    <AppLayout>
      <ContentLayout title={"Void Reasons"} userId={user.id}>
        <DynamicBreadcrumb items={paymentMethodPage} />
        <VoidReasonSection
          voidReason={voidReasons}
          user={auth.user}
          roles={roles}
        />
      </ContentLayout>
    </AppLayout>
  )
}

Void.layout = (page: ReactNode) => (
  <PageLayout title="Stock Locations" metaDescription="Stock Locations">
    {page}
  </PageLayout>
)
