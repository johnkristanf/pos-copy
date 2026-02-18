import { usePage } from "@inertiajs/react"
import { ReactNode, useState } from "react"
import { ItemsUtilityProvider } from "@/components/contexts/items-utility"
import { PriceSection } from "@/components/features/price/price-section"
import { ContentLayout } from "@/components/layouts/content-layout"
import { DynamicBreadcrumb } from "@/components/ui/common/dynamic-breadcrumb"
import { PAGE_ROUTES } from "@/config/page-routes"
import { useRealtimeReload } from "@/hooks/api/use-realtime-reload"
import AppLayout from "@/layouts/dashboard-layout"
import PageLayout from "@/layouts/page-layout"
import {
  BreadcrumbItemProps,
  Category,
  Location as InventoryLocation,
  PaginatedItemPrice,
  SharedData,
} from "@/types"

const integrationPage: BreadcrumbItemProps<string>[] = [
  { label: "Dashboard", href: PAGE_ROUTES.DASHBOARD_PAGE },
  {
    label: "Price",
    href: PAGE_ROUTES.ITEMS_PRICE,
  },
]

interface PricePageProps {
  category: Category[]
  stockLocation: InventoryLocation[]
  item_price: PaginatedItemPrice
}

export default function PricePage({
  category,
  stockLocation,
  item_price,
}: PricePageProps) {
  const { auth } = usePage<SharedData>().props
  const user = auth.user
  const [updatingItemId, setUpdatingItemId] = useState<number | null>(null)

  useRealtimeReload("categories", ".category.modified", ["category"])
  useRealtimeReload("stock-locations", ".stock-location.modified", ["location"])

  useRealtimeReload(
    "prices",
    ".price.modified",
    ["item_price"],
    (e: any) => {
      if (e?.item_id) {
        setUpdatingItemId(e.item_id)
      }
    },
    () => {
      setUpdatingItemId(null)
    },
  )

  return (
    <AppLayout>
      <ItemsUtilityProvider categories={category} location={stockLocation}>
        <ContentLayout title={"Price"} userId={user.id}>
          <DynamicBreadcrumb items={integrationPage} />
          <PriceSection
            item_price={item_price}
            updatingItemId={updatingItemId}
            setUpdatingItemId={setUpdatingItemId}
            user={user}
          />
        </ContentLayout>
      </ItemsUtilityProvider>
    </AppLayout>
  )
}

PricePage.layout = (page: ReactNode) => (
  <PageLayout title="Price" metaDescription="Price">
    {page}
  </PageLayout>
)
