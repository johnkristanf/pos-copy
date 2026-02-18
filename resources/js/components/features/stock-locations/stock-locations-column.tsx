import { Calendar, Hash, Settings, Tag } from "lucide-react"
import { DataTableColumn } from "@/components/ui/data-table"
import { formatDateTime } from "@/lib/format"
import { StockLocation, User } from "@/types"
import { StockLocationAction } from "./stock-locations-action"

export const getStockLocationsColumn = (
  onActionStart?: (id: number | null) => void,
  user?: User,
  hasActionPermission: boolean = true,
): DataTableColumn<StockLocation>[] => {
  const columns: DataTableColumn<StockLocation>[] = [
    {
      key: "id",
      header: (
        <div className="ml-5 flex items-center gap-2">
          <Hash className="size-3" />
          <span>ID</span>
        </div>
      ),
      mobileLabel: "ID",
      cell: (stockLocation) => (
        <div className="flex flex-wrap gap-1.5 ml-5">
          <span>{stockLocation.id}</span>
        </div>
      ),
    },
    {
      key: "name",
      header: (
        <div className="flex items-center gap-2">
          <Tag className="size-3" />
          <span>Name</span>
        </div>
      ),
      mobileLabel: "Name",
      cell: (stockLocation) => (
        <div className="flex flex-wrap gap-1.5">
          <span className="capitalize">{stockLocation.name}</span>
        </div>
      ),
    },
    {
      key: "created",
      header: (
        <div className="flex items-center gap-2">
          <Calendar className="size-3" />
          <span>Created</span>
        </div>
      ),
      mobileLabel: "Created",
      className: "hidden xl:table-cell",
      cell: (stockLocation) => (
        <div className="text-sm text-muted-foreground">
          {stockLocation.created_at
            ? formatDateTime(stockLocation.created_at, true)
            : "—"}
        </div>
      ),
    },
  ]

  if (hasActionPermission) {
    columns.push({
      key: "action",
      header: (
        <div className="flex items-center justify-center mr-5 gap-2">
          <Settings className="size-3" />
          <span>Actions</span>
        </div>
      ),
      className: "w-[100px] text-center",
      showInMobileCard: false,
      cell: (stockLocation) => (
        <div className="flex justify-center mr-5">
          <StockLocationAction
            stockLocation={stockLocation}
            onActionStart={onActionStart}
            user={user}
          />
        </div>
      ),
    })
  }

  return columns
}
