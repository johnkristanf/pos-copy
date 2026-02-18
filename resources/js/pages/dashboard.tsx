import { usePage } from "@inertiajs/react"
import { ReactNode } from "react"
import { AdministratorDashboardSection } from "@/components/features/dashboard/administrator-dashboard-section"
import { CashierDashboardSection } from "@/components/features/dashboard/cashier-dashboard-section"
import { EVPDashboardSection } from "@/components/features/dashboard/evp-dashboard-section"
import { InventoryManagerDashboardSection } from "@/components/features/dashboard/inventory-manager-dashboard-section"
import { InventoryOfficerDashboardSection } from "@/components/features/dashboard/inventory-officer-dashboard-section"
import { MerchandiserDashboardSection } from "@/components/features/dashboard/merchandiser-dashboard-section"
import { PurchasingSalesHeadDashboardSection } from "@/components/features/dashboard/purchasing-sales-head-dashboard-section"
import { SalesOfficerDashboardSection } from "@/components/features/dashboard/sales-officer-dashboard-section"
import { SupervisorDashboardSection } from "@/components/features/dashboard/supervisor-dashboard-section"
import { ContentLayout } from "@/components/layouts/content-layout"
import { DynamicBreadcrumb } from "@/components/ui/common/dynamic-breadcrumb"
import { PAGE_ROUTES } from "@/config/page-routes"
import { ROLES_FEATURES_PERMISSIONS } from "@/config/roles-features-permissions-template"
import DashboardLayout from "@/layouts/dashboard-layout"
import PageLayout from "@/layouts/page-layout"
import { BreadcrumbItemProps, SharedData } from "@/types"

const dashboardPage: BreadcrumbItemProps<string>[] = [
  { label: "Dashboard", href: PAGE_ROUTES.DASHBOARD_PAGE },
]

interface DashboardProps {
  // Sales Officer Props
  stats?: {
    total_orders: number
    total_sales: number
    pending_quotations: number
  }
  recent_orders?: Array<{
    id: number
    order_number: string
    customer_name: string
    amount: string
    status: string
    time_ago: string
    payment_method: string
  }>

  // Cashier Props
  daily_collections?: Array<{
    method: string
    tag: string
    total: number
  }>
  pending_transactions?: Array<{
    id: number
    order_number: string
    customer_name: string
    customer_rating: number
    total_payable: number
    amount_paid: number
    payment_status: string
    payment_method: string
    time_ago: string
  }>
  total_collected_today?: number
  queue_count?: number

  // Shared KPIs (Inventory Manager & Merchandiser)
  kpis?: {
    // Inventory Manager fields
    total_items?: number
    total_stock_on_hand?: number
    inventory_value?: number
    out_of_stock_count?: number

    // Merchandiser fields
    active_vouchers?: number
    vouchers_redeemed_total?: number
  }

  // Inventory Manager Specifics
  low_stock_alerts?:
    | Array<{
        id: number
        sku: string
        name: string
        current_level: number
        reorder_point: number
        status: "Critical" | "Low"
      }>
    | Record<string, any>
  recent_movements?: Array<{
    id: number
    event: string
    description: string
    causer: string
    time_ago: string
  }>
  stock_distribution?: Array<{
    name: string
    total: number | string
    unit: string
  }>
  monthly_sales?: Array<{ month: string; total: number }>
  category_percentage?: Array<{ name: string; total: number }>
  sales_percentage?: Array<{ description: string; total: number }>
  customer_percentage?: Array<{ name: string; total: number }>
  selected_year?: string
  available_years?: string[]

  // Inventory Officer Props
  officer_stats?: {
    pending_orders_count: number
    items_to_release_count: number
    low_stock_count: number
  }
  transaction_queue?: Array<{
    id: number
    order_number: string
    customer_name: string
    items_count: number
    status: string
    time_ago: string
    priority: string
    items: Array<{
      item_name: string
      sku: string
      quantity_to_release: number
      bin_location: string
    }>
  }>
  officer_low_stock_alerts?: Array<{
    id: number
    sku: string
    name: string
    current_level: number
    reorder_point: number
    severity: string
    location: string
  }>
  recent_activity?: Array<{
    description: string
    time: string
    date: string
    type: string
  }>

  // Merchandiser Specifics
  action_items?: {
    unpriced_items: Array<{
      id: number
      sku: string
      name: string
      stock_count: number
    }>
    slow_moving_stock: Array<{ name: string; reason: string }>
  }
  recent_price_changes?: Array<{
    item: string
    sku: string
    old_price: number
    new_price: number
    changed_at: string
  }>
  category_distribution?: Array<{ name: string; total: number }>
  charts?: {
    monthly_sales: Array<{ month: string; total: number }>
    category_sales: Array<{ name: string; total: number }>
    customer_sales: Array<{ name: string; total: number }>
  }

