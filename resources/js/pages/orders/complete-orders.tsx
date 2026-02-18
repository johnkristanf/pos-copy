import { Deferred, usePage } from "@inertiajs/react"
import { ReactNode } from "react"
import { CompleteOrdersSection } from "@/components/features/complete-orders/complete-orders-section"
import { CompleteOrdersSkeleton } from "@/components/features/complete-orders/complete-orders-skeleton"
import { ContentLayout } from "@/components/layouts/content-layout"
import { DynamicBreadcrumb } from "@/components/ui/common/dynamic-breadcrumb"
import { PAGE_ROUTES } from "@/config/page-routes"
import { useRealtimeReload } from "@/hooks/api/use-realtime-reload"
import AppLayout from "@/layouts/dashboard-layout"
import PageLayout from "@/layouts/page-layout"
import { BreadcrumbItemProps, PaginatedOrders, SharedData } from "@/types"

const completeOrdersPage: BreadcrumbItemProps<string>[] = [
  { label: "Dashboard", href: PAGE_ROUTES.DASHBOARD_PAGE },
  { label: "Orders", href: PAGE_ROUTES.ORDERS_ALL_ORDERS_PAGE },
  { label: "Complete Orders", href: PAGE_ROUTES.ORDERS_ACTIVE_ORDERS_PAGE },
]

interface CompleteOrderProps {
  orders: PaginatedOrders
}

export default function CompleteOrdersPage({ orders }: CompleteOrderProps) {
  const { auth } = usePage<SharedData>().props
  const user = auth.user
  useRealtimeReload("orders", ".order.modified", ["orders"])
  useRealtimeReload("users", ".user.modified", ["orders"])
  return (
    <AppLayout>
      <ContentLayout title="Complete Orders" userId={user.id}>
        <DynamicBreadcrumb items={completeOrdersPage} />
        <Deferred data="orders" fallback={<CompleteOrdersSkeleton />}>
          <CompleteOrdersSection orders={orders} />
        </Deferred>
      </ContentLayout>
    </AppLayout>
  )
}

CompleteOrdersPage.layout = (page: ReactNode) => (
  <PageLayout
    title="Complete Orders"
    metaDescription="View and manage Complete orders"
  >
    {page}
  </PageLayout>
)
