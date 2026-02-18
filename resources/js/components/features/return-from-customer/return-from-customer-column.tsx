import {
  Calendar,
  FileText,
  HelpCircle,
  Package,
  PhilippinePeso,
  Settings,
  User as UserIcon,
} from "lucide-react"
import { Badge } from "@/components/ui/common/badge"
import { DataTableColumn } from "@/components/ui/data-table"
import { formatCurrency, formatDate } from "@/lib/format"
import { ReturnFromCustomer } from "@/types"
import { CustomerDetailsCell } from "../customers/customer-details-cell"
import { ReturnFromCustomerAction } from "./return-from-customer-action"

export const getReturnFromCustomerColumns = (
  hasActionPermission: boolean = true,
  hasApprovePermission: boolean = false,
  hasPrintPermission: boolean = false,
  status: string = "pending",
): DataTableColumn<ReturnFromCustomer>[] => {
  const columns: DataTableColumn<ReturnFromCustomer>[] = [
    {
      key: "invoice_issued_date",
      header: (
        <div className="ml-5 flex items-center gap-2">
          <Calendar className="size-3" />
          <span>Date</span>
        </div>
      ),
      mobileLabel: "Date",
      sortable: true,
      cell: (returnItem) => (
        <div className="ml-5 text-sm text-muted-foreground">
          {formatDate(returnItem.invoice_issued_date)}
        </div>
      ),
    },
    {
      key: "customer",
      header: (
        <div className="flex ml-10 items-center text-center justify-center gap-2">
          <UserIcon className="size-3" />
          <span>Customer</span>
        </div>
      ),
      mobileLabel: "Customer",
      cell: (returnItem) => (
        <CustomerDetailsCell
          customer={returnItem.customer}
          returnColumn={true}
        />
      ),
    },
    {
      key: "invoice_number",
      header: (
        <div className="flex items-center gap-2">
          <FileText className="size-3" />
          <span>Invoice No.</span>
        </div>
      ),
      mobileLabel: "Invoice No.",
      cell: (returnItem) => (
        <div className="font-mono text-xs font-medium">
          {returnItem.invoice_number}
        </div>
      ),
    },
    {
      key: "items",
      header: (
        <div className="flex items-center justify-center gap-2">
          <Package className="size-3" />
          <span>Items</span>
        </div>
      ),
      mobileLabel: "Items",
      className: "text-center",
      cell: (returnItem) => (
        <div className="flex flex-col items-center font-medium">
          {returnItem.items?.length || 0}
        </div>
      ),
    },
    {
      key: "total_amount",
      header: (
        <div className="flex items-center justify-center gap-2 text-center">
          <PhilippinePeso className="size-3" />
          <span>Total Amount</span>
        </div>
      ),
      mobileLabel: "Total Amount",
      className: "text-center",
      showInMobileCard: true,
      cell: (returnItem) => {
        const totalAmount =
          returnItem.items?.reduce((sum, item) => {
            const unitPrice = parseFloat(item.selling_prices?.unit_price || "0")
            return sum + (item.pivot?.quantity || 0) * unitPrice
          }, 0) || 0

        return (
          <div className="flex flex-col items-center text-center font-medium">
            {formatCurrency(totalAmount)}
          </div>
        )
      },
    },
    {
      key: "reason",
      header: (
        <div className="flex items-center gap-2">
          <HelpCircle className="size-3" />
          <span>Reason</span>
        </div>
      ),
      mobileLabel: "Reason",
      showInMobileCard: true,
      cell: (returnItem) => (
        <Badge
          variant="outline"
          className="border-dashed text-muted-foreground bg-muted/30 gap-1.5 pl-2.5 pr-2.5 py-0.5"
        >
          <span className="text-[10px] uppercase tracking-wider font-medium">
            {returnItem.reason || "N/A"}
          </span>
        </Badge>
      ),
    },
  ]

  if (hasActionPermission) {
    columns.push({
      key: "action",
      header: (
        <div className="flex items-center justify-center gap-2">
          <Settings className="size-3" />
          <span>Actions</span>
        </div>
      ),
      className: "w-[100px] text-center",
      showInMobileCard: false,
      cell: (returnItem) => (
        <ReturnFromCustomerAction
          returnItem={returnItem}
          hasApprovePermission={hasApprovePermission}
          hasPrintPermission={hasPrintPermission}
          status={status}
        />
      ),
    })
  }
  return columns
}
