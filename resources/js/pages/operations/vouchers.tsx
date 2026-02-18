import { usePage } from "@inertiajs/react"
import { ReactNode } from "react"
import { VoucherSection } from "@/components/features/voucher/voucher-section"
import { ContentLayout } from "@/components/layouts/content-layout"
import { DynamicBreadcrumb } from "@/components/ui/common/dynamic-breadcrumb"
import { PAGE_ROUTES } from "@/config/page-routes"
import AppLayout from "@/layouts/dashboard-layout"
import PageLayout from "@/layouts/page-layout"
import { BreadcrumbItemProps, PaginatedVoucher, SharedData } from "@/types"

const paymentMethodPage: BreadcrumbItemProps<string>[] = [
  { label: "Dashboard", href: PAGE_ROUTES.DASHBOARD_PAGE },
  {
    label: "Vouchers",
    href: PAGE_ROUTES.OPERATIONS_VOUCHERS_PAGE,
  },
]

interface voucherPageProps {
  vouchers: PaginatedVoucher
}

export default function Vouchers({ vouchers }: voucherPageProps) {
  const { auth } = usePage<SharedData>().props
  const user = auth.user

  return (
    <AppLayout>
      <ContentLayout title={"Vouchers"} userId={user.id}>
        <DynamicBreadcrumb items={paymentMethodPage} />
        <VoucherSection vouchers={vouchers} user={auth.user} />
      </ContentLayout>
    </AppLayout>
  )
}

Vouchers.layout = (page: ReactNode) => (
  <PageLayout title="Vouchers" metaDescription="Vouchers">
    {page}
  </PageLayout>
)
