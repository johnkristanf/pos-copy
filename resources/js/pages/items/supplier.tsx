import { Deferred } from "@inertiajs/react"
import { ReactNode, useState } from "react"
import { SupplierSection } from "@/components/features/supplier/supplier-section"
import { SupplierSkeleton } from "@/components/features/supplier/supplier-skeleton"
import { ContentLayout } from "@/components/layouts/content-layout"
import { DynamicBreadcrumb } from "@/components/ui/common/dynamic-breadcrumb"
import { PAGE_ROUTES } from "@/config/page-routes"
import { useRealtimeReload } from "@/hooks/api/use-realtime-reload"
import AppLayout from "@/layouts/dashboard-layout"
import PageLayout from "@/layouts/page-layout"
import { BreadcrumbItemProps, PaginatedSupplier, User } from "@/types"

const supplierPage: BreadcrumbItemProps<string>[] = [
  { label: "Dashboard", href: PAGE_ROUTES.DASHBOARD_PAGE },
  {
    label: "Supplier",
    href: PAGE_ROUTES.ITEM_SUPPLIER,
  },
]

interface SupplierPageProps {
  suppliers: PaginatedSupplier
  auth: {
    user: User
  }
}

export default function SupplierPage({ suppliers, auth }: SupplierPageProps) {
  const [updatingSupplierId, setUpdatingSupplierId] = useState<number | null>(
    null,
  )

  useRealtimeReload(
    "suppliers",
    ".supplier.modified",
    ["suppliers"],
    (e: any) => {
      if (e?.id) {
        setUpdatingSupplierId(e.id)
      }
    },
    () => {
      setUpdatingSupplierId(null)
    },
  )

  return (
    <AppLayout>
      <ContentLayout title={"Supplier"} userId={auth.user.id}>
        <DynamicBreadcrumb items={supplierPage} />
        {suppliers ? (
          <SupplierSection
            supplier={suppliers}
            updatingSupplierId={updatingSupplierId}
            setUpdatingSupplierId={setUpdatingSupplierId}
            user={auth.user}
          />
        ) : (
          <Deferred data="supplier" fallback={<SupplierSkeleton />}>
            <SupplierSection
              supplier={suppliers}
              updatingSupplierId={updatingSupplierId}
              setUpdatingSupplierId={setUpdatingSupplierId}
              user={auth.user}
            />
          </Deferred>
        )}
      </ContentLayout>
    </AppLayout>
  )
}

SupplierPage.layout = (page: ReactNode) => (
  <PageLayout title="Supplier" metaDescription="Supplier">
    {page}
  </PageLayout>
)
