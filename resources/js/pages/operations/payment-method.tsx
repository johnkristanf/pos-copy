import { usePage } from "@inertiajs/react"
import { ReactNode } from "react"
import { PaymentMethodSection } from "@/components/features/payment-methods/payment-method-section"
import { ContentLayout } from "@/components/layouts/content-layout"
import { DynamicBreadcrumb } from "@/components/ui/common/dynamic-breadcrumb"
import { PAGE_ROUTES } from "@/config/page-routes"
import AppLayout from "@/layouts/dashboard-layout"
import PageLayout from "@/layouts/page-layout"
import { BreadcrumbItemProps, PaymentMethod, SharedData } from "@/types"

const paymentMethodPage: BreadcrumbItemProps<string>[] = [
  { label: "Dashboard", href: PAGE_ROUTES.DASHBOARD_PAGE },
  {
    label: "Payment Method",
    href: PAGE_ROUTES.OPERATIONS_PAYMENT_METHOD_PAGE,
  },
]

interface paymentMethodPageProps {
  paymentMethods: PaymentMethod[]
}

export default function PaymentMethodPage({
  paymentMethods,
}: paymentMethodPageProps) {
  const { auth } = usePage<SharedData>().props
  const user = auth.user

  return (
    <AppLayout>
      <ContentLayout title={"Payment Method"} userId={user.id}>
        <DynamicBreadcrumb items={paymentMethodPage} />
        <PaymentMethodSection
          paymentMethods={paymentMethods}
          user={auth.user}
        />
      </ContentLayout>
    </AppLayout>
  )
}

PaymentMethodPage.layout = (page: ReactNode) => (
  <PageLayout title="Payment Method" metaDescription="Payment Method">
    {page}
  </PageLayout>
)
