import AuthenticationController from "@/actions/App/Http/Controllers/Auth/AuthenticationController"
import EmailVerificationController from "@/actions/App/Http/Controllers/Auth/EmailVerificationController"
import ApiKeyController from "@/actions/App/Http/Controllers/Integration/ApiKeyController"
import AppsController from "@/actions/App/Http/Controllers/Integration/AppsController"
import BlobAttachmentsController from "@/actions/App/Http/Controllers/Items/BlobAttachmentsController"
import CategoriesController from "@/actions/App/Http/Controllers/Items/CategoriesController"
import ItemController from "@/actions/App/Http/Controllers/Items/ItemController"
import PriceController from "@/actions/App/Http/Controllers/Items/PriceController"
import StockAdjustmentController from "@/actions/App/Http/Controllers/Items/StockAdjustmentController"
import StockInController from "@/actions/App/Http/Controllers/Items/StockInController"
import StockTransferController from "@/actions/App/Http/Controllers/Items/StockTransferController"
import SupplierController from "@/actions/App/Http/Controllers/Items/SupplierController"
import UnitController from "@/actions/App/Http/Controllers/Items/UnitController"
import CreateOrderController from "@/actions/App/Http/Controllers/Menu/CreateOrderController"
import CustomersController from "@/actions/App/Http/Controllers/Menu/CustomersController"
import DashboardController from "@/actions/App/Http/Controllers/Menu/DashboardController"
import NotificationController from "@/actions/App/Http/Controllers/Notifications/NotificationController"
import DiscountController from "@/actions/App/Http/Controllers/Operations/DiscountController"
import StockLocationsController from "@/actions/App/Http/Controllers/Operations/StockLocationsController"
import VoidReasonController from "@/actions/App/Http/Controllers/Operations/VoidReasonController"
import VoucherController from "@/actions/App/Http/Controllers/Operations/VoucherController"
import ActiveOrdersController from "@/actions/App/Http/Controllers/Orders/ActiveOrdersController"
import PriceReportController from "@/actions/App/Http/Controllers/Reports/PriceReportController"
import ReturnFromCustomerController from "@/actions/App/Http/Controllers/Returns/ReturnFromCustomerController"
import ReturnToSupplierController from "@/actions/App/Http/Controllers/Returns/ReturnToSupplierController"
import UsersController from "@/actions/App/Http/Controllers/Settings/UsersController"
import twoFactor from "@/routes/two-factor"

