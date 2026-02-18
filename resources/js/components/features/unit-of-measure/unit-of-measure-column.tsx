import { Calendar, Hash, Settings, Tag } from "lucide-react"
import { Badge } from "@/components/ui/common/badge"
import { DataTableColumn } from "@/components/ui/data-table"
import { formatDateTime } from "@/lib/format"
import { UnitOfMeasure, User } from "@/types"
import { getUnitIcon } from "./get-unit-icon"
import { UnitOfMeasureAction } from "./unit-of-measure-actions"

export const getUnitOfMeasureColumn = (
  onActionStart?: (id: number | null) => void,
  user?: User,
  hasActionPermission: boolean = true,
): DataTableColumn<UnitOfMeasure>[] => {
  const columns: DataTableColumn<UnitOfMeasure>[] = [
    {
      key: "code",
      header: (
        <div className="ml-5 flex items-center gap-2">
          <Hash className="size-3" />
          <span>Code</span>
        </div>
      ),
      mobileLabel: "Code",
      cell: (uom) => (
        <div className="ml-5">
          <div className="font-medium flex items-center gap-3">
            <div className="h-8 w-14 rounded-sm bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 font-mono text-xs">
              {uom.code}
            </div>
          </div>
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
      cell: (uom) => (
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="outline" className="gap-1.5 font-normal">
            {getUnitIcon(uom.name)}
            <span className="capitalize">{uom.name}</span>
          </Badge>
        </div>
      ),
    },
    {
      key: "latest-updated",
      header: (
        <div className="flex items-center gap-2">
          <Calendar className="size-3" />
          <span>Last Updated</span>
        </div>
      ),
      mobileLabel: "Last Updated",
      cell: (uom) => (
        <div>
          {uom.updated_at ? formatDateTime(uom.updated_at, true) : "N/A"}
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
      cell: (uom) => (
        <div className="flex justify-center mr-5">
          <UnitOfMeasureAction
            unitOfMeasure={uom}
            onActionStart={onActionStart}
            user={user}
          />
        </div>
      ),
    })
  }

  return columns
}
