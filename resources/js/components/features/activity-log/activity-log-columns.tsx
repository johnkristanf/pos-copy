import {
  Activity,
  Calendar,
  Database,
  Globe,
  Monitor,
  Smartphone,
  Tablet,
  User,
} from "lucide-react"
import { Badge } from "@/components/ui/common/badge"
import { DataTableColumn } from "@/components/ui/data-table"
import { formatDateTime } from "@/lib/format"
import { ActivityLog } from "@/types"

const getEventBadgeVariant = (event: string) => {
  const variants: Record<string, any> = {
    created: "success",
    updated: "secondary",
    deleted: "destructive",
    login: "warning",
    logout: "info",
  }
  return variants[event] || "outline"
}

const getDeviceIcon = (deviceType: string | null) => {
  if (!deviceType) {
    return <Database className="size-3" />
  }

  switch (deviceType.toLowerCase()) {
    case "mobile":
      return <Smartphone className="size-3" />
    case "tablet":
      return <Tablet className="size-3" />
    case "desktop":
      return <Monitor className="size-3" />
    default:
      return <Globe className="size-3" />
  }
}

const getLogNameBadgeVariant = (logName: string) => {
  const variants: Record<string, any> = {
    authentication: "outline",
    user: "outline",
    project: "outline",
    item: "outline",
    transaction: "outline",
  }
  return variants[logName] || "outline"
}

const formatModelType = (type: string) => {
  return type.split("\\").pop() || type
}

export const getActivityLogColumns = (): DataTableColumn<ActivityLog>[] => [
  {
    key: "description",
    header: (
      <div className="ml-5 flex items-center gap-2">
        <Activity className="size-3" />
        <span>Activity</span>
      </div>
    ),
    mobileLabel: "Activity",
    sortable: false,
    cell: (log) => (
      <div className="ml-5">
        <div className="space-y-1.5">
          <div className="font-medium text-sm">{log.description}</div>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge
              variant={getLogNameBadgeVariant(log.log_name)}
              className="text-xs font-normal"
            >
              {log.log_name}
            </Badge>
            <Badge
              variant={getEventBadgeVariant(log.event)}
              className="text-xs font-normal capitalize"
            >
              {log.event}
            </Badge>
          </div>
        </div>
      </div>
    ),
  },
  {
    key: "causer",
    header: (
      <div className="flex items-center gap-2">
        <User className="size-3" />
        <span>User</span>
      </div>
    ),
    mobileLabel: "User",
    cell: (log) => (
      <div>
        {log.causer ? (
          <div className="space-y-0.5">
            <div className="text-sm font-medium">{log.causer.name}</div>
            <div className="text-xs text-muted-foreground">
              {formatModelType(log.causer.type)}
            </div>
          </div>
        ) : (
          <div className="space-y-0.5">
            <span className="text-sm font-medium">System</span>
            <div className="text-xs text-muted-foreground">Automated</div>
          </div>
        )}
      </div>
    ),
  },
  {
    key: "device",
    header: (
      <div className="flex items-center gap-2">
        <Monitor className="size-3" />
        <span>Device</span>
      </div>
    ),
    mobileLabel: "Device",
    className: "hidden xl:table-cell",
    showInMobileCard: true,
    cell: (log) => (
      <div className="space-y-1">
        <Badge variant="outline" className="gap-1.5 text-xs font-normal">
          {getDeviceIcon(log.device_type)}
          {log.device_type || "System"}
        </Badge>
        {log.browser && (
          <div className="text-xs text-muted-foreground">{log.browser}</div>
        )}
        {log.platform && (
          <div className="text-xs text-muted-foreground">{log.platform}</div>
        )}
      </div>
    ),
  },
  {
    key: "ip_address",
    header: (
      <div className="flex items-center gap-2">
        <Globe className="size-3" />
        <span>IP Address</span>
      </div>
    ),
    mobileLabel: "IP Address",
    className: "hidden xl:table-cell",
    showInMobileCard: false,
    cell: (log) => (
      <div className="text-sm font-mono text-muted-foreground">
        {log.ip_address || "—"}
      </div>
    ),
  },
  {
    key: "created_at",
    header: (
      <div className="flex items-center gap-2">
        <Calendar className="size-3" />
        <span>Date</span>
      </div>
    ),
    mobileLabel: "Date",
    className: "hidden lg:table-cell",
    showInMobileCard: false,
    sortable: true,
    cell: (log) => (
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <span>{formatDateTime(log.created_at) || "—"}</span>
      </div>
    ),
  },
]
