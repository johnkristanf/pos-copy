export type PermissionType =
  | "create"
  | "read"
  | "update"
  | "delete"
  | "approve"
  | "print"
  | "check"

export interface FeaturePermissions {
  [feature: string]: PermissionType[]
}

export interface RoleTemplate {
  role: string
  permissions: FeaturePermissions
}

export const ROLES_FEATURES_PERMISSIONS = {
  SALES_OFFICER: {
    role: "Sales Officer",
    permissions: {
      all_orders: ["read"],
      create_order: ["create", "read", "update", "delete", "print"],
      convert_item: ["read"],
      quotation: ["read", "update", "print"],
      customer_profile: ["create", "read", "update"],
      return_from_customer: ["read"],
      reports_and_analytics: ["read", "print"],
      price_and_discount: ["read"],
    },
  },
  CASHIER: {
    role: "Cashier",
    permissions: {
      all_orders: ["read"],
      receive_payment: ["create", "read", "update", "print"],
      order_receipt: ["read"],
      customer_profile: ["read"],
      credit_rating: ["read"],
      price_analysis_report: ["read", "print"],
      price_and_discount: ["read"],
      item_wholesale_discount: ["read"],
      reports_and_analytics: ["read", "print"],
    },
  },
  INVENTORY_MANAGER: {
    role: "Inventory Manager",
    permissions: {
      all_orders: ["read", "print"],
      customer_orders_pickup: ["read"],
      return_from_customer: ["create", "read", "update", "approve", "print"],
      return_to_supplier: ["create", "read", "update", "print"],
      customer_profile: ["create", "read", "update"],
      credit_rating: ["create", "read", "update"],
      inventory: ["create", "read", "print"],
      stock_in: ["create", "read", "update", "print"],
      stock_transfer: ["create", "read", "delete"],
      stock_alert: ["read"],
      inventory_reports: ["read", "approve", "print"],
      customer_order_withdrawal: ["read"],
      item_management: ["create", "read", "update"],
      convert_item: ["create", "read", "update"],
      price_and_discount: ["read"],
      price_analysis_report: ["read", "print"],
      reports_and_analytics: ["read", "print"],
    },
  },
  MERCHANDISER: {
    role: "Merchandiser",
    permissions: {
      customer_profile: ["create", "read", "update"],
      return_from_customer: ["read", "approve", "print"],
      return_to_supplier: ["create", "read", "approve"],
      inventory: ["read"],
      price_and_discount: ["create", "read", "update"],
      price_analysis_report: ["read", "print"],
      credit_rating: ["read"],
      item_wholesale_discount: ["create", "read", "update"],
      override_order_wholesale_discount: ["read", "update"],
      reports_and_analytics: ["read", "print"],
      inventory_reports: ["read", "approve", "print"],
      item_management: ["read"],
      tenant_management: ["read"],
    },
  },
  SUPERVISOR: {
    role: "Supervisor",
    permissions: {
      return_from_customer: ["read", "approve", "print"],
      return_to_supplier: ["read", "approve", "print"],
      reports_and_analytics: ["read", "print"],
      item_management: ["read", "approve"],
      inventory: ["read", "print"],
      price_and_discount: ["read"],
    },
  },
  EVP: {
    role: "Executive Vice President",
    permissions: {
      all_orders: ["read", "print"],
      receive_payment: ["read", "print"],
      order_receipt: ["read", "print"],
      return_from_customer: ["read", "print"],
      return_to_supplier: ["read", "print"],
      customer_profile: ["read"],
      inventory: ["read", "print"],
      stock_in: ["read", "print"],
      inventory_reports: ["read", "print"],
      credit_rating: ["read", "approve"],
      price_and_discount: ["read"],
      price_analysis_report: ["read", "print"],
      item_wholesale_discount: ["read"],
      override_order_wholesale_discount: ["read"],
      reports_and_analytics: ["read", "print"],
      customer_orders_pickup: ["read"],
      customer_order_withdrawal: ["read"],
      item_management: ["read", "approve"],
      user_access_management: ["read"],
      project_management: ["read"],
      tenant_management: ["read"],
    },
  },
  PURCHASING_AND_SALES_HEAD: {
    role: "Purchasing & Sales Head",
    permissions: {
      all_orders: ["read", "print"],
      receive_payment: ["read", "print"],
      order_receipt: ["read", "print"],
      return_from_customer: ["read", "delete", "approve", "print"],
      return_to_supplier: ["read", "print"],
      customer_profile: ["create", "read", "update"],
      credit_rating: ["read", "approve"],
      tenant_management: ["read", "update", "delete"],
      price_and_discount: ["read"],
      price_analysis_report: ["read", "print"],
      item_wholesale_discount: ["create", "read", "update"],
      override_order_wholesale_discount: ["read", "update"],
      inventory: ["read"],
      stock_in: ["read", "print"],
      reports_and_analytics: ["read", "print"],
      inventory_reports: ["read", "print"],
      item_management: ["read"],
    },
  },
  INVENTORY_OFFICER: {
    role: "Inventory Officer",
    permissions: {
      all_orders: ["read", "print"],
      customer_orders_pickup: ["read"],
      inventory: ["create", "read", "print"],
      stock_in: ["create", "read", "print"],
      stock_transfer: ["create", "read", "delete"],
      stock_alert: ["read"],
      customer_order_withdrawal: ["read"],
      return_to_supplier: ["read", "print"],
      return_from_customer: ["read", "print"],
      item_management: ["create", "read", "update"],
      convert_item: ["read"],
      reports_and_analytics: ["read", "print"],
    },
  },
  ADMINISTRATOR: {
    role: "Administrator",
    permissions: {
      user_management: ["create", "read", "update", "delete"],
      project_management: ["create", "read", "update", "delete"],
      tenant_management: ["read", "update", "delete"],
      api_key_management: ["create", "read", "update", "delete"],
      user_access_management: ["read"],
      reports_and_analytics: ["read", "print"],
    },
  },
  SUPER_ADMIN: {
    role: "Super Admin",
    permissions: {
      create_order: ["create", "read", "update", "delete", "print"],
      receive_payment: ["create", "read", "update", "print"],
      all_orders: ["create", "read", "update", "approve", "print"],
      customer_orders_pickup: ["create", "read", "update", "approve", "print"],
      return_from_customer: ["create", "read", "update", "approve", "print"],
      return_to_supplier: ["create", "read", "update", "approve", "print"],
      customer_profile: ["create", "read", "update", "approve", "print"],
      credit_rating: ["create", "read", "update", "approve", "print"],
      inventory: ["create", "read", "update", "approve", "print"],
      stock_in: ["create", "read", "update", "approve", "print"],
      stock_transfer: ["create", "read", "update", "approve", "print"],
      stock_alert: ["create", "read", "update", "approve", "print"],
      inventory_reports: ["create", "read", "update", "approve", "print"],
      customer_order_withdrawal: [
        "create",
        "read",
        "update",
        "approve",
        "print",
      ],
      item_management: ["create", "read", "update", "approve", "print"],
      convert_item: ["create", "read", "update", "approve", "print"],
      price_and_discount: ["create", "read", "update", "approve", "print"],
      price_analysis_report: ["create", "read", "update", "approve", "print"],
      reports_and_analytics: ["create", "read", "update", "approve", "print"],
      user_management: ["create", "read", "update", "approve", "print"],
      project_management: ["create", "read", "update", "approve", "print"],
      tenant_management: ["create", "read", "update", "approve", "print"],
      api_key_management: ["create", "read", "update", "approve", "print"],
      user_access_management: ["create", "read", "update", "approve", "print"],
      item_wholesale_discount: ["create", "read", "update", "approve", "print"],
      override_order_wholesale_discount: [
        "create",
        "read",
        "update",
        "approve",
        "print",
      ],
    },
  },
} as const

export type RoleKey = keyof typeof ROLES_FEATURES_PERMISSIONS
