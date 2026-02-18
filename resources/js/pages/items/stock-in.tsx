import { Deferred, usePage } from "@inertiajs/react"
import { ReactNode, useState } from "react"
import { ItemsUtilityProvider } from "@/components/contexts/items-utility"
import { StockInSection } from "@/components/features/stock-in/stock-in-section"
import { StockInSkeleton } from "@/components/features/stock-in/stock-in-skeleton"
import { ContentLayout } from "@/components/layouts/content-layout"
import { DynamicBreadcrumb } from "@/components/ui/common/dynamic-breadcrumb"
import { PAGE_ROUTES } from "@/config/page-routes"
import { useRealtimeReload } from "@/hooks/api/use-realtime-reload"
import AppLayout from "@/layouts/dashboard-layout"
import PageLayout from "@/layouts/page-layout"
import {
  BreadcrumbItemProps,
  Category,
  Item,
  Location,
  PaginatedStockIn,
  SharedData,
  StockLocation,
  Supplier,
  UnitOfMeasure,
} from "@/types"

const integrationPage: BreadcrumbItemProps<string>[] = [
  { label: "Dashboard", href: PAGE_ROUTES.DASHBOARD_PAGE },
  {
    label: "Item Stock In",
    href: PAGE_ROUTES.ITEMS_STOCK_IN_PAGE,
  },
]

interface StockInPageProps {
  items: Item[]
  category: Category[]
  location: Location[]
  supplier: Supplier[]
  stockLocation: StockLocation[]
  unit_of_measures: UnitOfMeasure[]
  purchased_items: PaginatedStockIn
}

export default function StockInPage({
  items,
  category,
  location,
  supplier,
  stockLocation,
  unit_of_measures,
  purchased_items,
}: StockInPageProps) {
  const { auth } = usePage<SharedData>().props
  const user = auth.user
  const [updatingStockInId, setUpdatingStockInId] = useState<number | null>(
    null,
  )

  useRealtimeReload("items", ".item.modified", ["items"])
  useRealtimeReload(
    "purchased-items",
    ".purchased-item.modified",
    ["purchased_items"],
    (e: any) => {
      if (e?.id) {
        setUpdatingStockInId(e.id)
      }
    },
    () => {
      setUpdatingStockInId(null)
    },
  )
  useRealtimeReload("categories", ".category.modified", ["category"])
  useRealtimeReload("stock-locations", ".stock-location.modified", [
    "stockLocation",
  ])
  useRealtimeReload("suppliers", ".supplier.modified", ["supplier"])

  return (
    <AppLayout>
      <ItemsUtilityProvider
        categories={category}
        supplier={supplier}
        location={location}
        unit_of_measures={unit_of_measures}
      >
        <ContentLayout title={"Item Stock In"} userId={user.id}>
          <DynamicBreadcrumb items={integrationPage} />
          {purchased_items ? (
            <StockInSection
              items={items}
              stockLocation={stockLocation}
              purchased_items={purchased_items}
              updatingStockInId={updatingStockInId}
              user={user}
            />
          ) : (
            <Deferred data="purchased_items" fallback={<StockInSkeleton />}>
              <StockInSection
                items={items}
                stockLocation={stockLocation}
                purchased_items={purchased_items}
                updatingStockInId={updatingStockInId}
                user={user}
              />
            </Deferred>
          )}
        </ContentLayout>
      </ItemsUtilityProvider>
    </AppLayout>
  )
}

StockInPage.layout = (page: ReactNode) => (
  <PageLayout title="Item Stock In" metaDescription="Item Stock In">
    {page}
  </PageLayout>
)
