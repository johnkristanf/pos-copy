import {
  FormDataConvertible,
  Method,
  Progress,
  VisitOptions,
} from "@inertiajs/core"
import { InertiaLinkProps } from "@inertiajs/react"
import { LucideIcon } from "lucide-react"
import { ReactNode } from "react"
import {
  FieldValues,
  Path,
  SubmitHandler,
  UseFormReturn,
} from "react-hook-form"

// --- Form & UI Interfaces ---

export interface PasswordStrength {
  score: number
  message: string
  isStrong: boolean
  hints: string[]
  meetsRequirements: {
    hasMinLength: boolean
    hasUpperCase: boolean
    hasLowerCase: boolean
    hasNumber: boolean
    hasSpecialChar: boolean
  }
}

export interface InertiaFormConfig<TForm = Record<string, any>> {
  data: TForm
  isDirty: boolean
  errors: Partial<Record<keyof TForm, string>>
  hasErrors: boolean
  processing: boolean
  progress: Progress | null
  wasSuccessful: boolean
  recentlySuccessful: boolean
  transform: (callback: (data: TForm) => object) => void
  setData: {
    (data: TForm): void
    (key: keyof TForm, value: FormDataConvertible): void
    <K extends keyof TForm>(key: K, value: TForm[K]): void
  }
  reset: (...fields: (keyof TForm)[]) => void
  clearErrors: (...fields: (keyof TForm)[]) => void
  setError(field: keyof TForm, value: string): void
  setError(errors: Record<keyof TForm, string>): void
  submit: (method: Method, url: string, options?: VisitOptions) => void
  get: (url: string, options?: VisitOptions) => void
  patch: (url: string, options?: VisitOptions) => void
  post: (url: string, options?: VisitOptions) => void
  put: (url: string, options?: VisitOptions) => void
  delete: (url: string, options?: VisitOptions) => void
}

export interface InertiaFieldOption {
  value: string | number
  label: string
  disabled?: boolean
  icon?: ReactNode
  attributes?: string
  sku?: string
}

export interface InertiaFieldValidation {
  required?: boolean | { value: boolean; message: string }
  min?: number | { value: number; message: string }
  max?: number | { value: number; message: string }
  minLength?: number | { value: number; message: string }
  maxLength?: number | { value: number; message: string }
  pattern?: RegExp | { value: RegExp; message: string }
  validate?: (value: any) => boolean | string
}

export interface InertiaFieldConfig<TForm extends Record<string, any>> {
  name: keyof TForm & string
  label?: string
  placeholder?: string
  type?:
    | "text"
    | "email"
    | "password"
    | "password-input"
    | "number"
    | "textarea"
    | "select"
    | "multi-select"
    | "checkbox"
    | "radio"
    | "switch"
    | "toggle"
    | "date"
    | "time"
    | "datetime"
    | "file"
    | "range"
    | "color"
    | "phone"
    | "otp"
    | "blob-attachment"
    | "toggle-group"
    | "popover"
    | "custom"
  validation?: InertiaFieldValidation
  disabled?: boolean
  hidden?: boolean
  readOnly?: boolean
  autoFocus?: boolean
  autoComplete?: string
  options?: InertiaFieldOption[]
  rows?: number
  step?: number
  min?: number
  max?: number
  prefix?: ReactNode
  suffix?: ReactNode
  description?: string
  helperText?: string
  section?: string
  order?: number
  span?: number
  groupId?: string
  required?: boolean
  showRequiredMarker?: boolean
  customComponent?: (props: {
    field: any
    fieldConfig: InertiaFieldConfig<TForm>
  }) => ReactNode
  renderCondition?: (values: TForm) => boolean
  enableCondition?: (values: TForm) => boolean
  onChange?: (value: any) => void
  onBlur?: (value: any) => void
  onFocus?: (value: any) => void
  onComplete?: (value: string) => void
  otpLength?: number
  showStrengthIndicator?: boolean
  inlineOptions?: boolean
  maxDisplay?: number
  searchable?: boolean
  clearable?: boolean
  wrapperClassName?: string
  labelClassName?: string
  inputClassName?: string
  descriptionClassName?: string
  errorClassName?: string
  optionClassName?: string
  containerClassName?: string
  stepNumber?: number
  showSearch?: boolean
  onSearch?: (query: string) => void
  showClearButton?: boolean
  isUserSignature?: boolean
}

