// resources/js/components/features/customer-profile/customer-stats.tsx

import { Building, CreditCard, Wallet } from "lucide-react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/common/card"
import { formatCurrency } from "@/lib/format"
import { DetailedCustomer } from "@/types"

interface CustomerStatsProps {
  customer: DetailedCustomer
}

export function CustomerStats({ customer }: CustomerStatsProps) {
  const creditLimit = customer.credit?.limit ?? 0
  const currentBalance = customer.credit?.balance ?? 0
  const creditTerm = customer.credit?.term ?? 0

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* Total Spent */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
          <Building className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(customer.total_order_value || 0)}
          </div>
          <p className="text-xs text-muted-foreground">
            From {customer.orders_count || 0} orders
          </p>
        </CardContent>
      </Card>

      {/* Credit Limit & Term */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Credit Limit</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(creditLimit)}
          </div>
          <p className="text-xs text-muted-foreground">
            {creditTerm > 0 ? `${creditTerm} Days Term` : "No terms set"}
          </p>
        </CardContent>
      </Card>

      {/* Outstanding Balance */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Credit Balance</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-destructive">
            {formatCurrency(currentBalance)}
          </div>
          <p className="text-xs text-muted-foreground">Current outstanding</p>
        </CardContent>
      </Card>
    </div>
  )
}