  // Administrator Props
  admin_kpis?: {
    total_users: number
    inactive_users: number
    active_integrations: number
    keys_expiring_soon: number
    total_branches: number
  }
  admin_charts?: {
    role_distribution: Array<{ name: string; count: number }>
  }
  admin_activity_feed?: Array<{
    id: number
    description: string
    causer: string
    module: string
    event: string
    created_at: string
    time_ago: string
    severity: "high" | "normal"
  }>

  // Purchasing Sales Head Props
  purchasing_sales_head_data?: {
    kpis: {
      total_revenue: number
      revenue_growth_percentage: number
      total_orders: number
      active_customers: number
      avg_order_value: number
    }
    charts: {
      monthly_sales: Array<{ month: string; total: number }>
      category_distribution: Array<{ name: string; value: number }>
      customer_segmentation: Array<{
        type: string
        total_sales: number
        transaction_count: number
      }>
      top_products: Array<{
        description: string
        sku: string
        total_qty: number
        order_frequency: number
      }>
    }
    price_analysis: Array<{
      item_name: string
      category: string
      old_price: number
      new_price: number
      user: string
      date: string
      is_increase: boolean
    }>
    selected_year: string
    available_years: string[]
  }

  // Supervisor Props
  supervisor_charts?: {
    monthly_sales: Array<{ month: string; total: number }>
    category_distribution: Array<{ name: string; value: number }>
    sales_percentage: Array<{
      description: string
      sku: string
      total_qty: number
      order_frequency: number
    }>
    customer_segmentation: Array<{
      type: string
      total_sales: number
      transaction_count: number
    }>
    monthly_sales_summary: Array<{
      month: string
      cash_sales: number
      credit_sales: number
      total: number
    }>
  }

  // EVP Props
  executive_summary: {
    kpis: {
      total_revenue: number
      average_order_value: number
      total_credit_outstanding: number
      active_customers: number
    }
    charts: {
      sales_performance: Array<{ month: string; total: number }>
      category_distribution: {
        name: string
        total: number | string
        unit: string
      }[]
      customer_segmentation: Array<{
        type: string
        total_sales: number
        transaction_count: number
      }>
      credit_rating_distribution: Array<{
        stars: number
        label: string
        count: number
      }>
      top_performing_items: Array<{
        description: string
        total_qty: number
      }>
      monthly_sales: Array<{ month: string; total: number }>
      sales_percentage: Array<{
        description: string
        sku: string
        total_qty: number
        order_frequency: number
      }>
      monthly_sales_summary: Array<{
        month: string
        cash_sales: number
        credit_sales: number
        total: number
      }>
    }
    risk_management: {
      at_risk_customers: Array<{
        name: string
        rating: number
        balance: number
        utilization: number
      }>
      credit_exposure: {
        total_limit: number
        total_balance: number
        exposure_percentage: number
      }
    }
  }
}

