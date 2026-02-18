import { Deferred } from "@inertiajs/react"
import { Separator } from "@/components/ui/common/separator"
import { DetailedCustomer } from "@/types"
import { ContactInfo } from "./contact-info"
import { CreditPaymentHistory } from "./credit-payment-history"
// import { CreditRating } from "./credit-rating"
import { CustomerHeader } from "./customer-header"
import { CustomerStats } from "./customer-stats"
import { RecentOrder, RecentOrders } from "./recent-orders"

interface CustomerProfileSectionProps {
  customer: DetailedCustomer
  recentOrders?: RecentOrder[]
  updatingOrderId?: number | null
}

export function CustomerProfileSection({
  customer,
  recentOrders,
  updatingOrderId,
}: CustomerProfileSectionProps) {
  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <CustomerHeader customer={customer} />
      <Separator />

      <div className="grid gap-6 md:grid-cols-3 items-start">
        <div className="space-y-6 md:col-span-2">
          <CustomerStats customer={customer} />
          <Deferred
            data="recentOrders"
            fallback={
              <RecentOrders
                orders={undefined}
                updatingOrderId={updatingOrderId}
                customer={customer}
              />
            }
          >
            <RecentOrders
              orders={recentOrders}
              updatingOrderId={updatingOrderId}
              customer={customer}
            />
          </Deferred>
        </div>

        <div className="space-y-6">
          <ContactInfo customer={customer} />
          <Deferred
            data="recentOrders"
            fallback={
              <div className="h-64 rounded-xl border bg-card animate-pulse" />
            }
          >
            <CreditPaymentHistory recentOrders={recentOrders} />
          </Deferred>
          {/* <CreditRating customer={customer} /> */}
        </div>
      </div>
    </div>
  )
}