export const API_ROUTES = {
  // AUTH
  LOGIN: AuthenticationController.loginUser.url(),
  LOGOUT: AuthenticationController.logoutUser.url(),
  REGISTER: UsersController.registerUser.url(),
  FORGOT_PASSWORD: AuthenticationController.sendResetPasswordByEmail.url(),
  RESET_PASSWORD: AuthenticationController.resetUserPassword.url(),
  TWO_FACTOR_CHALLENGE: twoFactor.login.store.url(),
  RESEND_VERIFICATION_EMAIL:
    EmailVerificationController.sendEmailVerificationLinkByEmail.url(),
  CHANGE_PASSWORD: AuthenticationController.updateUserPassword.url(),

  // PROJECTS
  GET_APPS: AppsController.renderAppsPage.url(),
  CREATE_APP: AppsController.createApp.url(),
  UPDATE_APP: (id: string | number) =>
    AppsController.updateApp.url({ apps: String(id) }),
  DELETE_APP: (id: string | number) =>
    AppsController.deleteApp.url({ apps: String(id) }),

  // API KEYS
  CREATE_API_KEY: (slug: string | number, appId: string | number) =>
    ApiKeyController.createApiKey.url({ slug, app: String(appId) }),
  UPDATE_API_KEY: (
    slug: string | number,
    appId: string | number,
    apikeyId: string | number,
  ) =>
    ApiKeyController.updateApiKey.url({
      slug,
      app: String(appId),
      apikey: Number(apikeyId),
    }),
  DELETE_API_KEY: (
    slug: string | number,
    appId: string | number,
    apikeyId: string | number,
  ) =>
    ApiKeyController.deleteApiKey.url({
      slug,
      app: String(appId),
      apikey: Number(apikeyId),
    }),

  // USER
  CREATE_USER: UsersController.registerUser.url(),
  UPDATE_USER: (id: string | number) =>
    UsersController.updateUser.url({ user: Number(id) }),
  DELETE_USER: (id: string | number) =>
    UsersController.deleteUser.url({ user: Number(id) }),

  // ITEMS
  CREATE_ITEM: ItemController.createItem.url(),
  UPDATE_ITEM: (id: string | number) =>
    ItemController.updateItem.url({ items: Number(id) }),
  DELETE_ITEM: (id: string | number) =>
    ItemController.deleteItem.url({ items: Number(id) }),

  // PRICE
  ATTACH_PRICE: PriceController.attachItemSellingPrice.url(),
  UPDATE_PRICE: (id: string | number) =>
    PriceController.updateItemSellingPrice.url({ id: Number(id) }),
  DETACH_PRICE: (id: string | number) =>
    PriceController.detachedItemSellingPrice.url({ item: Number(id) }),

  // STOCK-IN
  CREATE_STOCK_IN: StockInController.createStock.url(),

  // STOCK TRANSFER
  CREATE_STOCK_TRANSFER: StockTransferController.stockTransfer.url(),

  // STOCK ADJUSTMENT
  CREATE_STOCK_ADJUSTMENT: StockAdjustmentController.create.url(),
  SET_CHECKED_STOCK_ADJUSTMENT: (id: string | number) =>
    StockAdjustmentController.setChecked.url({ stockAdjustment: Number(id) }),
  APPROVE_STOCK_ADJUSTMENT: (id: string | number) =>
    StockAdjustmentController.approve.url({ stockAdjustment: Number(id) }),
  REJECT_STOCK_ADJUSTMENT: (id: string | number) =>
    StockAdjustmentController.reject.url({ stockAdjustment: Number(id) }),

  // CATEGORIES
  CREATE_CATEGORY: CategoriesController.createCategory.url(),
  UPDATE_CATEGORY: (id: string | number) =>
    CategoriesController.updateCategory.url({ category: Number(id) }),
  DELETE_CATEGORY: (id: string | number) =>
    CategoriesController.deleteCategory.url({ category: Number(id) }),

  // UNIT OF MEASURE
  CREATE_UNIT_OF_MEASURE: UnitController.createUnit.url(),
  UPDATE_UNIT_OF_MEASURE: (id: string | number) =>
    UnitController.updateUnit.url({ unit: Number(id) }),
  DELETE_UNIT_OF_MEASURE: (id: string | number) =>
    UnitController.deleteUnit.url({ unit: Number(id) }),

  // SUPPLIER
  CREATE_SUPPLIER: SupplierController.createSupplier.url(),
  UPDATE_SUPPLIER: (id: string | number) =>
    SupplierController.updateSupplier.url({ suppliers: Number(id) }),
  DELETE_SUPPLIER: (id: string | number) =>
    SupplierController.deleteSupplier.url({ suppliers: Number(id) }),

  // CUSTOMERS
  CREATE_CUSTOMER: CustomersController.createCustomer.url(),
  UPDATE_CUSTOMER: (id: string | number) =>
    CustomersController.updateCustomer.url({ customers: Number(id) }),
  DELETE_CUSTOMER: (id: string | number) =>
    CustomersController.deleteCustomer.url({ customers: Number(id) }),
  PAY_CREDIT: CustomersController.payCreditOrder.url(),

  // DISCOUNT
  CREATE_DISCOUNT: DiscountController.createDiscount.url(),
  UPDATE_DISCOUNT: (id: string | number) =>
    DiscountController.updateDiscount.url({ discount: Number(id) }),
  DELETE_DISCOUNT: (id: string | number) =>
    DiscountController.deleteDiscount.url({ discount: Number(id) }),

  // VOUCHER
  CREATE_VOUCHER: VoucherController.createVoucher.url(),
  UPDATE_VOUCHER: (id: string | number) =>
    VoucherController.updateVoucher.url({ voucher: Number(id) }),
  DELETE_VOUCHER: (id: string | number) =>
    VoucherController.deleteVoucher.url({ voucher: Number(id) }),
  APPLY_VOUCHER: VoucherController.applyVoucher.url(),

  // VOID REASON
  CREATE_VOID_REASON: VoidReasonController.createVoidReason.url(),
  UPDATE_VOID_REASON: (id: string | number) =>
    VoidReasonController.updateVoidReason.url({
      voidReason: Number(id),
    }),
  DELETE_VOID_REASON: (id: string | number) =>
    VoidReasonController.deleteVoidReason.url({
      voidReason: Number(id),
    }),

  // VOID ORDER
  VOID_ORDER: ActiveOrdersController.voidOrder.url(),

  // STOCK LOCATIONS
  CREATE_STOCK_LOCATION: StockLocationsController.createStockLocation.url(),
  UPDATE_STOCK_LOCATION: (id: string | number) =>
    StockLocationsController.updateStockLocation.url({
      stockLocation: Number(id),
    }),
  DELETE_STOCK_LOCATION: (id: string | number) =>
    StockLocationsController.deleteStockLocation.url({
      stockLocation: Number(id),
    }),

  // RETURN FROM CUSTOMER
  CREATE_RETURN_FROM_CUSTOMER: ReturnFromCustomerController.createRFCForm.url(),
  FETCH_ITEMS_ORDERED_BY_CUSTOMER: (customerID: string | number) =>
    ReturnFromCustomerController.getItemsOrderedByCustomer.url({ customerID }),
  CHECK_RETURN_FROM_CUSTOMER: (id: string | number) =>
    ReturnFromCustomerController.setRFCFormToChecked({ id }),
  APPROVE_RETURN_FROM_CUSTOMER: (id: string | number) =>
    ReturnFromCustomerController.approveRFCForm({ id }),
  REJECT_RETURN_FROM_CUSTOMER: (id: string | number) =>
    ReturnFromCustomerController.rejectRFCForm({ id }),

  // RETURN FROM SUPPLIER
  SEARCH_SUPPLIER: ReturnToSupplierController.searchSuppliers.url(),
  FETCH_ITEMS_UNDER_SUPPLIER: (id: string | number) =>
    ReturnToSupplierController.getItemsUnderSupplier.url({ supplierID: id }),
  CREATE_RETURN_TO_SUPPLIER: ReturnToSupplierController.createRTSForm.url(),
  CHECK_RETURN_TO_SUPPLIER: (id: number) =>
    ReturnToSupplierController.setRTSFormToChecked({ id }),
  APPROVE_RETURN_TO_SUPPLIER: (id: number) =>
    ReturnToSupplierController.approveRTSForm({ id }),
  REJECT_RETURN_TO_SUPPLIER: (id: number) =>
    ReturnToSupplierController.rejectRTSForm({ id }),

  // MENU
  SEARCH_CUSTOMER: CreateOrderController.searchCustomers.url(),
  CREATE_ORDER: CreateOrderController.createOrder.url(),
  GET_DRAFTS: CreateOrderController.getDrafts.url(),
  QUICK_ITEM_LOOKUP: DashboardController.lookupItem.url(),

  // PRICE REPORTS
  GET_TOP_PROFITABLE_ITEMS: PriceReportController.getTotalRevenue.url(),
  GET_FAST_MOVING_ITEMS: PriceReportController.getFastMovingItems.url(),
  GET_SLOW_MOVING_ITEMS: PriceReportController.getSlowMovingItems.url(),

  // ORDERS
  SERVE_ORDER: ActiveOrdersController.serveOrder.url(),
  PROCESS_ORDER: ActiveOrdersController.processOrderReceipt.url(),
  GET_ACTIVE_VOUCHERS: ActiveOrdersController.getManyActiveVoucers.url(),

  // BLOB ATTACHMENTS
  GET_MANY_BLOB_ATTACHMENTS:
    BlobAttachmentsController.getManyBlobAttachments.url(),
  GET_BY_ID_BLOB_ATTACHMENTS: (id: string | number) =>
    BlobAttachmentsController.getBlobAttachmentById.url(id),
  UPLOAD_BLOB_ATTACHMENTS:
    BlobAttachmentsController.uploadBlobAttachmentById.url(),
  UPDATE_BLOB_ATTACHMENTS: (id: string | number) =>
    BlobAttachmentsController.updateBlobAttachmentById.url(id),
  DELETE_BLOB_ATTACHMENTS: (id: string | number) =>
    BlobAttachmentsController.deleteBlobAttachmentById.url(id),

  // NOTIFICATIONS
  GET_MANY_NOTIFICATIONS: NotificationController.getManyNotifications.url(),
  UPDATE_NOTIFICATION: (id: string | number) =>
    NotificationController.updateNotification.url({ notification: Number(id) }),
}
