import { Head, usePage } from "@inertiajs/react"
import { ReactNode, useState } from "react"
import { CustomerProfileSection } from "@/components/features/customer-profile/customer-profile-section"
import { CustomerProfileSkeleton } from "@/components/features/customer-profile/customer-profile-skeleton"
import { RecentOrder } from "@/components/features/customer-profile/recent-orders"
import { ContentLayout } from "@/components/layouts/content-layout"
import { DynamicBreadcrumb } from "@/components/ui/common/dynamic-breadcrumb"
import { PAGE_ROUTES } from "@/config/page-routes"
import { useRealtimeReload } from "@/hooks/api/use-realtime-reload"
import AppLayout from "@/layouts/dashboard-layout"
import PageLayout from "@/layouts/page-layout"
import { BreadcrumbItemProps, DetailedCustomer, SharedData } from "@/types"

interface CustomerProfileProps {
  customer?: DetailedCustomer
  recentOrders?: RecentOrder[]
}

export default function CustomerProfilePage({
  customer,
  recentOrders,
}: CustomerProfileProps) {
  const { auth } = usePage<SharedData>().props
  const user = auth.user
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null)

  const breadcrumbs: BreadcrumbItemProps<string>[] = [
    { label: "Dashboard", href: PAGE_ROUTES.DASHBOARD_PAGE },
    { label: "Customers", href: PAGE_ROUTES.CUSTOMERS_PAGE },
    { label: customer?.name ?? "Loading...", href: "#" },
  ]

  useRealtimeReload(
    "orders",
    ".order.modified",
    ["customer"],
    (e: any) => {
      if (e?.id) {
        setUpdatingOrderId(e.id)
      }
    },
    () => {
      setUpdatingOrderId(null)
    },
  )

  useRealtimeReload("customers", ".customer.modified", ["customer"])

  return (
    <AppLayout>
      <Head title={`${customer?.name ?? "Customer"} - Customer Profile`} />
      <ContentLayout title="Customer Profile" userId={user.id}>
        <DynamicBreadcrumb items={breadcrumbs} />
        <div className="mt-6">
          {customer ? (
            <CustomerProfileSection
              customer={customer}
              recentOrders={recentOrders}
              updatingOrderId={updatingOrderId}
            />
          ) : (
            <CustomerProfileSkeleton />
          )}
        </div>
      </ContentLayout>
    </AppLayout>
  )
}

CustomerProfilePage.layout = (page: ReactNode) => (
  <PageLayout
    title="Customer Profile"
    metaDescription="View customer details and history"
  >
    {page}
  </PageLayout>
)
