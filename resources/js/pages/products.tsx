import { Deferred, usePage } from "@inertiajs/react"
import { ReactNode, useState } from "react"
import { ItemsUtilityProvider } from "@/components/contexts/items-utility"
import { InventorySkeleton } from "@/components/features/inventory/inventory-skeleton"
import { ProductsSection } from "@/components/features/products/products-section"
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
  PaginatedProducts,
  SharedData,
} from "@/types"

const integrationPage: BreadcrumbItemProps<string>[] = [
  { label: "Dashboard", href: PAGE_ROUTES.DASHBOARD_PAGE },
  {
    label: "Products",
    href: PAGE_ROUTES.PRODUCTS_PAGE,
  },
]

interface InventoryPageProps {
  category: Category[]
  location: InventoryLocation[]
  item_stock: PaginatedProducts
}

export default function ProductsPage({
  category,
  location,
  item_stock,
}: InventoryPageProps) {
  const { auth } = usePage<SharedData>().props
  const user = auth.user
  const [updatingProductId, setUpdatingProductId] = useState<number | null>(
    null,
  )

  useRealtimeReload(
    "items",
    ".item.modified",
    ["item_stock"],
    (e: any) => {
      if (e?.id) {
        setUpdatingProductId(e.id)
      }
    },
    () => {
      setUpdatingProductId(null)
    },
  )

  useRealtimeReload("categories", ".category.modified", ["categories"])

  return (
    <AppLayout>
      <ItemsUtilityProvider categories={category} location={location}>
        <ContentLayout title={"Products"} userId={user.id}>
          <DynamicBreadcrumb items={integrationPage} />
          {item_stock ? (
            <ProductsSection
              products={item_stock}
              enableSelection={true}
              updatingProductId={updatingProductId}
            />
          ) : (
            <Deferred data="item_stock" fallback={<InventorySkeleton />}>
              <ProductsSection
                products={item_stock}
                enableSelection={true}
                updatingProductId={updatingProductId}
              />
            </Deferred>
          )}
        </ContentLayout>
      </ItemsUtilityProvider>
    </AppLayout>
  )
}

ProductsPage.layout = (page: ReactNode) => (
  <PageLayout title="Products" metaDescription="Products">
    {page}
  </PageLayout>
)
