import { Deferred, usePage } from "@inertiajs/react"
import { useEffect, useState } from "react"
import { CreateOrderSkeleton } from "@/components/features/create-orders/create-order-skeleton"
import { CreateOrderSection } from "@/components/features/create-orders/create-orders-section"
import { DraftOrders } from "@/components/features/create-orders/draft-order"
import { ContentLayout } from "@/components/layouts/content-layout"
import { DynamicBreadcrumb } from "@/components/ui/common/dynamic-breadcrumb"
import { PAGE_ROUTES } from "@/config/page-routes"
import { ROLES_FEATURES_PERMISSIONS } from "@/config/roles-features-permissions-template"
import { useRealtimeReload } from "@/hooks/api/use-realtime-reload"
import { useDynamicDialog } from "@/hooks/ui/use-dynamic-dialog"
import DashboardLayout from "@/layouts/dashboard-layout"
import PageLayout from "@/layouts/page-layout"
import {
  BreadcrumbItemProps,
  Category,
  PaginatedOrderableItems,
  PaymentMethod,
  SharedData,
  UnitOfMeasure,
} from "@/types"

interface CreateOrderPageProps {
  items?: PaginatedOrderableItems
  categories?: Category[]
  unit_of_measures?: UnitOfMeasure[]
  payment_methods?: PaymentMethod[]
}

export default function CreateOrderPage({
  items,
  categories,
  unit_of_measures,
  payment_methods,
}: CreateOrderPageProps) {
  const { auth } = usePage<SharedData>().props
  const user = auth.user
  const [updatingItemId, setUpdatingItemId] = useState<number | null>(null)
  const { openDialog } = useDynamicDialog()

  const isSalesOfficer = user.roles.some(
    (role) => role.name === ROLES_FEATURES_PERMISSIONS.SALES_OFFICER.role,
  )

  const handleEventStart = (id: number | undefined) => {
    if (id) setUpdatingItemId(id)
  }

  const handleEventFinish = () => {
    setUpdatingItemId(null)
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get("action") === "open_drafts") {
      openDialog({
        title: "Draft Orders",
        description: "Select a draft to resume working on it.",
        children: <DraftOrders />,
        dialogClassName: "sm:max-w-[600px] p-0 overflow-hidden",
      })

      const newUrl = window.location.pathname
      window.history.replaceState({}, "", newUrl)
    }
  }, [openDialog])

  useRealtimeReload(
    "items",
    ".item.modified",
    ["items"],
    (e: any) => handleEventStart(e?.id),
    handleEventFinish,
  )

  useRealtimeReload("categories", ".category.modified", ["categories"])

  useRealtimeReload(
    "stocks",
    ".stock.modified",
    ["items"],
    (e: any) => handleEventStart(e?.item_id),
    handleEventFinish,
  )

  useRealtimeReload("unit-of-measures", ".unit-of-measure.modified", ["items"])

  useRealtimeReload(
    "prices",
    ".price.modified",
    ["items"],
    (e: any) => handleEventStart(e?.item_id),
    handleEventFinish,
  )

  const title = isSalesOfficer ? "Create Order" : "Review Order"

  const breadcrumbs: BreadcrumbItemProps<string>[] = [
    { label: "Dashboard", href: PAGE_ROUTES.DASHBOARD_PAGE },
    {
      label: title,
      href: PAGE_ROUTES.CREATE_ORDERS_PAGE,
    },
  ]

  return (
    <DashboardLayout>
      <ContentLayout title={title} userId={user.id}>
        <DynamicBreadcrumb items={breadcrumbs} />
        <div className="mt-6">
          {items && categories && unit_of_measures && payment_methods ? (
            <CreateOrderSection
              items={items}
              categories={categories}
              unit_of_measures={unit_of_measures}
              payment_methods={payment_methods}
              isSalesOfficer={isSalesOfficer}
              updatingItemId={updatingItemId}
              user={user}
            />
          ) : (
            <Deferred
              data={[
                "items",
                "categories",
                "unit_of_measures",
                "payment_methods",
              ]}
              fallback={<CreateOrderSkeleton />}
            >
              {items && categories && unit_of_measures && payment_methods && (
                <CreateOrderSection
                  items={items}
                  categories={categories}
                  unit_of_measures={unit_of_measures}
                  payment_methods={payment_methods}
                  isSalesOfficer={isSalesOfficer}
                  updatingItemId={updatingItemId}
                  user={user}
                />
              )}
            </Deferred>
          )}
        </div>
      </ContentLayout>
    </DashboardLayout>
  )
}

CreateOrderPage.layout = (page: any) => {
  const { auth } = page.props as SharedData
  const user = auth.user

  const isSalesOfficer = user?.user_features?.some(
    (feature) =>
      feature.tag === "create_order" && feature.permissions.includes("create"),
  )

  const title = isSalesOfficer ? "Create Order" : "Review Order"

  return (
    <PageLayout
      title={title}
      metaDescription="Select items from inventory to create a new order"
    >
      {page}
    </PageLayout>
  )
}
