import { usePage } from "@inertiajs/react"
import { ReactNode } from "react"
import { ItemsUtilityProvider } from "@/components/contexts/items-utility"
import { DiscountSection } from "@/components/features/discounts/discount-section"
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
  PaginatedDiscount,
  SharedData,
  Supplier,
} from "@/types"

const paymentMethodPage: BreadcrumbItemProps<string>[] = [
  { label: "Dashboard", href: PAGE_ROUTES.DASHBOARD_PAGE },
  {
    label: "Discounts",
    href: PAGE_ROUTES.OPERATIONS_PAYMENT_METHOD_PAGE,
  },
]

interface discountPageProps {
  discounts: PaginatedDiscount
  supplier: Supplier[]
  categories: Category[]
  items: Item[]
}

export default function Discount({
  discounts,
  supplier,
  categories,
  items,
}: discountPageProps) {
  const { auth } = usePage<SharedData>().props
  const user = auth.user

  useRealtimeReload("discounts", ".discount.modified", ["discounts"])
  useRealtimeReload("categories", ".category.modified", ["categories"])
  useRealtimeReload("items", ".item.modified", ["items"])

  return (
    <AppLayout>
      <ItemsUtilityProvider
        supplier={supplier}
        categories={categories}
        items={items}
      >
        <ContentLayout title={"Discounts"} userId={user.id}>
          <DynamicBreadcrumb items={paymentMethodPage} />
          <DiscountSection discounts={discounts} user={user} />
        </ContentLayout>
      </ItemsUtilityProvider>
    </AppLayout>
  )
}

Discount.layout = (page: ReactNode) => (
  <PageLayout title="Discount" metaDescription="Discount">
    {page}
  </PageLayout>
)
