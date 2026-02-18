import { Deferred } from "@inertiajs/react"
import { ReactNode, useState } from "react"
import { ItemsUtilityProvider } from "@/components/contexts/items-utility"
import { StockTransferSection } from "@/components/features/stock-transfer/stock-transfer-section"
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
  PaginatedStockTransfer,
  StockLocation,
  User,
} from "@/types"

const stockTransferPage: BreadcrumbItemProps<string>[] = [
  { label: "Dashboard", href: PAGE_ROUTES.DASHBOARD_PAGE },
  {
    label: "Stock Transfer",
    href: PAGE_ROUTES.ITEMS_STOCK_TRANSFER_PAGE,
  },
]

interface StockTranferPageProps {
  items: Item[]
  stock_location: StockLocation[]
  stock_transfers: PaginatedStockTransfer
  category: Category[]
  auth: {
    user: User
  }
}

export default function StockTranferPage({
  items,
  stock_location,
  stock_transfers,
  category,
  auth,
}: StockTranferPageProps) {
  const [updatingStockTransferId, setUpdatingStockTransferId] = useState<
    number | null
  >(null)

  useRealtimeReload(
    "items",
    ".item.modified",
    ["stock_transfers"],
    (e: any) => {
      if (e?.id) {
        setUpdatingStockTransferId(e.id)
      }
    },
    () => {
      setUpdatingStockTransferId(null)
    },
  )

  useRealtimeReload("categories", ".category.modified", ["categories"])
  useRealtimeReload("stock-locations", ".stock-location.modified", [
    "stock_location",
  ])

  return (
    <AppLayout>
      <ItemsUtilityProvider
        items={items}
        stockLocation={stock_location}
        categories={category}
      >
        <ContentLayout title={"Stock Transfer"} userId={auth.user.id}>
          <DynamicBreadcrumb items={stockTransferPage} />
          {stock_transfers ? (
            <StockTransferSection
              stockTransfers={stock_transfers}
              updatingStockTransferId={updatingStockTransferId}
              user={auth.user}
            />
          ) : (
            <Deferred data="stock_transfers" fallback={<div>Loading...</div>}>
              <StockTransferSection
                stockTransfers={stock_transfers}
                updatingStockTransferId={updatingStockTransferId}
                user={auth.user}
              />
            </Deferred>
          )}
        </ContentLayout>
      </ItemsUtilityProvider>
    </AppLayout>
  )
}

StockTranferPage.layout = (page: ReactNode) => (
  <PageLayout title="Stock Transfer" metaDescription="stock Transfer">
    {page}
  </PageLayout>
)