export interface InertiaFormSection {
  id: string
  title: string
  description?: string
  className?: string
  titleClassName?: string
  contentClassName?: string
}

export interface FormStep {
  id: string
  title: string
  description?: string
  fields: string[]
  icon?: ReactNode
  optional?: boolean
}

export interface DynamicInertiaFormProps<TForm extends Record<string, any>> {
  form: InertiaFormConfig<TForm>
  onSubmit: (e: React.FormEvent) => void
  fields: InertiaFieldConfig<TForm>[]
  sections?: InertiaFormSection[]
  submitButtonTitle?: string
  resetButtonTitle?: string
  className?: string
  disabled?: boolean
  submitButtonClassname?: string
  submitButtonTitleClassname?: string
  onReset?: () => void
  onCancel?: () => void
  addCancelButton?: boolean
  twoColumnLayout?: boolean
  gridColumns?: 1 | 2 | 3 | 4
  showSectionDividers?: boolean
  showLabels?: boolean
  size?: "sm" | "md" | "lg"
  isMultiStepForm?: boolean
  steps?: FormStep[]
  onStepChange?: (step: number) => void
  validateStepBeforeNext?: boolean
  schema?: z.ZodObject<any> | z.ZodEffects<any>
  debug?: boolean
}

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
  icon?: React.ReactNode
}

export interface FormSection {
  id: string
  title: string
  description?: string
  defaultExpanded?: boolean
  className?: string
  titleClassName?: string
  contentClassName?: string
  collapsible?: boolean
}

export interface PasswordValidationRules {
  minLength?: number
  requireUppercase?: boolean
  requireLowercase?: boolean
  requireNumber?: boolean
  requireSpecialChar?: boolean
  customRegex?: RegExp
  customErrorMessage?: string
  preventCommonPasswords?: boolean
  preventSequentialChars?: boolean
  preventRepeatingChars?: boolean
}

export interface CurrencyConfig {
  code: string
  symbol: string
  locale?: string
  decimals?: number
  allowNegative?: boolean
}

export interface DateValidation {
  minDate?: Date | string
  maxDate?: Date | string
  disabledDates?: Date[]
  disabledDaysOfWeek?: number[]
  excludePastDates?: boolean
  excludeFutureDates?: boolean
}

export interface FileUploadConfig {
  accept?: string
  multiple?: boolean
  maxSize?: number
  minSize?: number
  maxFiles?: number
  allowedTypes?: string[]
}

export interface ImageUploadConfig extends FileUploadConfig {
  aspectRatio?: number
  minWidth?: number
  minHeight?: number
  maxWidth?: number
  maxHeight?: number
}

export interface ValidationRules {
  required?: boolean | string
  minLength?: number | { value: number; message: string }
  maxLength?: number | { value: number; message: string }
  pattern?: RegExp | { value: RegExp; message: string }
  min?: number | { value: number; message: string }
  max?: number | { value: number; message: string }
  validate?: (value: any) => boolean | string
  passwordRules?: PasswordValidationRules
}

