import {
  Building2,
  FileText,
  Package,
  PhilippinePeso,
  Settings,
  Truck,
} from "lucide-react"
import { Badge } from "@/components/ui/common/badge"
import { DataTableColumn } from "@/components/ui/data-table"
import { formatCurrency } from "@/lib/format"
import { ReturnToSupplier } from "@/types"
import { ReturnToSupplierAction } from "./return-to-supplier-action"

export const getReturnToSupplierColumn = (
  hasActionPermission: boolean,
  hasApprovePermission: boolean,
  hasPrintPermission: boolean,
  status: string,
): DataTableColumn<any>[] => {
  const columns: DataTableColumn<ReturnToSupplier>[] = [
    {
      key: "supplier",
      header: (
        <div className="ml-5 flex items-center gap-2">
          <Truck className="size-3" />
          <span>Supplier</span>
        </div>
      ),
      mobileLabel: "Supplier",
      cell: (returnItem) => (
        <div className="ml-5 flex gap-2 items-center">
          <Building2 className="size-3 text-gray-400" />
          <span>{returnItem.supplier?.name}</span>
        </div>
      ),
    },
    {
      key: "items",
      header: (
        <div className="flex items-center gap-2">
          <Package className="size-3" />
          <span>Items</span>
        </div>
      ),
      mobileLabel: "Items",
      cell: (returnItem) => (
        <div className="flex flex-col gap-1">
          {returnItem.items?.map((item: any, _index: any) => (
            <div key={item.id} className="flex items-center gap-2">
              <Badge variant="outline" className="gap-1.5 font-normal">
                <span className="text-xs font-semibold text-lime-700">
                  {item.pivot?.quantity || 0}x
                </span>
                <span className="text-xs">{item.description}</span>
              </Badge>
            </div>
          ))}
          {(!returnItem.items || returnItem.items.length === 0) && (
            <span className="text-sm text-muted-foreground">No items</span>
          )}
        </div>
      ),
    },
    {
      key: "type",
      header: (
        <div className="flex items-center gap-2">
          <FileText className="size-3" />
          <span>Type</span>
        </div>
      ),
      mobileLabel: "Type",
      cell: (returnItem) => (
        <div>
          <Badge
            variant={
              returnItem.type === "replacement" ? "secondary" : "outline"
            }
            className="capitalize"
          >
            {returnItem.type}
          </Badge>
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
          <FileText className="size-3" />
          <span>Reason</span>
        </div>
      ),
      mobileLabel: "Reason",
      className: "hidden xl:table-cell",
      showInMobileCard: true,
      cell: (returnItem) => (
        <div className="text-sm">
          {returnItem.remarks || (
            <span className="text-muted-foreground">—</span>
          )}
        </div>
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
        <ReturnToSupplierAction
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
