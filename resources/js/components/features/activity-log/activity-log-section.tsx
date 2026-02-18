import { useMemo } from "react"
import { DataTable } from "@/components/ui/data-table"
import { PaginationInfo } from "@/components/ui/data-table/data-table-pagination"
import { ActivityLogFilters, PaginatedActivityLogs } from "@/types"
import { getActivityLogColumns } from "./activity-log-columns"
import { ActivityLogToolbar } from "./activity-log-toolbar"
import { MobileActivityLogCard } from "./mobile-activity-log-card"

interface ActivityLogSectionProps {
  activityLogs: PaginatedActivityLogs
  filters: ActivityLogFilters
  logNames: string[]
  events: string[]
  deviceTypes: string[]
  users: { value: string; label: string }[]
  updatingLogId?: number | null
}

export const ActivityLogSection = ({
  activityLogs,
  filters,
  // logNames,
  // events,
  // deviceTypes,
  users,
  updatingLogId,
}: ActivityLogSectionProps) => {
  const activityLogColumns = useMemo(() => getActivityLogColumns(), [])

  const pagination: PaginationInfo = {
    currentPage: activityLogs?.current_page || 1,
    totalPages: activityLogs?.last_page || 1,
    totalItems: activityLogs?.total || 0,
    itemsPerPage: activityLogs?.per_page || 10,
    hasNextPage: !!activityLogs?.next_page_url,
    hasPreviousPage: !!activityLogs?.prev_page_url,
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold">Activity Log</h2>
          <p className="text-muted-foreground text-xs sm:text-sm">
            Track all user activities and system events
          </p>
        </div>
      </div>

      <DataTable
        data={activityLogs?.data || []}
        pagination={pagination}
        useInertia={true}
        columns={activityLogColumns}
        toolbar={<ActivityLogToolbar filters={filters} users={users} />}
        emptyMessage="No activity logs found"
        mobileCardComponent={(log) => <MobileActivityLogCard log={log} />}
        enableMobileCards={true}
        isRowLoading={(item) => item.id === updatingLogId}
      />
    </div>
  )
}
