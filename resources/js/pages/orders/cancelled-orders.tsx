import { Deferred, usePage } from "@inertiajs/react"
import { ReactNode } from "react"
import { CancelledOrdersSection } from "@/components/features/cancelled-orders/cancelled-orders-section"
import { CancelledOrdersSkeleton } from "@/components/features/cancelled-orders/cancelled-orders-skeleton"
import { ContentLayout } from "@/components/layouts/content-layout"
import { DynamicBreadcrumb } from "@/components/ui/common/dynamic-breadcrumb"
import { PAGE_ROUTES } from "@/config/page-routes"
import { useRealtimeReload } from "@/hooks/api/use-realtime-reload"
import AppLayout from "@/layouts/dashboard-layout"
import PageLayout from "@/layouts/page-layout"
import { BreadcrumbItemProps, PaginatedOrders, SharedData } from "@/types"

const cancelledOrdersPage: BreadcrumbItemProps<string>[] = [
  { label: "Dashboard", href: PAGE_ROUTES.DASHBOARD_PAGE },
  { label: "Orders", href: PAGE_ROUTES.ORDERS_ALL_ORDERS_PAGE },
  { label: "Cancelled Orders", href: PAGE_ROUTES.ORDERS_CANCELLED_ORDERS_PAGE },
]

interface CancelledOrdersProps {
  orders: PaginatedOrders
}

export default function CancelledOrdersPage({ orders }: CancelledOrdersProps) {
  const { auth } = usePage<SharedData>().props
  const user = auth.user
  useRealtimeReload("orders", ".order.modified", ["orders"])
  useRealtimeReload("users", ".user.modified", ["orders"])
  return (
    <AppLayout>
      <ContentLayout title="Cancelled Orders" userId={user.id}>
        <DynamicBreadcrumb items={cancelledOrdersPage} />
        <Deferred data="orders" fallback={<CancelledOrdersSkeleton />}>
          <CancelledOrdersSection orders={orders} />
        </Deferred>
      </ContentLayout>
    </AppLayout>
  )
}

CancelledOrdersPage.layout = (page: ReactNode) => (
  <PageLayout
    title="Cancelled Orders"
    metaDescription="View and manage cancelled orders"
  >
    {page}
  </PageLayout>
)
