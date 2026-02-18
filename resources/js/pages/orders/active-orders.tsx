import { Deferred, usePage } from "@inertiajs/react"
import { useEffect } from "react"
import { match, P } from "ts-pattern"
import { ActiveOrdersSection } from "@/components/features/active-orders/active-orders-section"
import { ActiveOrdersSkeleton } from "@/components/features/active-orders/active-orders-skeleton"
import { ContentLayout } from "@/components/layouts/content-layout"
import { DynamicBreadcrumb } from "@/components/ui/common/dynamic-breadcrumb"
import { PAGE_ROUTES } from "@/config/page-routes"
import { ROLES_FEATURES_PERMISSIONS } from "@/config/roles-features-permissions-template"
import { useRealtimeReload } from "@/hooks/api/use-realtime-reload"
import { useRolePermissionFeatureViewer } from "@/hooks/ui/use-role-permission-viewer"
import AppLayout from "@/layouts/dashboard-layout"
import PageLayout from "@/layouts/page-layout"
import { BreadcrumbItemProps, PaginatedOrders, SharedData } from "@/types"

interface ActiveOrdersProps {
  orders: PaginatedOrders
}

const determineRoleState = (user: SharedData["auth"]["user"]) => {
  return match(user)
    .with(
      {
        user_features: P.when((features) =>
          features?.some(
            (feature) =>
              (feature.tag === "payment_management" ||
                feature.tag === "receive_payment" ||
                feature.tag === "cash") &&
              feature.permissions.includes("create"),
          ),
        ),
      },
      () => ({
        isCashier: true,
        isInventoryOfficer: false,
        title: "Review Payment",
      }),
    )
    .with(
      {
        user_features: P.when((features) =>
          features?.some(
            (feature) =>
              feature.tag === "inventory" &&
              feature.permissions.includes("create"),
          ),
        ),
      },
      () => ({
        isCashier: false,
        isInventoryOfficer: true,
        title: "Serve Order",
      }),
    )
    .with(
      {
        roles: P.when((roles) =>
          roles?.some((role) => role.name === "Cashier"),
        ),
      },
      () => ({
        isCashier: true,
        isInventoryOfficer: false,
        title: "Review Payment",
      }),
    )
    .with(
      {
        roles: P.when((roles) =>
          roles?.some(
            (role) =>
              role.name === "Inventory Officer" ||
              role.name === "Inventory Manager",
          ),
        ),
      },
      () => ({
        isCashier: false,
        isInventoryOfficer: true,
        title: "Serve Order",
      }),
    )
    .otherwise(() => ({
      isCashier: false,
      isInventoryOfficer: false,
      title: "Active Orders",
    }))
}

export default function ActiveOrdersPage({ orders }: ActiveOrdersProps) {
  const { auth } = usePage<SharedData>().props
  const user = auth.user
  const { setUser } = useRolePermissionFeatureViewer()

  useEffect(() => {
    setUser(user)
  }, [user, setUser])

  const { isCashier, isInventoryOfficer, title } = determineRoleState(user)
  const isSalesOfficer = user.roles.some(
    (role) => role.name === ROLES_FEATURES_PERMISSIONS.SALES_OFFICER.role,
  )

  useRealtimeReload("orders", ".order.modified", ["orders"])
  useRealtimeReload("users", ".user.modified", ["orders"])
  useRealtimeReload("discounts", ".discount.modified", ["orders"])

  const activeOrdersPage: BreadcrumbItemProps<string>[] = [
    { label: "Dashboard", href: PAGE_ROUTES.DASHBOARD_PAGE },
    { label: "Orders", href: PAGE_ROUTES.ORDERS_ALL_ORDERS_PAGE },
    { label: title, href: PAGE_ROUTES.ORDERS_ACTIVE_ORDERS_PAGE },
  ]

  return (
    <AppLayout>
      <ContentLayout title={title} userId={user.id}>
        <DynamicBreadcrumb items={activeOrdersPage} />
        <Deferred
          data="orders"
          fallback={
            <ActiveOrdersSkeleton
              isCashier={isCashier}
              isInventoryOfficer={isInventoryOfficer}
            />
          }
        >
          <ActiveOrdersSection
            orders={orders}
            isCashier={isCashier}
            isInventoryOfficer={isInventoryOfficer}
            user={user}
            isSalesOfficer={isSalesOfficer}
          />
        </Deferred>
      </ContentLayout>
    </AppLayout>
  )
}

ActiveOrdersPage.layout = (page: any) => {
  const { auth } = page.props as SharedData
  const user = auth.user

  const { title } = determineRoleState(user)

  return (
    <PageLayout title={title} metaDescription="View and manage active orders">
      {page}
    </PageLayout>
  )
}
