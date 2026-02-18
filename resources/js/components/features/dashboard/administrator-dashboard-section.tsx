import { AlertTriangle, Key, Store, Users, UserX } from "lucide-react"
import { useRealtimeReload } from "@/hooks/api/use-realtime-reload"
import {
  AdminActivity,
  AdministratorActivityFeed,
} from "./administrator-activity-feed"
import { KpiCard } from "./kpi-card"
import { RoleDistribution, RoleStat } from "./role-distribution"

interface AdministratorDashboardSectionProps {
  kpis: {
    total_users: number
    inactive_users: number
    active_integrations: number
    keys_expiring_soon: number
    total_branches: number
  }
  charts: {
    role_distribution: RoleStat[]
  }
  activity_feed: AdminActivity[]
}

export const AdministratorDashboardSection = ({
  kpis,
  charts,
  activity_feed,
}: AdministratorDashboardSectionProps) => {
  useRealtimeReload("users", ".user.modified", [
    "kpis",
    "charts",
    "activity_feed",
  ])
  useRealtimeReload("api_keys", ".apikey.modified", ["kpis", "activity_feed"])

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 p-2 md:p-6 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard
          title="Total Users"
          icon={Users}
          value={kpis.total_users.toString()}
          label="Active Accounts"
        />
        <KpiCard
          title="Inactive"
          icon={UserX}
          value={kpis.inactive_users.toString()}
          label="Deactivated/Suspended"
          trend={kpis.inactive_users > 0 ? "negative" : "positive"}
        />
        <KpiCard
          title="Integrations"
          icon={Key}
          value={kpis.active_integrations.toString()}
          label="Active API Keys"
        />
        <KpiCard
          title="Key Expiry"
          icon={AlertTriangle}
          value={kpis.keys_expiring_soon.toString()}
          label="Expiring < 30 days"
          trend={kpis.keys_expiring_soon > 0 ? "negative" : "positive"}
        />
        <KpiCard
          title="Branches"
          icon={Store}
          value={kpis.total_branches.toString()}
          label="Operational Units"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-80">
        <div className="lg:col-span-8 h-120">
          <RoleDistribution data={charts.role_distribution} />
        </div>
        <div className="lg:col-span-4 h-120">
          <AdministratorActivityFeed activities={activity_feed} />
        </div>
      </div>
    </div>
  )
}
