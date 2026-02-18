import { motion, Variants } from "framer-motion"
import {
  History,
  PackageIcon,
  TrendingDownIcon,
  TrendingUpIcon,
} from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/common/card"
import { ScrollArea } from "@/components/ui/common/scroll-area"

interface RecentMovement {
  id: number
  event: string
  description: string
  causer: string
  time_ago: string
}

interface RecentInventoryActivitiesProps {
  movements: RecentMovement[]
}

export const RecentInventoryActivities = ({
  movements,
}: RecentInventoryActivitiesProps) => {
  const getEventIcon = (event: string) => {
    const eventLower = event.toLowerCase()
    if (eventLower.includes("stock in") || eventLower.includes("added")) {
      return <TrendingUpIcon className="h-3 w-3 text-emerald-500" />
    }
    if (eventLower.includes("stock out") || eventLower.includes("sold")) {
      return <TrendingDownIcon className="h-3 w-3 text-red-500" />
    }
    return <PackageIcon className="h-3 w-3 text-blue-500" />
  }

  const getEventColor = (event: string) => {
    const eventLower = event.toLowerCase()
    if (eventLower.includes("stock in") || eventLower.includes("added")) {
      return "from-emerald-500/10 to-emerald-600/5 border-emerald-500/20"
    }
    if (eventLower.includes("stock out") || eventLower.includes("sold")) {
      return "from-red-500/10 to-red-600/5 border-red-500/20"
    }
    return "from-blue-500/10 to-blue-600/5 border-blue-500/20"
  }

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  }

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 10, x: -5 },
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
      transition: { type: "spring" as const, stiffness: 300, damping: 24 },
    },
  }

  return (
    <div className="group relative h-full rounded-xl transition-all duration-300 hover:shadow-lg">
      <div
        className="absolute -inset-px rounded-xl bg-linear-to-r from-[#349083] to-[#e3ea4e] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        aria-hidden="true"
      />

      <Card className="relative h-full flex flex-col border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm overflow-hidden z-10">
        <CardHeader className="border-b border-border/40 pb-4 bg-linear-to-br from-zinc-50/50 to-zinc-100/30 dark:from-zinc-900/50 dark:to-zinc-800/30 shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-linear-to-r from-[#349083] to-[#e3ea4e] shadow-sm">
                  <History className="h-3.5 w-3.5 text-white" />
                </div>
                <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                  Recent Activity
                </CardTitle>
              </div>
              <CardDescription className="text-[11px] text-muted-foreground/70 leading-relaxed">
                Latest inventory movements
              </CardDescription>
            </div>
            <div className="px-2 py-1 rounded-md bg-linear-to-br from-zinc-100/50 to-transparent dark:from-zinc-800/30 dark:to-transparent border border-border/40">
              <span className="text-[10px] font-mono font-bold text-muted-foreground">
                {movements.length} LOGS
              </span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-hidden p-0 relative">
          <ScrollArea className="h-full">
            <motion.div
              className="p-4 space-y-3 pb-16"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {movements.length > 0 ? (
                movements.map((log, index) => (
                  <motion.div
                    key={log.id}
                    variants={itemVariants}
                    className={`relative flex flex-col gap-2 p-3 rounded-lg bg-linear-to-br ${getEventColor(
                      log.event,
                    )} border group/log hover:shadow-sm transition-all duration-200`}
                  >
                    {index < movements.length - 1 && (
                      <div className="absolute left-5.5 top-10 -bottom-3 w-0.5 bg-linear-to-b from-border to-transparent" />
                    )}

                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="shrink-0 p-1 rounded-full bg-background shadow-sm border border-border">
                          {getEventIcon(log.event)}
                        </div>
                        <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                          {log.event}
                        </span>
                      </div>
                      <span className="text-[10px] text-muted-foreground font-medium shrink-0">
                        {log.time_ago}
                      </span>
                    </div>

                    <p className="text-xs text-foreground/80 line-clamp-2 leading-relaxed pl-7">
                      {log.description}
                    </p>

                    <div className="flex items-center gap-1.5 pl-7">
                      <span className="text-[10px] text-muted-foreground">
                        By
                      </span>
                      <span className="text-[10px] font-semibold text-foreground">
                        {log.causer}
                      </span>
                    </div>
                  </motion.div>
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center h-32 text-center gap-2"
                >
                  <div className="p-3 sm:p-4 rounded-full bg-muted/50 mb-3 sm:mb-4/40">
                    <History className="h-7 w-7 text-muted-foreground opacity-50" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-semibold text-sm text-foreground">
                      No Activity
                    </p>
                    <p className="text-xs text-muted-foreground/70">
                      Movement history will appear here
                    </p>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </ScrollArea>

          <div
            className="absolute bottom-0 left-0 right-0 h-15 pointer-events-none z-20 bg-linear-to-t from-white via-white/80 to-transparent dark:from-zinc-950 dark:via-zinc-950/80 backdrop-blur-[1px]"
            aria-hidden="true"
          />
        </CardContent>
      </Card>
    </div>
  )
}
