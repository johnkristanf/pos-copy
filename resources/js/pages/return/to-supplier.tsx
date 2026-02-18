import { usePage } from "@inertiajs/react"
import { ReactNode } from "react"
import { ReturnToSupplierSection } from "@/components/features/return-to-supplier/return-to-supplier-section"
import { ContentLayout } from "@/components/layouts/content-layout"
import { DynamicBreadcrumb } from "@/components/ui/common/dynamic-breadcrumb"
import { PAGE_ROUTES } from "@/config/page-routes"
import AppLayout from "@/layouts/dashboard-layout"
import PageLayout from "@/layouts/page-layout"
import {
  BreadcrumbItemProps,
  PaginatedReturnToSupplier,
  SharedData,
} from "@/types"

const integrationPage: BreadcrumbItemProps<string>[] = [
  { label: "Dashboard", href: PAGE_ROUTES.DASHBOARD_PAGE },
  { label: "Return to Supplier", href: PAGE_ROUTES.RETURN_TO_SUPPLIER_PAGE },
]

interface ReturnToSupplierPageProps {
  returns?: PaginatedReturnToSupplier
}

export default function ReturnToSupplierPage({
  returns,
}: ReturnToSupplierPageProps) {
  const { auth } = usePage<SharedData>().props
  const user = auth.user
  return (
    <AppLayout>
      <ContentLayout title={"Return to Supplier"} userId={user.id}>
        <DynamicBreadcrumb items={integrationPage} />
        <ReturnToSupplierSection returns={returns} user={user} />
      </ContentLayout>
    </AppLayout>
  )
}

ReturnToSupplierPage.layout = (page: ReactNode) => (
  <PageLayout title="Return to Supplier" metaDescription="Return to Supplier">
    {page}
  </PageLayout>
)
