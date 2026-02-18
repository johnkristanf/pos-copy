import { usePage } from "@inertiajs/react"
import { ReactNode } from "react"
import { ItemsUtilityProvider } from "@/components/contexts/items-utility"
import { AdjustmentSection } from "@/components/features/adjustment/adjustment-section"
import { ContentLayout } from "@/components/layouts/content-layout"
import { DynamicBreadcrumb } from "@/components/ui/common/dynamic-breadcrumb"
import { PAGE_ROUTES } from "@/config/page-routes"
import { useRealtimeReload } from "@/hooks/api/use-realtime-reload"
import AppLayout from "@/layouts/dashboard-layout"
import PageLayout from "@/layouts/page-layout"
import {
  BreadcrumbItemProps,
  Item,
  PaginatedStockAdjustment,
  SharedData,
  StockLocation,
} from "@/types"

const stockTransferPage: BreadcrumbItemProps<string>[] = [
  { label: "Dashboard", href: PAGE_ROUTES.DASHBOARD_PAGE },
  {
    label: "Stock Adjustment",
    href: PAGE_ROUTES.ITEMS_STOCK_ADJUSTMENT_PAGE,
  },
]

interface AdjustmentPageProps {
  items: Item[]
  stock_location: StockLocation[]
  stock_adjustments: PaginatedStockAdjustment
}

export default function AdjustmentPage({
  items,
  stock_location,
  stock_adjustments,
}: AdjustmentPageProps) {
  const { auth } = usePage<SharedData>().props
  const user = auth.user

  useRealtimeReload("items", ".item.modified", ["items"])
  return (
    <AppLayout>
      <ItemsUtilityProvider items={items} stockLocation={stock_location}>
        <ContentLayout title={"Stock Adjustment"} userId={user.id}>
          <DynamicBreadcrumb items={stockTransferPage} />
          <AdjustmentSection stockAdjustment={stock_adjustments} user={user} />
        </ContentLayout>
      </ItemsUtilityProvider>
    </AppLayout>
  )
}

AdjustmentPage.layout = (page: ReactNode) => (
  <PageLayout title="Adjustment" metaDescription="Adjustment">
    {page}
  </PageLayout>
)