export interface FieldConfig<TFieldValues> {
  name: Path<TFieldValues>
  type:
    | "text"
    | "password"
    | "password-input"
    | "email"
    | "number"
    | "select"
    | "multiselect"
    | "image"
    | "textarea"
    | "file"
    | "switch"
    | "currency"
    | "date"
    | "dateRange"
    | "checkbox"
    | "radio"
    | "phone"
    | "color"
    | "range"
    | "toggle"
    | "richtext"
    | "otp"
    | "custom"
  label: string
  placeholder: string
  className?: string
  labelClassName?: string
  inputClassName?: string
  errorClassName?: string
  description?: string
  descriptionClassName?: string
  options?: SelectOption[]
  optionClassName?: string
  inlineOptions?: boolean
  defaultValue?: any
  defaultValues?: string[]
  showRequiredMarker?: boolean
  hidden?: boolean
  disabled?: boolean
  readOnly?: boolean
  autoFocus?: boolean
  autoComplete?: string
  validation?: ValidationRules
  required?: boolean | string
  section?: string
  span?: 1 | 2 | 3 | 4
  order?: number
  wrapperClassName?: string
  passwordConfig?: PasswordValidationRules
  currencyConfig?: CurrencyConfig
  dateConfig?: DateValidation
  fileConfig?: FileUploadConfig
  imageConfig?: ImageUploadConfig
  prefix?: string | React.ReactNode
  suffix?: string | React.ReactNode
  icon?: React.ReactNode
  helperText?: string
  tooltip?: string
  rows?: number
  step?: number
  min?: number
  max?: number
  showStrengthIndicator?: boolean
  otpLength?: number
  containerClassName?: string
  renderCondition?: (values: TFieldValues) => boolean
  enableCondition?: (values: TFieldValues) => boolean
  onChange?: (value: any) => void
  onBlur?: (value: any) => void
  onFocus?: (value: any) => void
  onComplete?: (value: string) => void
  customComponent?: React.ComponentType<{
    field: any
    fieldConfig: FieldConfig<TFieldValues>
  }>
}

export interface Mutation {
  isPending: boolean
}

export interface DynamicFormProps<TFieldValues extends FieldValues> {
  form: UseFormReturn<TFieldValues>
  onSubmit: SubmitHandler<TFieldValues>
  fields: FieldConfig<TFieldValues>[]
  sections?: FormSection[]
  submitButtonTitle: string
  resetButtonTitle?: string
  mutation?: Mutation
  className?: string
  disabled?: boolean
  submitButtonClassname?: string
  submitButtonTitleClassname?: string
  onReset?: () => void
  onCancel?: () => void
  isSignUp?: boolean
  isSignIn?: boolean
  isResetPassword?: boolean
  isOnEditAccount?: boolean
  isFloatingLabelInput?: boolean
  addCancelButton?: boolean
  twoColumnLayout?: boolean
  isUsingImagekit?: boolean
  gridColumns?: 1 | 2 | 3 | 4
  showSectionDividers?: boolean
  autoSave?: boolean
  autoSaveDelay?: number
  showLabels?: boolean
  size?: "sm" | "md" | "lg"
}

export interface BreadcrumbItemProps<T extends string = string> {
  label: string
  href?: string
}

export interface BreadcrumbItem {
  title: string
  href: string
}

export interface DatePreset {
  label: string
  from: Date
  to: Date
  shortcut: string
}

export interface NavGroup {
  title: string
  items: NavItem[]
}

export interface NavItem {
  title: string
  href: NonNullable<InertiaLinkProps["href"]>
  icon?: LucideIcon | null
  isActive?: boolean
}

// --- Shared Data & Responses ---

export interface Auth {
  user: User
}

export interface SharedData {
  auth: Auth
  apps?: PaginatedApps
  [key: string]: unknown
}

export interface PaginationLink {
  url: string | null
  label: string
  page: number | null
  active: boolean
}

export interface PaginatedResponse<T> {
  current_page: number
  data: T[]
  first_page_url: string
  from: number | null
  last_page: number
  last_page_url: string
  links: PaginationLink[]
  next_page_url: string | null
  path: string
  per_page: number
  prev_page_url: string | null
  to: number | null
  total: number
}

export interface PaginationInfo {
  currentPage: number
  lastPage: number
  total: number
  from: number | null
  to: number | null
  hasNextPage: boolean
  hasPrevPage: boolean
}

// --- Domain Entities ---

