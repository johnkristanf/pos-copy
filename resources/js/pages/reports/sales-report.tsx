import { usePage } from "@inertiajs/react"
import { ReactNode } from "react"
import { SalesReportSection } from "@/components/features/sales-report/sales-report-section"
import { ContentLayout } from "@/components/layouts/content-layout"
import { DynamicBreadcrumb } from "@/components/ui/common/dynamic-breadcrumb"
import { PAGE_ROUTES } from "@/config/page-routes"
import AppLayout from "@/layouts/dashboard-layout"
import PageLayout from "@/layouts/page-layout"
import {
  AffiliatedCustomer,
  BreadcrumbItemProps,
  CashReconciliation,
  ItemCategorySales,
  NonAffiliatedCustomer,
  SharedData,
  TopCustomerSales,
  TotalSales,
} from "@/types"

const integrationPage: BreadcrumbItemProps<string>[] = [
  { label: "Dashboard", href: PAGE_ROUTES.DASHBOARD_PAGE },
  {
    label: "Sales Report",
    href: PAGE_ROUTES.REPORTS_SALES_REPORT_PAGE,
  },
]

interface SalesReportPageProps {
  totalSales: TotalSales
  totalAffiliatedCustomer: AffiliatedCustomer[]
  totalNonAffiliatedCustomer: NonAffiliatedCustomer[]
  itemCategorySales: ItemCategorySales[]
  topCustomerSales: TopCustomerSales[]
  cashReconciliation: CashReconciliation
}

export default function SalesReportPage({
  totalSales,
  totalAffiliatedCustomer,
  totalNonAffiliatedCustomer,
  itemCategorySales,
  topCustomerSales,
  cashReconciliation,
}: SalesReportPageProps) {
  const { auth } = usePage<SharedData>().props
  const user = auth.user
  return (
    <AppLayout>
      <ContentLayout title={"Sales Report"} userId={user.id}>
        <DynamicBreadcrumb items={integrationPage} />
        <SalesReportSection
          totalSales={totalSales}
          totalAffiliatedCustomer={totalAffiliatedCustomer}
          totalNonAffiliatedCustomer={totalNonAffiliatedCustomer}
          itemCategorySales={itemCategorySales}
          topCustomerSales={topCustomerSales}
          cashReconciliation={cashReconciliation}
          user={user}
        />
      </ContentLayout>
    </AppLayout>
  )
}

SalesReportPage.layout = (page: ReactNode) => (
  <PageLayout title="Sales Report" metaDescription="Sales Report">
    {page}
  </PageLayout>
)
