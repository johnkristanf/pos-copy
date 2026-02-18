import {
  Mail,
  Shield,
  Store as StoreIcon,
  Warehouse as WarehouseIcon,
} from "lucide-react"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/common/avatar"
import { Badge } from "@/components/ui/common/badge"
import { Card, CardContent } from "@/components/ui/common/card"
import { formatDate } from "@/lib/format"
import { Permission, Role, SpecificUserFeature, User } from "@/types"
import { UserRoleFeatureSelector } from "./user-role-feature-selector"

interface ViewUserDialogProps {
  user: User
  roles: Role[]
  features: SpecificUserFeature[]
  permissions: Permission[]
}

export function ViewUserInfo({
  user,
  roles,
  features,
  permissions,
}: ViewUserDialogProps) {
  const userRoleIds = user.roles?.map((role) => role.id) || []

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
              <Avatar className="size-10 ring-1 ring-primary/5">
                <AvatarImage
                  src={user.user_image ?? user.name}
                  alt={user.name}
                />
                <AvatarFallback className="text-black">
                  {user.first_name?.[0]?.toUpperCase() || ""}
                  {user.last_name?.[0]?.toUpperCase() || ""}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 w-full sm:w-auto">
                <h3 className="text-base sm:text-lg font-semibold wrap-break-word">
                  {user.first_name}{" "}
                  {user.middle_name ? `${user.middle_name} ` : ""}
                  {user.last_name}
                </h3>
                <div className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground mt-1 break-all">
                  <Mail className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
                  <span className="truncate">{user.email}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-3 sm:pt-4 border-t">
              <div className="flex items-start gap-2">
                <div className="min-w-0">
                  <div className="text-xs text-muted-foreground">
                    Location(s)
                  </div>
                  <div className="font-medium mt-1 flex flex-wrap gap-1">
                    {user.assigned_stock_locations &&
                    user.assigned_stock_locations.length > 0 ? (
                      user.assigned_stock_locations.map((loc) => (
                        <Badge
                          key={loc.id}
                          variant="outline"
                          className="gap-1.5 font-normal text-xs"
                        >
                          {loc.name === "store" ? (
                            <StoreIcon className="h-3 w-3 shrink-0" />
                          ) : loc.name === "warehouse" ? (
                            <WarehouseIcon className="h-3 w-3 shrink-0" />
                          ) : null}
                          <span className="capitalize">{loc.name}</span>
                        </Badge>
                      ))
                    ) : (
                      <span className="text-muted-foreground text-xs sm:text-sm">
                        —
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="min-w-0">
                  <div className="text-xs text-muted-foreground">Created</div>
                  <div className="font-medium text-xs mt-1">
                    {formatDate(user.created_at) || "—"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-2 sm:space-y-3">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0" />
          <h4 className="font-semibold text-sm sm:text-base">
            Roles & Permissions
          </h4>
        </div>

        <UserRoleFeatureSelector
          value={userRoleIds}
          roles={roles}
          features={features}
          permissions={permissions}
          viewMode={true}
        />
      </div>
    </div>
  )
}
