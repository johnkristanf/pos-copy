import { usePage } from "@inertiajs/react"
import { ReactNode, useState } from "react"
import { ItemsUtilityProvider } from "@/components/contexts/items-utility"
import { ItemSoldSection } from "@/components/features/item-sold/item-sold-section"
import { ContentLayout } from "@/components/layouts/content-layout"
import { DynamicBreadcrumb } from "@/components/ui/common/dynamic-breadcrumb"
import { PAGE_ROUTES } from "@/config/page-routes"
import { useRealtimeReload } from "@/hooks/api/use-realtime-reload"
import AppLayout from "@/layouts/dashboard-layout"
import PageLayout from "@/layouts/page-layout"
import {
  BreadcrumbItemProps,
  Category,
  PaginatedSoldItem,
  PaymentMethod,
  SharedData,
  StockLocation,
} from "@/types"

const itemSoldPage: BreadcrumbItemProps<string>[] = [
  { label: "Dashboard", href: PAGE_ROUTES.DASHBOARD_PAGE },
  {
    label: "Item Sold",
    href: PAGE_ROUTES.ITEMS_SOLD_PAGE,
  },
]

interface ItemSoldProps {
  sold_items: PaginatedSoldItem
  categories: Category[]
  location: StockLocation[]
  payment_methods: PaymentMethod[]
}

export default function ItemSold({
  sold_items,
  categories,
  location,
  payment_methods,
}: ItemSoldProps) {
  const { auth } = usePage<SharedData>().props
  const user = auth.user
  const [updatingItemId, setUpdatingItemId] = useState<number | null>(null)

  useRealtimeReload(
    "items",
    ".item.modified",
    ["items"],
    (e: any) => {
      if (e?.id) {
        setUpdatingItemId(e.id)
      }
    },
    () => {
      setUpdatingItemId(null)
    },
  )

  return (
    <AppLayout>
      <ItemsUtilityProvider
        categories={categories}
        stockLocation={location}
        paymentMethods={payment_methods}
      >
        <ContentLayout title={"Item Sold"} userId={user.id}>
          <DynamicBreadcrumb items={itemSoldPage} />
          <ItemSoldSection
            updatingItemId={updatingItemId}
            user={user}
            soldItem={sold_items}
          />
        </ContentLayout>
      </ItemsUtilityProvider>
    </AppLayout>
  )
}

ItemSold.layout = (page: ReactNode) => (
  <PageLayout title="Item Sold" metaDescription="Item Sold">
    {page}
  </PageLayout>
)
