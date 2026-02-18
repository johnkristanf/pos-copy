import { Deferred, usePage } from "@inertiajs/react"
import { ReactNode } from "react"
import { AllOrdersSection } from "@/components/features/all-orders/all-orders-section"
import { AllOrdersSkeleton } from "@/components/features/all-orders/all-orders-skeleton"
import { ContentLayout } from "@/components/layouts/content-layout"
import { DynamicBreadcrumb } from "@/components/ui/common/dynamic-breadcrumb"
import { PAGE_ROUTES } from "@/config/page-routes"
import { useRealtimeReload } from "@/hooks/api/use-realtime-reload"
import AppLayout from "@/layouts/dashboard-layout"
import PageLayout from "@/layouts/page-layout"
import { BreadcrumbItemProps, PaginatedOrders, SharedData } from "@/types"

const allOrdersPage: BreadcrumbItemProps<string>[] = [
  { label: "Dashboard", href: PAGE_ROUTES.DASHBOARD_PAGE },
  { label: "Orders", href: PAGE_ROUTES.ORDERS_ALL_ORDERS_PAGE },
  { label: "All Orders", href: PAGE_ROUTES.ORDERS_ALL_ORDERS_PAGE },
]

interface AllOrdersPageProps {
  orders: PaginatedOrders
}

export default function AllOrdersPage({ orders }: AllOrdersPageProps) {
  const { auth } = usePage<SharedData>().props
  const user = auth.user
  useRealtimeReload("orders", ".order.modified", ["orders"])
  useRealtimeReload("users", ".user.modified", ["orders"])
  return (
    <AppLayout>
      <ContentLayout title={"All Orders"} userId={user.id}>
        <DynamicBreadcrumb items={allOrdersPage} />
        <Deferred data="orders" fallback={<AllOrdersSkeleton />}>
          <AllOrdersSection orders={orders} />
        </Deferred>
      </ContentLayout>
    </AppLayout>
  )
}

AllOrdersPage.layout = (page: ReactNode) => (
  <PageLayout title="All Orders" metaDescription="All details for the orders">
    {page}
  </PageLayout>
)
