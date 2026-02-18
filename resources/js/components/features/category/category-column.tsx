import { Calendar, Hash, Settings, Tag } from "lucide-react"
import { Badge } from "@/components/ui/common/badge"
import { getCategoryIcon } from "@/components/ui/common/get-category-icon"
import { DataTableColumn } from "@/components/ui/data-table"
import { formatDateTime } from "@/lib/format"
import { Category, User } from "@/types"
import { CategoryAction } from "./category-action"

export const getCategoryColumn = (
  onActionStart?: (id: number | null) => void,
  user?: User,
  hasActionPermission: boolean = true,
): DataTableColumn<Category>[] => {
  const columns: DataTableColumn<Category>[] = [
    {
      key: "code",
      header: (
        <div className="ml-5 flex items-center gap-2">
          <Hash className="size-3" />
          <span>Code</span>
        </div>
      ),
      mobileLabel: "Code",
      cell: (category) => (
        <div className="ml-5">
          <div className="font-medium flex items-center gap-3">
            <div className="h-8 w-8 rounded-sm bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 font-mono text-xs">
              {category.code}
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
      cell: (category) => (
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="outline" className="gap-1.5 font-normal">
            {getCategoryIcon(category.name)}
            <span className="capitalize">{category.name}</span>
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
      cell: (category) => (
        <div>
          {category.updated_at
            ? formatDateTime(category.updated_at, true)
            : "N/A"}
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
      cell: (category) => (
        <div className="flex justify-center mr-5">
          <CategoryAction
            category={category}
            onActionStart={onActionStart}
            user={user}
          />
        </div>
      ),
    })
  }

  return columns
}
