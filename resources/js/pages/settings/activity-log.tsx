import { Deferred, usePage } from "@inertiajs/react"
import { ReactNode, useState } from "react"
import { ActivityLogSection } from "@/components/features/activity-log/activity-log-section"
import { ActivityLogSectionSkeleton } from "@/components/features/activity-log/activity-log-skeleton"
import { ContentLayout } from "@/components/layouts/content-layout"
import { DynamicBreadcrumb } from "@/components/ui/common/dynamic-breadcrumb"
import { PAGE_ROUTES } from "@/config/page-routes"
import { useRealtimeReload } from "@/hooks/api/use-realtime-reload"
import AppLayout from "@/layouts/dashboard-layout"
import PageLayout from "@/layouts/page-layout"
import {
  ActivityLogFilters,
  BreadcrumbItemProps,
  PaginatedActivityLogs,
  SharedData,
} from "@/types"

const activityPage: BreadcrumbItemProps<string>[] = [
  { label: "Dashboard", href: PAGE_ROUTES.DASHBOARD_PAGE },
  { label: "Activity Log", href: PAGE_ROUTES.ACTIVITY_LOG_PAGE },
]

interface ActivityLogPageProps {
  activity_logs?: PaginatedActivityLogs
  filters: ActivityLogFilters
  log_names: string[]
  events: string[]
  device_types: string[]
  users: { value: string; label: string }[]
}

export default function ActivityLogPage({
  activity_logs,
  filters,
  log_names,
  events,
  device_types,
  users,
}: ActivityLogPageProps) {
  const { auth } = usePage<SharedData>().props
  const user = auth.user
  const [updatingLogId, setUpdatingLogId] = useState<number | null>(null)

  useRealtimeReload(
    "activity-logs",
    ".activity-log.modified",
    ["activity_logs"],
    (e: any) => {
      if (e?.id) {
        setUpdatingLogId(e.id)
      }
    },
    () => {
      setUpdatingLogId(null)
    },
  )

  return (
    <AppLayout>
      <ContentLayout title="Activity Log" userId={user.id}>
        <DynamicBreadcrumb items={activityPage} />
        {activity_logs ? (
          <ActivityLogSection
            activityLogs={activity_logs}
            filters={filters}
            logNames={log_names}
            events={events}
            deviceTypes={device_types}
            users={users}
            updatingLogId={updatingLogId}
          />
        ) : (
          <Deferred
            data="activity_logs"
            fallback={<ActivityLogSectionSkeleton />}
          >
            <ActivityLogSection
              activityLogs={activity_logs as unknown as PaginatedActivityLogs}
              filters={filters}
              logNames={log_names}
              events={events}
              deviceTypes={device_types}
              users={users}
              updatingLogId={updatingLogId}
            />
          </Deferred>
        )}
      </ContentLayout>
    </AppLayout>
  )
}

ActivityLogPage.layout = (page: ReactNode) => (
  <PageLayout title="Activity Log" metaDescription="All users activity logs">
    {page}
  </PageLayout>
)
