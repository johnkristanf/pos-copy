import { Banknote, Clock, CreditCard, Wallet } from "lucide-react"
import { useRealtimeInvalidation } from "@/hooks/api/use-realtime-invalidation"
import { useRealtimeReload } from "@/hooks/api/use-realtime-reload"
import { formatCurrency } from "@/lib/format"
import { DailyCollection } from "@/types"
import {
  ActiveTransactionQueue,
  PendingTransaction,
} from "./active-transaction-queue"
import { DailyCollectionsBreakdown } from "./daily-sales-breakdown"
import { KpiCard } from "./kpi-card"
import { QuickItemLookUp } from "./quick-item-lookup"

interface CashierDashboardSectionProps {
  dailyCollections: DailyCollection[]
  pendingTransactions: PendingTransaction[]
  totalCollectedToday: number
  queueCount: number
}

export const CashierDashboardSection = ({
  dailyCollections,
  pendingTransactions,
  totalCollectedToday,
  queueCount,
}: CashierDashboardSectionProps) => {
  useRealtimeReload("orders", ".order.modified", [
    "pending_transactions",
    "queue_count",
  ])

  useRealtimeReload("payments", ".payment.modified", [
    "daily_collections",
    "total_collected_today",
    "pending_transactions",
    "queue_count",
  ])

  useRealtimeInvalidation("items", ".item.modified", ["dashboard-item-lookup"])
  useRealtimeInvalidation("customers", ".customer.modified", [
    "quick-customer-search",
  ])

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 p-2 md:p-6 max-w-400 mx-auto">
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Total Collected"
          icon={Wallet}
          value={formatCurrency(totalCollectedToday)}
          label="Today's Total Inflow"
          trend="positive"
        />
        <KpiCard
          title="Queue"
          icon={Clock}
          value={queueCount.toString()}
          label="Pending Payments"
        />
        <KpiCard
          title="Cash In"
          icon={Banknote}
          value={formatCurrency(
            dailyCollections.find((c) => c.tag === "cash")?.total || 0,
          )}
          label="Cash Drawer"
        />
        <KpiCard
          title="Digital/Bank"
          icon={CreditCard}
          value={formatCurrency(
            dailyCollections
              .filter((c) => ["maya", "bank_transfer", "check"].includes(c.tag))
              .reduce((sum, c) => sum + c.total, 0),
          )}
          label="Non-Cash Collections"
        />
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-12 h-full">
        <div className="lg:col-span-8 space-y-6">
          <ActiveTransactionQueue pendingTransactions={pendingTransactions} />
        </div>

        <div className="lg:col-span-4 space-y-6">
          <QuickItemLookUp isCashier={true} />
          <DailyCollectionsBreakdown
            dailyCollections={dailyCollections}
            totalCollectedToday={totalCollectedToday}
          />
        </div>
      </div>
    </div>
  )
}
