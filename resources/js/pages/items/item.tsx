import { Deferred, usePage } from "@inertiajs/react"
import { ReactNode, useState } from "react"
import { ItemsUtilityProvider } from "@/components/contexts/items-utility"
import { ItemSection } from "@/components/features/items/item-section"
import { ItemSkeleton } from "@/components/features/items/items-skeleton"
import { ContentLayout } from "@/components/layouts/content-layout"
import { DynamicBreadcrumb } from "@/components/ui/common/dynamic-breadcrumb"
import { PAGE_ROUTES } from "@/config/page-routes"
import { useRealtimeReload } from "@/hooks/api/use-realtime-reload"
import AppLayout from "@/layouts/dashboard-layout"
import PageLayout from "@/layouts/page-layout"
import {
  BreadcrumbItemProps,
  Category,
  Location,
  PaginatedItems,
  SharedData,
  Supplier,
  UnitOfMeasure,
} from "@/types"

const integrationPage: BreadcrumbItemProps<string>[] = [
  { label: "Dashboard", href: PAGE_ROUTES.DASHBOARD_PAGE },
  {
    label: "Item List",
    href: PAGE_ROUTES.ITEMS_ITEM_PAGE,
  },
]

interface ItemListProps {
  items: PaginatedItems
  categories: Category[]
  location: Location[]
  supplier: Supplier[]
  unit_of_measures: UnitOfMeasure[]
}

export default function ItemsPage({
  items,
  categories,
  location,
  supplier,
  unit_of_measures,
}: ItemListProps) {
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

  useRealtimeReload("categories", ".category.modified", ["categories"])
  useRealtimeReload("stock-locations", ".stock-location.modified", ["location"])

  return (
    <AppLayout>
      <ItemsUtilityProvider
        categories={categories}
        location={location}
        supplier={supplier}
        unit_of_measures={unit_of_measures}
      >
        <ContentLayout title={"Item List"} userId={user.id}>
          <DynamicBreadcrumb items={integrationPage} />
          {items ? (
            <ItemSection
              items={items}
              updatingItemId={updatingItemId}
              setUpdatingItemId={setUpdatingItemId}
              user={user}
            />
          ) : (
            <Deferred data="items" fallback={<ItemSkeleton />}>
              <ItemSection
                items={items}
                updatingItemId={updatingItemId}
                setUpdatingItemId={setUpdatingItemId}
                user={user}
              />
            </Deferred>
          )}
        </ContentLayout>
      </ItemsUtilityProvider>
    </AppLayout>
  )
}

ItemsPage.layout = (page: ReactNode) => (
  <PageLayout title="Item List" metaDescription="Item">
    {page}
  </PageLayout>
)
