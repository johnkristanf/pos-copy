import { usePage } from "@inertiajs/react"
import { ReactNode, useEffect } from "react"
import { ReturnFromCustomerSection } from "@/components/features/return-from-customer/return-from-customer-section"
import { ContentLayout } from "@/components/layouts/content-layout"
import { DynamicBreadcrumb } from "@/components/ui/common/dynamic-breadcrumb"
import { PAGE_ROUTES } from "@/config/page-routes"
import { useRolePermissionFeatureViewer } from "@/hooks/ui/use-role-permission-viewer"
import AppLayout from "@/layouts/dashboard-layout"
import PageLayout from "@/layouts/page-layout"
import {
  BreadcrumbItemProps,
  PaginatedReturnFromCustomer,
  SharedData,
  StockLocation,
} from "@/types"

const integrationPage: BreadcrumbItemProps<string>[] = [
  { label: "Dashboard", href: PAGE_ROUTES.DASHBOARD_PAGE },
  {
    label: "Return from Customer",
    href: PAGE_ROUTES.RETURN_FROM_CUSTOMER_PAGE,
  },
]

interface ReturnsFromCustomerPageProps {
  returns: PaginatedReturnFromCustomer
  stock_location: StockLocation[]
}
export default function ReturnsFromCustomerPage({
  returns,
  stock_location,
}: ReturnsFromCustomerPageProps) {
  const { auth } = usePage<SharedData>().props
  const user = auth.user
  const { setUser } = useRolePermissionFeatureViewer()

  useEffect(() => {
    setUser(user)
  }, [user, setUser])

  return (
    <AppLayout>
      <ContentLayout title={"Return From Customer"} userId={user.id}>
        <DynamicBreadcrumb items={integrationPage} />
        <ReturnFromCustomerSection
          user={user}
          returns={returns}
          stockLocations={stock_location}
        />
      </ContentLayout>
    </AppLayout>
  )
}

ReturnsFromCustomerPage.layout = (page: ReactNode) => (
  <PageLayout
    title="Return From Customer"
    metaDescription="Return From Customer"
  >
    {page}
  </PageLayout>
)
