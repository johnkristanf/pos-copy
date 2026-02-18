import { usePage } from "@inertiajs/react"
import { ReactNode } from "react"
import { PriceReportSection } from "@/components/features/price-report/price-report-section"
import { ContentLayout } from "@/components/layouts/content-layout"
import { DynamicBreadcrumb } from "@/components/ui/common/dynamic-breadcrumb"
import { PAGE_ROUTES } from "@/config/page-routes"
import AppLayout from "@/layouts/dashboard-layout"
import PageLayout from "@/layouts/page-layout"
import { BreadcrumbItemProps, Item, SharedData } from "@/types"

const integrationPage: BreadcrumbItemProps<string>[] = [
  { label: "Dashboard", href: PAGE_ROUTES.DASHBOARD_PAGE },
  {
    label: "Price Report",
    href: PAGE_ROUTES.REPORTS_PRICE_REPORT_PAGE,
  },
]

interface PriceReportPageProps {
  all_items_report: Item[]
}
export default function PriceReportPage({
  all_items_report,
}: PriceReportPageProps) {
  const { auth } = usePage<SharedData>().props
  const user = auth.user
  return (
    <AppLayout>
      <ContentLayout title={"Price Report"} userId={user.id}>
        <DynamicBreadcrumb items={integrationPage} />
        <PriceReportSection allItemsReport={all_items_report} user={user} />
      </ContentLayout>
    </AppLayout>
  )
}

PriceReportPage.layout = (page: ReactNode) => (
  <PageLayout title="Price Report" metaDescription="Price Report">
    {page}
  </PageLayout>
)
