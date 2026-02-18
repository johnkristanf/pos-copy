import { router } from "@inertiajs/react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/common/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/common/select"
import { PAGE_ROUTES } from "@/config/page-routes"
import { ActivityLogFilters } from "@/types"

interface ActivityLogToolbarProps {
  onRefresh?: () => void
  filters?: ActivityLogFilters
  users?: { value: string; label: string }[]
}

export const ActivityLogToolbar = ({
  onRefresh,
  filters,
  users = [],
}: ActivityLogToolbarProps) => {
  const handleUserChange = (userId: string) => {
    router.get(
      PAGE_ROUTES.ACTIVITY_LOG_PAGE,
      {
        ...filters,
        causer_id: userId,
        causer_type: userId ? "App\\Models\\User" : undefined,
      },
      {
        preserveState: true,
        preserveScroll: true,
      },
    )
  }

  const clearUserFilter = () => {
    const newFilters = { ...filters }
    delete newFilters.causer_id
    delete newFilters.causer_type

    router.get(PAGE_ROUTES.ACTIVITY_LOG_PAGE, newFilters, {
      preserveState: true,
      preserveScroll: true,
    })
  }

  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <div className="w-[200px]">
          <Select
            value={filters?.causer_id?.toString() ?? ""}
            onValueChange={handleUserChange}
          >
            <SelectTrigger className="h-8 w-full">
              <SelectValue placeholder="Filter by user" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all_users" disabled className="hidden">
                All Users
              </SelectItem>
              {users.map((user) => (
                <SelectItem key={user.value} value={user.value}>
                  {user.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {filters?.causer_id && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearUserFilter}
            className="h-8 px-2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>
      {onRefresh && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          className="gap-2"
        >
          Refresh
        </Button>
      )}
    </div>
  )
}