// Roles & Permissions
export interface Role {
  id: number
  code: number
  name: string
  app_features?: (SpecificUserFeature & {
    pivot?: { permission_id?: number; feature_id?: number }
  })[]
  app_permissions?: (Permission & {
    pivot?: { permission_id?: number; feature_id?: number }
  })[]
}

export interface Permission {
  id: number
  name: string
}

export interface UserRole extends Role {
  created_at: string
  updated_at: string
  pivot?: {
    user_id: number
    role_id: number
  }
}

export interface FeaturePermission {
  id: number
  permissions: string[]
}

export interface UserFeature {
  pivot: any
  id: number
  tag: string
  name: string
  permissions: string[]
}

export interface SpecificUserFeature {
  id: number
  tag: string
  name: string
}

// Locations (Geographic & Stock)
export interface Location {
  id: number
  name?: string
  country?: string
  region?: string
  province?: string
  municipality?: string
  barangay?: string
}

export interface StockLocation {
  id: number
  tag?: string
  name: string
  branch_id?: number
  created_at?: string
  updated_at?: string
  pivot?: {
    user_id: number
    stock_location_id: number
  }
}

// Users
export interface User {
  id: number
  first_name: string
  middle_name: string | null
  last_name: string
  name: string
  email: string
  email_verified_at: string | null
  two_factor_confirmed_at: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
  user_signature: string | null
  signature_attachment?: BlobAttachment | null
  user_image: string | null
  img_attachment?: BlobAttachment | null
  roles: UserRole[]
  assigned_stock_locations: StockLocation[]
  user_features: UserFeature[]
}

export interface PaginatedUsers extends PaginatedResponse<User> {}

// Apps & API Keys
export interface App {
  id: number | string
  name: string
  slug: string
  isactive?: boolean | number | undefined
  api_keys?: ApiKey[]
  api_keys_count?: number
  created_at?: Date
  updated_at?: Date
}

export interface PaginatedApps extends PaginatedResponse<App> {}

export interface AppFeature {
  id: number
  name: string
  permissions: string[]
}

export type ApiKeyType = "inbound" | "outbound"

export interface ApiKey {
  id: number
  type: ApiKeyType
  label: string
  api_key: string
  key_preview: string
  status: string | boolean
  expiration_label: string
  created_at: string
  expiration_date?: string | null
  updated_at?: string | null
  last_used_at?: string | null
  app_id?: string | number | null
  app_name?: string | null
  key_expiration_id?: number | null
  scopes?: string[] | null
  features?: FeaturePermission[] | null
}

export interface PaginatedApiKeys extends PaginatedResponse<ApiKey> {}

export interface KeyExpirationOption {
  value: string
  label: string
  slug: string
}

// Activity Log
export interface ActivityLog {
  id: number
  log_name: string
  description: string
  event: string
  properties: Record<string, any> | null
  device_info: string
  device_type: string
  browser: string
  platform: string
  ip_address: string
  created_at: string
  causer: {
    id: number | string
    type: string
    name: string
  } | null
}

export interface PaginatedActivityLogs extends PaginatedResponse<ActivityLog> {}

export interface ActivityLogFilters {
  search?: string
  search_by?: string
  date_from?: string
  date_to?: string
  log_name?: string
  event?: string
  device_type?: string
  causer_type?: string
  causer_id?: number
}

export enum ReturnStatus {
  ForChecking = "for_checking",
  ForApproval = "for_approval",
}

export interface PreparedBy {
  id: number
  first_name: string
  last_name: string
}

export interface ReturnFromCustomer {
  id: number
  invoice_number: string
  invoice_issued_date: string
  reason: string
  customer_id: number
  prepared_by: PreparedBy
  check_by: string
  approved_by: string
  rejected_by: string
  status: ReturnStatus
  created_at: string
  updated_at: string
  customer: Customer
  items: Items[]
  checked_by: string
  approved_by: string
  rejected_by: string
}

export interface PaginatedReturnFromCustomer
  extends PaginatedResponse<ReturnFromCustomer> {}

