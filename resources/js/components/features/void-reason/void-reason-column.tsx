import {
  Calendar,
  Lock,
  MessageSquareWarning,
  Settings,
  TicketX,
} from "lucide-react"
import { Badge } from "@/components/ui/common/badge"
import { DataTableColumn } from "@/components/ui/data-table"
import { formatDateTime } from "@/lib/format"
import { Role, User, VoidReason } from "@/types"
import { VoidReasonAction } from "./void-reason-action"

export const getVoidReasonsColumn = (
  onActionStart?: (id: number | null) => void,
  user?: User,
  hasActionPermission: boolean = true,
  roles?: Role[],
): DataTableColumn<VoidReason>[] => {
  const columns: DataTableColumn<VoidReason>[] = [
    {
      key: "void_reason",
      header: (
        <div className="ml-5 flex items-center gap-2">
          <MessageSquareWarning className="size-3" />
          <span>Void Reason</span>
        </div>
      ),
      mobileLabel: "Void Reason",
      cell: (voidReason) => (
        <div className="ml-5 flex flex-wrap gap-1.5">
          <Badge variant="outline" className="gap-1.5 font-normal">
            <TicketX className="size-3" />
            <span>{voidReason.void_reason}</span>
          </Badge>
        </div>
      ),
    },
    {
      key: "require_password",
      header: (
        <div className="flex items-center gap-2">
          <Lock className="size-3" />
          <span>Require Password</span>
        </div>
      ),
      mobileLabel: "Password",
      className: "hidden lg:table-cell",
      cell: (voidReason) => (
        <div className="flex items-center gap-2">
          {voidReason.require_password ? (
            <div className="flex items-center gap-1.5 text-sm text-sky-500">
              <Lock className="size-3" />
              <span>Required</span>
            </div>
          ) : (
            <div className="gap-1.5 text-muted-foreground">
              <span className="text-sm">Not Required</span>
            </div>
          )}
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
      cell: (voidReason) => (
        <div className="text-sm text-muted-foreground">
          {voidReason.created_at
            ? formatDateTime(voidReason.created_at, true)
            : "—"}
        </div>
      ),
    },
  ]

  if (hasActionPermission) {
    columns.push({
      key: "action",
      header: (
        <div className="mr-5 flex items-center justify-center gap-2">
          <Settings className="size-3" />
          <span>Actions</span>
        </div>
      ),
      className: "w-[100px] text-center",
      showInMobileCard: false,
      cell: (voidReason) => (
        <div className="flex justify-center mr-5">
          <VoidReasonAction
            roles={roles}
            voidReason={voidReason}
            onActionStart={onActionStart}
            user={user}
          />
        </div>
      ),
    })
  }

  return columns
}
