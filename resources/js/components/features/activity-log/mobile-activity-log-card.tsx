import {
  Calendar,
  Database,
  Globe,
  Monitor,
  Smartphone,
  Tablet,
} from "lucide-react"
import { Badge } from "@/components/ui/common/badge"
import { Card, CardContent } from "@/components/ui/common/card"
import { formatDate } from "@/lib/format"
import { ActivityLog } from "@/types"

interface MobileActivityLogCardProps {
  log: ActivityLog
}

const getEventBadgeVariant = (event: string) => {
  const variants: Record<string, any> = {
    created: "default",
    updated: "secondary",
    deleted: "destructive",
    login: "bridge_digital",
    logout: "outline",
  }
  return variants[event] || "outline"
}

const getDeviceIcon = (deviceType: string | null) => {
  if (!deviceType) {
    return <Database className="h-3 w-3" />
  }

  switch (deviceType.toLowerCase()) {
    case "mobile":
      return <Smartphone className="h-3 w-3" />
    case "tablet":
      return <Tablet className="h-3 w-3" />
    case "desktop":
      return <Monitor className="h-3 w-3" />
    default:
      return <Globe className="h-3 w-3" />
  }
}

const getLogNameBadgeVariant = (logName: string) => {
  const variants: Record<string, any> = {
    authentication: "bridge_digital",
    user: "default",
    project: "secondary",
    item: "outline",
    transaction: "default",
  }
  return variants[logName] || "outline"
}

const formatModelType = (type: string) => {
  return type.split("\\").pop() || type
}

export const MobileActivityLogCard = ({ log }: MobileActivityLogCardProps) => {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="space-y-2">
            <div className="font-medium text-sm">{log.description}</div>
            <div className="flex flex-wrap gap-1.5">
              <Badge
                variant={getLogNameBadgeVariant(log.log_name)}
                className="text-xs"
              >
                {log.log_name}
              </Badge>
              <Badge
                variant={getEventBadgeVariant(log.event)}
                className="text-xs capitalize"
              >
                {log.event}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">User</p>
              {log.causer ? (
                <div>
                  <p className="text-sm font-medium">{log.causer.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatModelType(log.causer.type)}
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-medium">System</p>
                  <p className="text-xs text-muted-foreground">Automated</p>
                </div>
              )}
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Date</p>
              <div className="flex items-center gap-1.5 text-sm">
                <Calendar className="h-3 w-3" />
                <span>{formatDate(log.created_at) || "N/A"}</span>
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Device Info</p>
            <div className="space-y-1.5">
              <Badge variant="outline" className="gap-1.5 text-xs">
                {getDeviceIcon(log.device_type)}
                {log.device_type || "System"}
              </Badge>
              {log.browser && (
                <p className="text-xs text-muted-foreground">{log.browser}</p>
              )}
              {log.platform && (
                <p className="text-xs text-muted-foreground">{log.platform}</p>
              )}
            </div>
          </div>

          {log.ip_address && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">IP Address</p>
              <div className="flex items-center gap-1.5 text-sm font-mono">
                <Globe className="h-3 w-3" />
                <span>{log.ip_address}</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
