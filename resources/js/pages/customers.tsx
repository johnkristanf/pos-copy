import { Deferred, usePage } from "@inertiajs/react"
import { ReactNode, useState } from "react"
import { CustomersSection } from "@/components/features/customers/customers-section"
import { CustomersSkeleton } from "@/components/features/customers/customers-skeleton"
import { ContentLayout } from "@/components/layouts/content-layout"
import { DynamicBreadcrumb } from "@/components/ui/common/dynamic-breadcrumb"
import { PAGE_ROUTES } from "@/config/page-routes"
import { useRealtimeReload } from "@/hooks/api/use-realtime-reload"
import AppLayout from "@/layouts/dashboard-layout"
import PageLayout from "@/layouts/page-layout"
import { BreadcrumbItemProps, PaginatedCustomers, SharedData } from "@/types"

const customersPage: BreadcrumbItemProps<string>[] = [
  { label: "Dashboard", href: PAGE_ROUTES.DASHBOARD_PAGE },
  { label: "Customers", href: PAGE_ROUTES.CUSTOMERS_PAGE },
]

interface CustomersPageProps {
  customers?: PaginatedCustomers
}

export default function CustomersPage({ customers }: CustomersPageProps) {
  const { auth } = usePage<SharedData>().props
  const user = auth.user
  const [updatingCustomerId, setUpdatingCustomerId] = useState<number | null>(
    null,
  )

  useRealtimeReload(
    "customers",
    ".customer.modified",
    ["customers"],
    (e: any) => {
      if (e?.id) {
        setUpdatingCustomerId(e.id)
      }
    },
    () => {
      setUpdatingCustomerId(null)
    },
  )

  return (
    <AppLayout>
      <ContentLayout title={"Customers"} userId={user.id}>
        <DynamicBreadcrumb items={customersPage} />
        {customers ? (
          <CustomersSection
            customers={customers}
            updatingCustomerId={updatingCustomerId}
            setUpdatingCustomerId={setUpdatingCustomerId}
            user={auth.user}
          />
        ) : (
          <Deferred data="customers" fallback={<CustomersSkeleton />}>
            <CustomersSection
              customers={customers as unknown as PaginatedCustomers}
              updatingCustomerId={updatingCustomerId}
              setUpdatingCustomerId={setUpdatingCustomerId}
              user={auth.user}
            />
          </Deferred>
        )}
      </ContentLayout>
    </AppLayout>
  )
}

CustomersPage.layout = (page: ReactNode) => (
  <PageLayout title="Customers" metaDescription="Customers information">
    {page}
  </PageLayout>
)
