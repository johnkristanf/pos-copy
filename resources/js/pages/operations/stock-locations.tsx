import { usePage } from "@inertiajs/react"
import { ReactNode } from "react"
import { StockLocationsSection } from "@/components/features/stock-locations/stock-locations-section"
import { ContentLayout } from "@/components/layouts/content-layout"
import { DynamicBreadcrumb } from "@/components/ui/common/dynamic-breadcrumb"
import { PAGE_ROUTES } from "@/config/page-routes"
import AppLayout from "@/layouts/dashboard-layout"
import PageLayout from "@/layouts/page-layout"
import {
  BreadcrumbItemProps,
  PaginatedStockLocations,
  SharedData,
} from "@/types"

const paymentMethodPage: BreadcrumbItemProps<string>[] = [
  { label: "Dashboard", href: PAGE_ROUTES.DASHBOARD_PAGE },
  {
    label: "Stock Locations",
    href: PAGE_ROUTES.OPERATIONS_STOCK_LOCATIONS_PAGE,
  },
]

interface StockLocationsPageProps {
  stockLocations: PaginatedStockLocations
}

export default function StockLocations({
  stockLocations,
}: StockLocationsPageProps) {
  const { auth } = usePage<SharedData>().props
  const user = auth.user

  return (
    <AppLayout>
      <ContentLayout title={"Stock Locations"} userId={user.id}>
        <DynamicBreadcrumb items={paymentMethodPage} />
        <StockLocationsSection
          stockLocations={stockLocations}
          user={auth.user}
        />
      </ContentLayout>
    </AppLayout>
  )
}

StockLocations.layout = (page: ReactNode) => (
  <PageLayout title="Stock Locations" metaDescription="Stock Locations">
    {page}
  </PageLayout>
)
