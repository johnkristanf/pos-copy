import AuthenticationController from "@/actions/App/Http/Controllers/Auth/AuthenticationController"
import ApiKeyController from "@/actions/App/Http/Controllers/Integration/ApiKeyController"
import AppsController from "@/actions/App/Http/Controllers/Integration/AppsController"
import CategoriesController from "@/actions/App/Http/Controllers/Items/CategoriesController"
import InventoryController from "@/actions/App/Http/Controllers/Items/InventoryController"
import ItemController from "@/actions/App/Http/Controllers/Items/ItemController"
import ItemSoldController from "@/actions/App/Http/Controllers/Items/ItemSoldController"
import PriceController from "@/actions/App/Http/Controllers/Items/PriceController"
import StockAdjustmentController from "@/actions/App/Http/Controllers/Items/StockAdjustmentController"
import StockInController from "@/actions/App/Http/Controllers/Items/StockInController"
import StockTransferController from "@/actions/App/Http/Controllers/Items/StockTransferController"
import SupplierController from "@/actions/App/Http/Controllers/Items/SupplierController"
import UnitController from "@/actions/App/Http/Controllers/Items/UnitController"
import CreateOrderController from "@/actions/App/Http/Controllers/Menu/CreateOrderController"
import CustomersController from "@/actions/App/Http/Controllers/Menu/CustomersController"
import DashboardController from "@/actions/App/Http/Controllers/Menu/DashboardController"
import ProductsController from "@/actions/App/Http/Controllers/Menu/ProductsController"
import DiscountController from "@/actions/App/Http/Controllers/Operations/DiscountController"
import PaymentMethodController from "@/actions/App/Http/Controllers/Operations/PaymentMethodController"
import StockLocationsController from "@/actions/App/Http/Controllers/Operations/StockLocationsController"
import VoidReasonController from "@/actions/App/Http/Controllers/Operations/VoidReasonController"
import VoucherController from "@/actions/App/Http/Controllers/Operations/VoucherController"
import ActiveOrdersController from "@/actions/App/Http/Controllers/Orders/ActiveOrdersController"
import AllOrdersController from "@/actions/App/Http/Controllers/Orders/AllOrdersController"
import CancelledOrdersController from "@/actions/App/Http/Controllers/Orders/CancelledOrdersController"
import CompleteOrdersController from "@/actions/App/Http/Controllers/Orders/CompleteOrdersController"
import PriceReportController from "@/actions/App/Http/Controllers/Reports/PriceReportController"
import SalesReportController from "@/actions/App/Http/Controllers/Reports/SalesReportController"
import ReturnFromCustomerController from "@/actions/App/Http/Controllers/Returns/ReturnFromCustomerController"
import ReturnToSupplierController from "@/actions/App/Http/Controllers/Returns/ReturnToSupplierController"
import ActivityLogController from "@/actions/App/Http/Controllers/Settings/ActivityLogController"
import UsersController from "@/actions/App/Http/Controllers/Settings/UsersController"

export const PAGE_ROUTES = {
  // AUTH
  LOGIN_PAGE: AuthenticationController.renderLoginPage.url(),
  FORGOT_PASSWORD_PAGE: AuthenticationController.renderForgotPasswordPage.url(),
  RESET_PASSWORD_PAGE: (token: string | number) =>
    AuthenticationController.renderResetPasswordPage.url(token),

  // MENU
  DASHBOARD_PAGE: DashboardController.renderDashboardPage.url(),
  CUSTOMERS_PAGE: CustomersController.renderCustomersPage.url(),
  CREATE_ORDERS_PAGE: CreateOrderController.renderCreateOrderPage.url(),
  CUSTOMER_PROFILE_PAGE: (
    customer: string | number | { id: string | number },
  ) => {
    const normalized: number | { customerId: number } =
      typeof customer === "object"
        ? { customerId: Number((customer as { id: string | number }).id) }
        : Number(customer as string | number)

    return CustomersController.renderCustomerProfilePage.url(normalized)
  },
  PRODUCTS_PAGE: ProductsController.renderProductsPage.url(),

  // INTEGRATION
  INTEGRATION_APPS_PAGE: AppsController.renderAppsPage.url(),
  INTEGRATION_API_KEYS_PAGE: (
    slug: string | number,
    app: string | { id: string },
  ) => {
    const normalizedApp: string = typeof app === "object" ? app.id : String(app)

    return ApiKeyController.renderApiKeyPage.url({ slug, app: normalizedApp })
  },

  // SETTINGS
  ME_PAGE: UsersController.renderMePage.url(),
  USER_PAGE: (user: string | number | { id: string | number }) => {
    const normalized: number | { id: number } =
      typeof user === "object"
        ? { id: Number((user as { id: string | number }).id) }
        : Number(user as string | number)

    return UsersController.renderUserPage.url(normalized)
  },
  USERS_PAGE: UsersController.renderUsersPage.url(),
  ACTIVITY_LOG_PAGE: ActivityLogController.renderActivityLogPage.url(),

  // ITEMS
  ITEMS_CATEGORY_PAGE: CategoriesController.renderCategoryPage.url(),
  ITEMS_ITEM_PAGE: ItemController.renderItemPage.url(),
  ITEMS_INVENTORY_PAGE: InventoryController.renderInventoryPage.url(),
  ITEMS_PRICE: PriceController.renderPricePage.url(),
  ITEMS_STOCK_IN_PAGE: StockInController.renderStockInPage.url(),
  ITEMS_STOCK_TRANSFER_PAGE:
    StockTransferController.renderStrockTransferPage.url(),
  ITEMS_SOLD_PAGE: ItemSoldController.renderItemSoldPage.url(),
  ITEMS_STOCK_ADJUSTMENT_PAGE:
    StockAdjustmentController.renderStockAdjustmentPage.url(),
  ITEM_UNIT_OF_MEASURE: UnitController.renderUnitOfMeasurePage.url(),
  ITEM_SUPPLIER: SupplierController.renderSupplierPage.url(),

  // OPERATIONS
  OPERATIONS_PAYMENT_METHOD_PAGE:
    PaymentMethodController.renderPaymentMethodPage.url(),
  OPERATIONS_DISCOUNTS_PAGE: DiscountController.renderDiscountPage.url(),
  OPERATIONS_VOUCHERS_PAGE: VoucherController.renderVoucherPage.url(),
  OPERATIONS_STOCK_LOCATIONS_PAGE:
    StockLocationsController.renderStockLocationPage.url(),
  OPERATIONS_VOID_PAGE: VoidReasonController.renderVoidReasonsPage.url(),

  // RETURNS
  RETURN_FROM_CUSTOMER_PAGE:
    ReturnFromCustomerController.renderReturnFromCustomerPage.url(),
  RETURN_TO_SUPPLIER_PAGE:
    ReturnToSupplierController.renderReturnToSupplierPage.url(),

  // ORDERS
  ORDERS_ALL_ORDERS_PAGE: AllOrdersController.renderAllOrdersPage.url(),
  ORDERS_ACTIVE_ORDERS_PAGE:
    ActiveOrdersController.renderActiveOrdersPage.url(),
  ORDERS_COMPLETE_ORDERS_PAGE:
    CompleteOrdersController.renderCompleteOrdersPage.url(),
  ORDERS_CANCELLED_ORDERS_PAGE:
    CancelledOrdersController.renderCancelledOrdersPage.url(),

  // REPORTS
  REPORTS_SALES_REPORT_PAGE: SalesReportController.renderSalesReportPage.url(),
  REPORTS_PRICE_REPORT_PAGE: PriceReportController.renderPriceReportPage.url(),
}
