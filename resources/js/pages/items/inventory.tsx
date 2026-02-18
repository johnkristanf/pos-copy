import { Deferred, usePage } from "@inertiajs/react"
import { ReactNode, useState } from "react"
import { ItemsUtilityProvider } from "@/components/contexts/items-utility"
import { InventorySection } from "@/components/features/inventory/inventory-section"
import { InventorySkeleton } from "@/components/features/inventory/inventory-skeleton"
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
  PaginatedInventoryItem,
  SharedData,
} from "@/types"

const integrationPage: BreadcrumbItemProps<string>[] = [
  { label: "Dashboard", href: PAGE_ROUTES.DASHBOARD_PAGE },
  {
    label: "Item Inventory",
    href: PAGE_ROUTES.ITEMS_INVENTORY_PAGE,
  },
]

interface InventoryPageProps {
  category: Category[]
  location: InventoryLocation[]
  item_stock: PaginatedInventoryItem
}

export default function InventoryPage({
  category,
  location,
  item_stock,
}: InventoryPageProps) {
  const { auth } = usePage<SharedData>().props
  const user = auth.user
  const [updatingItemId, setUpdatingItemId] = useState<number | null>(null)

  const handleEventStart = (id: number | undefined) => {
    if (id) setUpdatingItemId(id)
  }

  const handleEventFinish = () => {
    setUpdatingItemId(null)
  }

  useRealtimeReload(
    "items",
    ".item.modified",
    ["item_stock"],
    (e: any) => handleEventStart(e?.id),
    handleEventFinish,
  )

  useRealtimeReload("categories", ".category.modified", ["category"])

  useRealtimeReload(
    "stocks",
    ".stock.modified",
    ["item_stock"],
    (e: any) => handleEventStart(e?.item_id),
    handleEventFinish,
  )

  return (
    <AppLayout>
      <ItemsUtilityProvider categories={category} location={location}>
        <ContentLayout title={"Inventory"} userId={user.id}>
          <DynamicBreadcrumb items={integrationPage} />
          {item_stock ? (
            <InventorySection
              item_stock={item_stock}
              categories={category}
              locations={location}
              updatingItemId={updatingItemId}
              user={user}
            />
          ) : (
            <Deferred data="item_stock" fallback={<InventorySkeleton />}>
              <InventorySection
                item_stock={item_stock}
                categories={category}
                locations={location}
                updatingItemId={updatingItemId}
                user={user}
              />
            </Deferred>
          )}
        </ContentLayout>
      </ItemsUtilityProvider>
    </AppLayout>
  )
}

InventoryPage.layout = (page: ReactNode) => (
  <PageLayout title="Inventory" metaDescription="Inventory">
    {page}
  </PageLayout>
)