export default function DashboardPage(props: DashboardProps) {
  const { auth } = usePage<SharedData>().props
  const user = auth.user

  const isAdministrator = user.roles.some(
    (role) => role.name === ROLES_FEATURES_PERMISSIONS.ADMINISTRATOR.role,
  )
  const isSalesOfficer = user.roles.some(
    (role) => role.name === ROLES_FEATURES_PERMISSIONS.SALES_OFFICER.role,
  )
  const isCashier = user.roles.some(
    (role) => role.name === ROLES_FEATURES_PERMISSIONS.CASHIER.role,
  )
  const isInventoryManager = user.roles.some(
    (role) => role.name === ROLES_FEATURES_PERMISSIONS.INVENTORY_MANAGER.role,
  )
  const isInventoryOfficer = user.roles.some(
    (role) => role.name === ROLES_FEATURES_PERMISSIONS.INVENTORY_OFFICER.role,
  )
  const isMerchandiser = user.roles.some(
    (role) => role.name === ROLES_FEATURES_PERMISSIONS.MERCHANDISER.role,
  )
  const isPurchasingSalesHead = user.roles.some(
    (role) =>
      role.name === ROLES_FEATURES_PERMISSIONS.PURCHASING_AND_SALES_HEAD.role,
  )
  const isSupervisor = user.roles.some(
    (role) => role.name === ROLES_FEATURES_PERMISSIONS.SUPERVISOR.role,
  )
  const isEVP = user.roles.some(
    (role) => role.name === ROLES_FEATURES_PERMISSIONS.EVP.role,
  )
  const isSuperAdmin = user.roles.some(
    (role) => role.name === ROLES_FEATURES_PERMISSIONS.SUPER_ADMIN.role,
  )

  const getTitle = () => {
    if (isAdministrator) return "System Administrator Dashboard"
    if (isSalesOfficer) return "Sales Officer Dashboard"
    if (isCashier) return "Cashier Dashboard"
    if (isInventoryManager) return "Inventory Manager Dashboard"
    if (isInventoryOfficer) return "Inventory Officer Dashboard"
    if (isMerchandiser) return "Merchandiser Dashboard"
    if (isPurchasingSalesHead) return "Purchasing & Sales Head Dashboard"
    if (isSupervisor) return "Supervisor Dashboard"
    if (isEVP) return "Executive Dashboard"
    if (isSuperAdmin) return "Super Admin Dashboard"
    return "Dashboard"
  }

  const officerStats = props.stats as unknown as {
    pending_orders_count: number
    items_to_release_count: number
    low_stock_count: number
  }

  const inventoryKpis = props.kpis as unknown as {
    total_items: number
    total_stock_on_hand: number
    inventory_value: number
    out_of_stock_count: number
  }

  const merchandiserKpis = props.kpis as unknown as {
    active_vouchers: number
    vouchers_redeemed_total: number
  }

  return (
    <DashboardLayout>
      <ContentLayout title={getTitle()} userId={Number(user.id)}>
        <DynamicBreadcrumb items={dashboardPage} />

        {isSalesOfficer && props.stats && props.recent_orders && (
          <SalesOfficerDashboardSection
            stats={props.stats}
            recentOrders={props.recent_orders}
          />
        )}

        {isCashier && props.daily_collections && props.pending_transactions && (
          <CashierDashboardSection
            dailyCollections={props.daily_collections}
            pendingTransactions={props.pending_transactions}
            totalCollectedToday={props.total_collected_today || 0}
            queueCount={props.queue_count || 0}
          />
        )}

        {isInventoryManager &&
          props.kpis &&
          props.low_stock_alerts &&
          props.recent_movements &&
          props.monthly_sales &&
          props.category_percentage &&
          props.sales_percentage &&
          props.stock_distribution &&
          props.customer_percentage && (
            <InventoryManagerDashboardSection
              kpis={inventoryKpis}
              low_stock_alerts={props.low_stock_alerts as any}
              recent_movements={props.recent_movements}
              monthlySales={props.monthly_sales}
              categoryPercentage={props.category_percentage}
              stock_distribution={props.stock_distribution}
              salesPercentage={props.sales_percentage}
              customerPercentage={props.customer_percentage}
              selectedYear={props.selected_year}
              availableYears={props.available_years}
            />
          )}

        {isInventoryOfficer &&
          props.transaction_queue &&
          (props.low_stock_alerts || props.officer_low_stock_alerts) &&
          props.recent_activity && (
            <InventoryOfficerDashboardSection
              stats={officerStats}
              transactionQueue={props.transaction_queue}
              lowStockAlerts={
                (props.low_stock_alerts ||
                  props.officer_low_stock_alerts ||
                  []) as any
              }
              recentActivity={props.recent_activity}
            />
          )}

        {isMerchandiser &&
          props.action_items &&
          props.kpis &&
          props.recent_price_changes &&
          props.charts && (
            <MerchandiserDashboardSection
              action_items={props.action_items}
              kpis={merchandiserKpis}
              recent_price_changes={props.recent_price_changes}
              category_distribution={props.category_distribution || []}
              charts={props.charts}
              selectedYear={props.selected_year}
              availableYears={props.available_years}
            />
          )}

        {isAdministrator &&
          props.admin_kpis &&
          props.admin_charts &&
          props.admin_activity_feed && (
            <AdministratorDashboardSection
              kpis={props.admin_kpis}
              charts={props.admin_charts}
              activity_feed={props.admin_activity_feed}
            />
          )}

        {isPurchasingSalesHead && props.purchasing_sales_head_data && (
          <PurchasingSalesHeadDashboardSection
            data={props.purchasing_sales_head_data}
          />
        )}

        {isSupervisor && props.supervisor_charts && (
          <SupervisorDashboardSection
            data={props.supervisor_charts}
            year={props.selected_year || new Date().getFullYear().toString()}
            availableYears={props.available_years}
          />
        )}

        {(isEVP || isSuperAdmin) && props.executive_summary && (
          <EVPDashboardSection
            data={{
              executive_summary: props.executive_summary,
              selected_year:
                props.selected_year || new Date().getFullYear().toString(),
              available_years: props.available_years || [
                new Date().getFullYear().toString(),
              ],
            }}
          />
        )}

        {!isAdministrator &&
          !isSalesOfficer &&
          !isCashier &&
          !isInventoryManager &&
          !isInventoryOfficer &&
          !isMerchandiser &&
          !isPurchasingSalesHead &&
          !isSupervisor &&
          !isEVP &&
          !isSuperAdmin && (
            <div className="flex h-[50vh] items-center justify-center">
              <span className="text-muted-foreground">
                Dashboard Placeholder (Role Not Recognized or No Data)
              </span>
            </div>
          )}
      </ContentLayout>
    </DashboardLayout>
  )
}

DashboardPage.layout = (page: ReactNode) => (
  <PageLayout title="Dashboard" metaDescription="Operational dashboard">
    {page}
  </PageLayout>
)
