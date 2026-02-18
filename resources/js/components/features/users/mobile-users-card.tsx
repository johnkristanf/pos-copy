import { Badge } from "@/components/ui/common/badge"
import { Card, CardContent } from "@/components/ui/common/card"
import { formatDate } from "@/lib/format"
import { User } from "@/types"
import { UsersActions } from "./users-actions"

interface MobileUsersCardProps {
  user: User
}

export function MobileUsersCard({ user }: MobileUsersCardProps) {
  const fullName = [user.first_name, user.middle_name, user.last_name]
    .filter(Boolean)
    .join(" ")

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-medium text-sm">{fullName}</h3>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
            <UsersActions user={user} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Location(s)</p>
              <div className="flex flex-wrap gap-1">
                {user.assigned_stock_locations &&
                user.assigned_stock_locations.length > 0 ? (
                  user.assigned_stock_locations.map((loc) => (
                    <span key={loc.id} className="text-sm capitalize">
                      {loc.name}
                    </span>
                  ))
                ) : (
                  <span className="text-muted-foreground text-sm">N/A</span>
                )}
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Created</p>
              <p className="text-sm">{formatDate(user.created_at) || "N/A"}</p>
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Features</p>
            <div className="flex flex-wrap gap-1">
              {user.user_features && user.user_features.length > 0 ? (
                <>
                  {user.user_features.slice(0, 3).map((feature) => (
                    <Badge
                      key={feature.id}
                      variant="outline"
                      className="text-xs"
                    >
                      {feature.name}
                    </Badge>
                  ))}
                  {user.user_features.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{user.user_features.length - 3} more
                    </Badge>
                  )}
                </>
              ) : (
                <span className="text-muted-foreground text-sm">
                  No features
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
