import { motion } from "framer-motion"
import { Coins, CreditCard, PhilippinePeso, Wallet } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/common/card"
import { cn } from "@/lib/cn"
import { formatCurrency } from "@/lib/format"

export interface DailyCollection {
  method: string
  tag: string
  total: number
}

interface DailyCollectionsBreakdownProps {
  dailyCollections: DailyCollection[]
  totalCollectedToday: number
}

export const DailyCollectionsBreakdown = ({
  dailyCollections,
  totalCollectedToday,
}: DailyCollectionsBreakdownProps) => {
  const getPaymentMethodIcon = (method: string) => {
    const methodLower = method.toLowerCase()
    if (methodLower.includes("cash")) {
      return <PhilippinePeso className="h-4 w-4" />
    }
    if (methodLower.includes("card") || methodLower.includes("credit")) {
      return <CreditCard className="h-4 w-4" />
    }
    if (methodLower.includes("wallet") || methodLower.includes("gcash")) {
      return <Wallet className="h-4 w-4" />
    }
    return <PhilippinePeso className="h-4 w-4" />
  }

  const getMethodColor = (method: string) => {
    const methodLower = method.toLowerCase()
    if (methodLower.includes("cash")) {
      return "from-emerald-500 to-emerald-600"
    }
    if (methodLower.includes("card") || methodLower.includes("credit")) {
      return "from-blue-500 to-blue-600"
    }
    if (methodLower.includes("wallet") || methodLower.includes("gcash")) {
      return "from-purple-500 to-purple-600"
    }
    return "from-[#349083] to-[#2a7569]"
  }

  const getMethodBgColor = (method: string) => {
    const methodLower = method.toLowerCase()
    if (methodLower.includes("cash")) {
      return "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/30"
    }
    if (methodLower.includes("card") || methodLower.includes("credit")) {
      return "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800/30"
    }
    if (methodLower.includes("wallet") || methodLower.includes("gcash")) {
      return "bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800/30"
    }
    return "bg-zinc-50 dark:bg-zinc-900/20 border-zinc-200 dark:border-zinc-800/30"
  }

  const getMethodTextColor = (method: string) => {
    const methodLower = method.toLowerCase()
    if (methodLower.includes("cash")) {
      return "text-emerald-700 dark:text-emerald-400"
    }
    if (methodLower.includes("card") || methodLower.includes("credit")) {
      return "text-blue-700 dark:text-blue-400"
    }
    if (methodLower.includes("wallet") || methodLower.includes("gcash")) {
      return "text-purple-700 dark:text-purple-400"
    }
    return "text-foreground"
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { type: "spring" as const, stiffness: 300, damping: 24 },
    },
  }

  return (
    <div className="group relative rounded-xl transition-all duration-300 hover:shadow-lg">
      <div
        className="absolute -inset-px rounded-xl bg-linear-to-r from-[#349083] to-[#e3ea4e] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        aria-hidden="true"
      />

      <Card className="relative flex flex-col border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm overflow-hidden">
        <CardHeader className="border-b border-border/40 pb-3 sm:pb-4 bg-linear-to-br from-zinc-50/50 to-zinc-100/30 dark:from-zinc-900/50 dark:to-zinc-800/30 shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-linear-to-r from-[#349083] to-[#e3ea4e] shadow-sm">
                  <Coins className="h-3.5 w-3.5 text-white" />
                </div>
                <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                  Daily Collections
                </CardTitle>
              </div>
              <CardDescription className="text-[11px] text-muted-foreground/70 leading-relaxed">
                Payment method breakdown for today
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 p-3 sm:p-4 space-y-3 min-h-0 overflow-auto">
          {dailyCollections.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <div className="p-3 sm:p-4 rounded-full bg-muted/50 mb-3 sm:mb-4/40">
                <Coins className="h-7 w-7 text-muted-foreground opacity-50" />
              </div>
              <div className="space-y-1 text-center">
                <p className="text-sm font-medium text-muted-foreground">
                  No Collections Yet
                </p>
                <p className="text-xs text-muted-foreground/70">
                  Payments will appear here once received
                </p>
              </div>
            </div>
          ) : (
            <motion.div
              className="space-y-2.5"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {dailyCollections.map((collection) => (
                <motion.div
                  key={collection.tag}
                  variants={itemVariants}
                  className={cn(
                    "group/item flex items-center justify-between p-3 border rounded-lg transition-all hover:shadow-sm",
                    getMethodBgColor(collection.method),
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div
                      className={cn(
                        "h-9 w-9 rounded-lg bg-linear-to-br flex items-center justify-center text-white shadow-sm shrink-0",
                        getMethodColor(collection.method),
                      )}
                    >
                      {getPaymentMethodIcon(collection.method)}
                    </div>
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <span className="text-sm font-semibold text-foreground capitalize truncate">
                        {collection.method}
                      </span>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                        Payment Method
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-0.5 shrink-0">
                    <span
                      className={cn(
                        "font-bold font-mono text-base tabular-nums",
                        getMethodTextColor(collection.method),
                      )}
                    >
                      {formatCurrency(collection.total)}
                    </span>
                    <span className="text-[9px] text-muted-foreground">
                      Total
                    </span>
                  </div>
                </motion.div>
              ))}

              <div className="pt-3 mt-2 border-t-2 border-dashed border-border/60">
                <div className="flex items-center justify-between p-4 rounded-lg bg-linear-to-br from-[#349083]/10 to-[#e3ea4e]/10 dark:from-[#349083]/20 dark:to-[#e3ea4e]/20 border-2 border-[#349083]/30 dark:border-[#349083]/40 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Total Collected
                      </span>
                      <span className="text-[10px] text-muted-foreground/70">
                        Today's Revenue
                      </span>
                    </div>
                  </div>
                  <span className="font-bold font-mono text-2xl sm:text-3xl text-[#349083] dark:text-[#e3ea4e] tabular-nums tracking-tight">
                    {formatCurrency(totalCollectedToday)}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