type TransactionType = "replacement" | "offset"

export interface ReturnToSupplier {
  id: number
  type: TransactionType
  remarks: string
  supplier_id: number
  prepared_by: PreparedBy
  check_by: string
  approved_by: string
  rejected_by: string
  status: ReturnStatus
  created_at: string
  updated_at: string
  supplier: Supplier
  items: Items[]
  checked_by: string
  approved_by: string
  rejected_by: string
}

export interface PaginatedReturnToSupplier
  extends PaginatedResponse<ReturnToSupplier> {}

// Items & Inventory
export interface Category {
  id: number
  code: string
  name: string
  updated_at?: string
}

export interface PaginatedCategories extends PaginatedResponse<Category> {}

export interface UnitOfMeasure {
  id: number
  code: string
  name: string
  updated_at?: string
}

export interface PaginatedUnitOfMeasure
  extends PaginatedResponse<UnitOfMeasure> {}

export interface Supplier {
  id: number
  name: string
  email?: string
  contact_person?: string
  telefax?: string
  address?: string
  shipping?: string
  terms?: string
}

export interface PaginatedSupplier extends PaginatedResponse<Supplier> {}

export interface ConversionUnit {
  id?: number
  item_id?: number
  purchase_uom_id: number
  base_uom_id: number
  conversion_factor: number | string
  created_at?: string
  updated_at?: string
  purchase_uom?: PurchaseBaseUoM
  base_uom?: PurchaseBaseUoM
  available_stocks?: number | string
}

export interface PurchaseBaseUoM {
  id: number
  name: string
}

export interface ComponentBlueprint {
  child_item_id: number
  quantity: number
}

export type ItemUnitType = "set" | "not_set"

export interface SellingPrices {
  id?: number
  item_id?: number
  unit_price?: string
  wholesale_price?: string
  credit_price?: string
}

export interface StockByUom {
  uom_id: number
  uom_name: string
  uom_code: string
  available_quantity: number
  available_quantity_precise: number
  type: "purchase_uom" | "base_uom"
  unit_price?: number
  wholesale_price?: number
  credit_price?: number
}

interface PurchasedItem {
  id: number
  purchased_quantity: number
  unit_price: string
  item_id: number
  item: {
    id: number
    sku: string
    description: string
    brand: string
    color: string
    size: string
  }
  purchase_item_uom: {
    purchased_item_id: number
    code: string
    name: string
  }
}

interface StockItem {
  id: number
  returnable_quantity: number
  location_id: number
  item_id: number
  location: {
    id: number
    tag: string
    name: string
  }
  items: {
    id: number
    sku: string
    description: string
    brand: string
    color: string
    size: string
  }
}

interface UnifiedItem {
  id: string
  deductionSourceID: number
  itemId: number
  sku: string
  description: string
  brand: string
  color: string
  size: string
  type: "stocked" | "unstocked"

  // For stocked items
  stockId?: number
  locationId?: number
  locationName?: string
  locationTag?: string
  returnableQuantity?: number

  // For unstocked items
  purchasedItemId?: number
  purchasedQuantity?: number
  unitPrice?: string
  uomCode?: string
  uomName?: string
}

export interface Item {
  id: number
  image_url: string | null
  sku: string
  description: string
  brand: string | null
  color: string | null
  size: string | null
  min_quantity: number | null
  max_quantity: number | null
  category_id: number
  supplier_id: number
  item_unit_type?: ItemUnitType
  conversion_units?: ConversionUnit[]
  components_blueprint?: ComponentBlueprint[]
  selling_prices?: SellingPrices | null
  sold_units?: number | null
  locations?: string[] | StockLocation[]
  total_available_stock?: number | null
  total_committed_stock?: number | null
  stocks_by_uom?: StockByUom[]
  stocks_price_per_uom?: StockPricePerUom[]
  stocks?: Array<{
    available_quantity: number
    location: StockLocation
  }>
  category?: Category
  supplier?: Supplier
  created_at?: string | null
  updated_at?: string | null
  // OrderableItem specifics
  is_active?: boolean
  discounts?: Discount[]
}

