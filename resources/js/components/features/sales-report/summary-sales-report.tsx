import { Card, CardContent, CardHeader } from "@/components/ui/common/card"
import { CashReconciliation } from "@/types"

interface FinancialSummaryReportProps {
  cashReconciliation: CashReconciliation
}

export default function FinancialSummaryReport({
  cashReconciliation,
}: FinancialSummaryReportProps) {
  // const overageShortage =
  //   cashReconciliation.cash_sales_to_be_remitted -
  //   (
  //     cashReconciliation.cash_remitted +
  //     cashReconciliation.check_on_date +
  //     cashReconciliation.online_bank_transfer +
  //     cashReconciliation.with_holding_tax
  //   );

  // const totalProcessed =
  //   cashReconciliation.cash_remitted +
  //   cashReconciliation.check_on_date +
  //   cashReconciliation.online_bank_transfer +
  //   cashReconciliation.with_holding_tax

  return (
    <div className="">
      <Card className="overflow-hidden">
        <CardHeader className="space-y-0 pb-2 border-b bg-muted/20">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              Daily Cash Reconciliation
            </span>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-1 mb-6">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Cash Sales to be Remitted
            </span>
            <div className="flex items-end gap-2">
              <h2 className="text-4xl font-bold leading-none tracking-tight">
                ₱{" "}
                {(cashReconciliation.cash_sales_to_be_remitted / 1000).toFixed(
                  1,
                )}
                k
              </h2>
              {/* <div className="flex items-center gap-1.5 mb-1">
                {overageShortage === 0 ? (
                  <Badge className="bg-blue-500/15 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 hover:bg-blue-500/25 border-0 shadow-none rounded-full px-2.5">
                    Balanced
                  </Badge>
                ) : overageShortage > 0 ? (
                  <>
                    <Badge className="bg-emerald-500/15 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 hover:bg-emerald-500/25 border-0 shadow-none rounded-full px-2.5">
                      Overage
                    </Badge>
                    <Badge
                      variant="outline"
                      className="text-emerald-700 border-emerald-200 bg-emerald-50 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-900 rounded-full flex items-center gap-0.5 px-2"
                    >
                      <TrendingUp className="w-3 h-3" />₱
                      {Math.abs(overageShortage).toLocaleString()}
                    </Badge>
                  </>
                ) : (
                  <>
                    <Badge className="bg-red-500/15 text-red-700 dark:bg-red-500/20 dark:text-red-400 hover:bg-red-500/25 border-0 shadow-none rounded-full px-2.5">
                      Shortage
                    </Badge>
                    <Badge
                      variant="outline"
                      className="text-red-700 border-red-200 bg-red-50 dark:bg-red-950/50 dark:text-red-400 dark:border-red-900 rounded-full flex items-center gap-0.5 px-2"
                    >
                      <TrendingDown className="w-3 h-3" />₱
                      {Math.abs(overageShortage).toLocaleString()}
                    </Badge>
                  </>
                )}
              </div> */}
            </div>
          </div>

          <div className="space-y-1 pt-4 border-t border-dashed">
            <div className="flex justify-between items-center py-2.5 border-b border-border/30">
              <span className="text-sm font-medium text-foreground/90">
                Cash Remitted
              </span>
              <span className="text-sm font-semibold">
                ₱{cashReconciliation.cash_remitted.toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-muted-foreground">
                Check on Date
              </span>
              <span className="text-sm font-medium">
                ₱{cashReconciliation.check_on_date.toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-muted-foreground">
                Online Bank Transfer
              </span>
              <span className="text-sm font-medium">
                ₱{cashReconciliation.online_bank_transfer.toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-muted-foreground">
                Withholding Tax
              </span>
              <span className="text-sm font-medium">
                ₱{cashReconciliation.with_holding_tax.toLocaleString()}
              </span>
            </div>

            {/* <div className="flex justify-between items-center py-2.5 mt-1 bg-muted/30 -mx-6 px-6 rounded">
              <span className="text-sm font-semibold text-foreground">
                Overage/Shortage
              </span>
              <span
                className={`text-sm font-bold ${
                  overageShortage > 0
                    ? "text-emerald-600 dark:text-emerald-400"
                    : overageShortage < 0
                      ? "text-red-600 dark:text-red-400"
                      : "text-foreground"
                }`}
              >
                {overageShortage > 0 ? "+" : ""}₱
                {overageShortage.toLocaleString()}
              </span>
            </div> */}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
