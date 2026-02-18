import {
  // Activity,
  Hash,
  PhilippinePeso,
  Settings,
  ShoppingCart,
  User as UserIcon,
  UsersRound,
} from "lucide-react"
import { Badge } from "@/components/ui/common/badge"
import { DataTableColumn } from "@/components/ui/data-table"
import ImageComponent from "@/components/ui/media/image"
import { APP_ASSETS } from "@/config/assets"
import { formatCurrency } from "@/lib/format"
import { Customer, User } from "@/types"
import { CustomerDetailsCell } from "./customer-details-cell"
import { CustomersActions } from "./customers-actions"

export const getCustomersColumns = (
  onActionStart?: (id: number | null) => void,
  user?: User,
): DataTableColumn<Customer>[] => [
  {
    key: "customer_code",
    header: (
      <div className="flex items-center gap-2 ml-2">
        <Hash className="size-3" />
        <span>Customer No</span>
      </div>
    ),
    mobileLabel: "No.",
    sortable: false,
    className: "w-[140px]",
    cell: (customer) => (
      <div className="font-mono font-medium text-xs ml-2">
        {customer.customer_code}
      </div>
    ),
  },
  {
    key: "details",
    header: (
      <div className="flex items-center gap-2">
        <UserIcon className="size-3" />
        <span>Details</span>
      </div>
    ),
    mobileLabel: "Details",
    className: "min-w-[100px]",
    cell: (customer) => <CustomerDetailsCell customer={customer} />,
  },
  {
    key: "affiliated",
    header: (
      <div className="flex items-center justify-center gap-2">
        <UsersRound className="size-3" />
        <span>Affiliated</span>
      </div>
    ),
    mobileLabel: "Affiliated",
    className: "text-center w-[180px]",
    cell: (customer) => (
      <div className="flex flex-start items-start">
        {customer.affiliated ? (
          <Badge
            variant="bridge_digital"
            className="gap-1.5 pl-1.5 pr-2.5 py-0.5"
          >
            <div className="bg-white rounded-full p-0.75 h-5 w-5 flex items-center justify-center shadow-inner">
              <ImageComponent
                src={APP_ASSETS.HEXAT_LOGO}
                alt="Hexat"
                className="h-full w-full object-contain"
              />
            </div>
            <span className="font-medium text-[10px] uppercase tracking-wider">
              Affiliated
            </span>
          </Badge>
        ) : (
          <Badge
            variant="outline"
            className="border-dashed text-muted-foreground bg-muted/30 gap-1.5 pl-1.5 pr-2.5 py-0.5"
          >
            <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50" />
            <span className="text-[10px] uppercase tracking-wider font-medium">
              Regular
            </span>
          </Badge>
        )}
      </div>
    ),
  },
  {
    key: "orders_count",
    header: (
      <div className="flex items-center justify-center gap-2">
        <ShoppingCart className="size-3" />
        <span>Orders</span>
      </div>
    ),
    mobileLabel: "Orders",
    className: "text-center w-[100px]",
    cell: (customer) => (
      <div className="font-medium text-center">
        {customer.orders_count || 0}
      </div>
    ),
  },
  // {
  //   key: "credit_rating",
  //   header: (
  //     <div className="flex items-center justify-center gap-2">
  //       <Activity className="size-3" />
  //       <span>Rating</span>
  //     </div>
  //   ),
  //   mobileLabel: "Rating",
  //   className: "text-center w-[100px]",
  //   cell: (customer) => (
  //     <div className="flex justify-center">
  //       <Badge
  //         variant="outline"
  //         className="font-mono flex items-center justify-center min-w-12"
  //       >
  //         {customer.credit?.rating || "N/A"}
  //       </Badge>
  //     </div>
  //   ),
  // },
  {
    key: "total_order_value",
    header: (
      <div className="flex items-center justify-end gap-2 ml-5">
        <PhilippinePeso className="size-3" />
        <span>Total Value</span>
      </div>
    ),
    mobileLabel: "Total Value",
    className: "text-right w-[140px]",
    cell: (customer) => (
      <div className="font-medium">
        {formatCurrency(customer.total_order_value || 0)}
      </div>
    ),
  },
  {
    key: "actions",
    header: (
      <div className="flex items-center justify-center gap-2">
        <Settings className="size-3" />
        <span>Actions</span>
      </div>
    ),
    className: "w-[80px]",
    cell: (customer) => (
      <div className="flex justify-center">
        <CustomersActions
          customer={customer}
          onActionStart={onActionStart}
          user={user}
        />
      </div>
    ),
  },
]