export interface Product {
  id: number
  image_url: string | null
  sku: string
  description: string
  brand: string | null
  color: string | null
  size: string | null
  min_quantity: number | null
  max_quantity: number | null
  category_id: number
  supplier_id: number
  item_unit_type?: ItemUnitType
  conversion_units?: ConversionUnit[]
  components_blueprint?: ComponentBlueprint[]
  locations?: string[] | StockLocation[]
  total_available_stock?: number | null
  total_committed_stock?: number | null
  stocks?: Array<{
    available_quantity: number
    location: StockLocation
  }>
  category?: Category
  supplier?: Supplier
  is_active?: boolean
  unit_price: string | number | null
  wholesale_price: string | number | null
  credit_price: string | number | null
}

// Aliases for backward compatibility or clarity
export type InventoryItem = Item
export type OrderableItem = Item
export type SoldItem = Item
export type ItemPrice = Item & { locations: StockLocation[] }

export interface PaginatedItems extends PaginatedResponse<Item> {}
export interface PaginatedInventoryItem extends PaginatedResponse<Item> {}
export interface PaginatedProducts extends PaginatedResponse<Product> {}
export interface PaginatedItemPrice extends PaginatedResponse<ItemPrice> {}
export interface PaginatedSoldItem extends PaginatedResponse<SoldItem> {}
export interface PaginatedOrderableItems
  extends PaginatedResponse<OrderableItem> {}

// Stock Operations
export interface Purchase {
  id: number
  received_at: string
}

export interface StockIn {
  id: number
  purchase_order_item_id: string
  purchased_quantity: number
  stocked_in_quantity: number
  unit_price: string
  purchase_id: number
  item_id: number
  purchased: Purchase
  item: Item
}

export interface PaginatedStockIn extends PaginatedResponse<StockIn> {}

export interface StockTransfer {
  id: number
  item_id: number
  source_stock_location_id: number
  destination_stock_location_id: number
  quantity: number
  created_at: string
  updated_at: string
  item: Item
  source_stock_location: StockLocations
  destination_stock_location: StockLocations
}

export interface PaginatedStockTransfer
  extends PaginatedResponse<StockTransfer> {}
export interface PaginatedStockLocations
  extends PaginatedResponse<StockLocation> {}

export interface StockAdjustment {
  id: number
  item_id: number
  location_id: number
  quantity: number
  action: "increase" | "deduct"
  status: "pending" | "approved" | "rejected" | "for_checking" | "for_approval"
  created_at: string
  updated_at: string
  item: Item
  stock_location: StockLocations
  preparer: any | null
  rejecter: any | null
  approver: any | null
  checker: any | null
}

export interface PaginatedStockAdjustment
  extends PaginatedResponse<StockAdjustment> {}

export interface Category {
  id: number
  code: string
  name: string
  updated_at: string
}

export interface PaginatedCategories extends PaginatedResponse<Category> {}

export interface UnitOfMeasure {
  id: number
  code: string
  name: string
  updated_at: string
}

export interface PaginatedUnitOfMeasure
  extends PaginatedResponse<UnitOfMeasure> {}

export interface Supplier {
  id: number
  name: string
  email: string
  contact_person: string
  contact_no: string
  telefax: string | null
  address: string
  shipping: string
  terms: string
  location_id: number
  created_at: string
  updated_at: string
  deleted_at: string | null
  location?: {
    id: number
    country: string
    region: string
    province: string
    municipality: string
    barangay: string
  }
}

export interface PaginatedSupplier extends PaginatedResponse<Supplier> {}

export interface Location {
  id: number
  name?: string
  country: string
  region?: string
  province?: string
  municipality?: string
  barangay?: string
}

// Customers & Orders
export interface Customer {
  id: number
  customer_code: string
  name: string
  customer_img?: string | null
  email?: string
  contact_no?: string | null
  affiliated: boolean
  orders_count?: number
  total_order_value?: number
  credit?: CustomerCredit
  isactive: boolean
  location_id: number | null
  locations?: Location
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface DetailedCustomer extends Customer {
  orders?: Order[]
}

export interface PaginatedCustomers extends PaginatedResponse<Customer> {}

export interface PaymentMethod {
  id: number
  tag?: string
  name: string
  description?: string
  created_at?: string
  updated_at?: string
}

export interface OrderItem {
  id: number
  order_id: number
  item_id: number
  selected_uom_id?: number
  status: string
  created_at: string
  updated_at: string
  deleted_at?: string | null
  quantity: number
  item?: Item
  selected_uom?: SelectedUom
  pivot: {
    order_id: number
    item_id: number
    quantity: number
    price?: string
    selected_uom_id?: number
  }
  serve_locations?: {
    quantity_to_serve: number
    quantity_served: number
  }
  selected_uom_id?: number
  quantity_ordered?: number
  served_by?: User | null
}

export interface OrderedItem {
  order_id: number
  order_item_id: number
  quantity_ordered?: number
  uom: string
  item_id: number
  item_name: string
  sku: string
  brand: string
  color: string
  size: string
}
export interface Order {
  id: number
  customer_id: number
  customer?: Customer
  total_payable: string
  is_draft: boolean
  payment_method_id: number
  payment_method?: PaymentMethod
  payment_status: string
  order_number?: string
  status?: string
  items?: Item[]
  order_items?: OrderItem[]
  voucher?: Voucher
  used_voucher?: number
  vouchers_used?: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface PaginatedOrders extends PaginatedResponse<Order> {}

export interface ServeLocation {
  id: number
  order_item_id: number
  stock_location_id: number
  quantity_to_serve: number
  quantity_served: number
  status: string
  created_at: string
  updated_at: string
  stock_location: StockLocation
}

// Operations & Discounts
export type DiscountType = "percentage" | "amount"
export type VoucherType =
  | "percentage"
  | "amount"
  | "to_cash_price"
  | "complimentary"
export type ItemCategoryType =
  | "select_category"
  | "select_item"
  | "select_supplier"
  | "all_item"

export interface Discount {
  id: number
  name: string
  description?: string
  discount_type: DiscountType
  amount: number
  min_spend: number
  capped_amount: number
  min_purchase_qty: number
  item_category_type: ItemCategoryType
  start_date: string
  start_time: string
  end_date: string
  end_time: string
  created_at: string
  updated_at: string
  category_ids: number[]
  item_ids: number[]
}

export interface PaginatedDiscount extends PaginatedResponse<Discount> {}

export interface Voucher {
  id: number
  code: string
  description: string
  type: VoucherType
  amount: number
  min_spend: number
  capped_amount: number
  created_at: string
  updated_at: string
}

export interface PaginatedVoucher extends PaginatedResponse<Voucher> {}

export interface VoidReason {
  id: number
  void_reason: string
  require_password: boolean
  created_at: string
  updated_at: string
}

export interface PaginatedVoidReasons extends PaginatedResponse<VoidReason> {}

export interface FastMovingItem {
  id: number
  description: string
  average_order_difference_days: number
}

export interface SlowMovingItem {
  id: number
  description: string
  average_order_difference_days: number
}

export interface ProfitableItem {
  description: string
  total_revenue: number
}

export interface TotalSalesMonth {
  month: string
  year: string
  total: number
}

export interface TotalSales {
  months: TotalSalesMonth[]
  total: number
  average_monthly_sales: number
  highest_month: TotalSalesMonth
}

export interface NonAffiliatedCustomer {
  customer_name: string
  total_volume: number
}

export interface AffiliatedCustomer {
  customer_name: string
  total_volume: number
}

export interface ItemCategorySales {
  category_id: number
  category_name: string
  credit_sales: number
}

export interface TopCustomerSales {
  customer_id: number
  customer_name: string
  credit_sales: number
}

// Geographic Data (PSGC)
export interface PsgcRegion {
  code: string
  name: string
  regionName: string
  islandGroupCode: string
  psgc10DigitCode: string
}

export interface PsgcProvince {
  code: string
  name: string
  regionCode: string
  islandGroupCode: string
  psgc10DigitCode: string
}

export interface PsgcCity {
  code: string
  name: string
  oldName: string
  isCapital: boolean
  isCity: boolean
  isMunicipality: boolean
  provinceCode: string
  districtCode: boolean
  regionCode: string
  islandGroupCode: string
  psgc10DigitCode: string
}

export interface PsgcMunicipality {
  code: string
  name: string
  oldName: string
  isCapital: boolean
  isCity: boolean
  isMunicipality: boolean
  provinceCode: string
  districtCode: boolean
  regionCode: string
  islandGroupCode: string
  psgc10DigitCode: string
}

export interface PsgcCityMunicipality extends PsgcCity {}

export interface PsgcSubMunicipality {
  code: string
  name: string
  regionCode: string
  provinceCode: string
  cityMunicipalityCode: string
  islandGroupCode: string
  psgc10DigitCode: string
}

export interface PsgcBarangay {
  code: string
  name: string
  oldName: string
  subMunicipalityCode: string
  cityMunicipalityCode: string
  provinceCode: string
  regionCode: string
  islandGroupCode: string
  psgc10DigitCode: string
}

export interface PsgcCombinedResponse {
  regions: PsgcRegion[]
  selectedRegion?: {
    info: PsgcRegion
    provinces: PsgcProvince[]
    cities: PsgcCity[]
    municipalities: PsgcMunicipality[]
    citiesMunicipalities: PsgcCityMunicipality[]
    subMunicipalities: any[]
    barangays: PsgcBarangay[]
  }
}

export interface CountryCurrency {
  name: string
  symbol: string
}

export interface CountryName {
  common: string
  official: string
  nativeName?: Record<string, { official: string; common: string }>
}

export interface Country {
  name: CountryName
  capital?: string[]
  currencies?: Record<string, CountryCurrency>
  flags: {
    png: string
    svg: string
    alt: string
  }
}

// Misc
export interface SalesInvoicePdfTableRow {
  qty: number | string
  unit: string
  description: string
  price: string
  amount: string
}

export interface SelectedUom {
  id: number
  name: string
  code: string
}

export interface StockItemWithLocationId {
  available_quantity: number
  location_id?: number
  location?: { id: number }
}

export interface BlobAttachment {
  id: number
  file_name: string
  file_path: string
  file_url: string
  mime_type: string
  file_size: number
  file_id?: string
}

interface DailyCollection {
  method: string
  tag: string
  total: number
}

export interface Notification {
  id: number
  user_id: number
  actions: string[] | null
  seen_by: number[] | null
  seen_at: string | null
  created_at: string
  updated_at: string
}

export interface GetManyNotificationsParams {
  user_id?: number
  search?: string
  date_from?: string
  date_to?: string
  per_page?: number
  page?: number
}

export interface UpdateNotificationPayload {
  actions?: string[]
  seen_by?: number[]
  seen_at?: string
  user_id?: number
}

export interface PaginatedNotifications
  extends PaginatedResponse<Notification> {}

export interface ApiResponse<T> {
  status: string
  message: string
  data: T
}

export interface StockPricePerUom {
  uom_id: number
  uom_name: string
  uom_code: string
  available_quantity: number
  type: "purchase_uom" | "base_uom"
  unit_price: number
  wholesale_price: number
  credit_price: number
}

export interface CustomerCredit {
  id: number
  rating: number | null
  limit: string | number
  balance: string | number
  term: number
  customer_id: number
  created_at: string
  updated_at: string
}

export interface CashReconciliation {
  cash_sales_to_be_remitted: number
  cash_remitted: number
  check_on_date: number
  online_bank_transfer: number
  with_holding_tax: number
}
