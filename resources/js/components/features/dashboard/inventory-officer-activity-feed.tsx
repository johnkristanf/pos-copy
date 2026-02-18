import { motion } from "framer-motion"
import { Clock, FileText, Package, Truck } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/common/card"
import { ScrollArea } from "@/components/ui/common/scroll-area"

interface ActivityItem {
  description: string
  time: string
  date: string
  type: string
}

interface InventoryOfficerActivityFeedProps {
  activities: ActivityItem[]
}

export const InventoryOfficerActivityFeed = ({
  activities,
}: InventoryOfficerActivityFeedProps) => {
  const getIcon = (description: string) => {
    const lower = description.toLowerCase()
    if (lower.includes("order")) return <FileText className="h-4 w-4" />
    if (lower.includes("transfer")) return <Truck className="h-4 w-4" />
    return <Package className="h-4 w-4" />
  }

  return (
    <div className="group relative h-full rounded-xl transition-all duration-300 hover:shadow-lg">
      <div
        className="absolute -inset-px rounded-xl bg-linear-to-r from-[#349083] to-[#e3ea4e] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        aria-hidden="true"
      />
      <Card className="relative h-full flex flex-col border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm overflow-hidden z-10">
        <CardHeader className="border-b border-border/40 pb-3 sm:pb-4 bg-linear-to-br from-zinc-50/50 to-zinc-100/30 dark:from-zinc-900/50 dark:to-zinc-800/30 shrink-0">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-linear-to-r from-[#349083] to-[#e3ea4e] shadow-sm">
                <Clock className="h-3.5 w-3.5 text-white" />
              </div>
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                Recent Activity
              </CardTitle>
            </div>
            <CardDescription className="text-[11px] text-muted-foreground/70 leading-relaxed">
              Your latest actions and logs
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-hidden p-0 relative">
          <ScrollArea className="h-full">
            <div className="p-4 pt-3 space-y-3">
              {activities.length > 0 ? (
                activities.map((activity, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex gap-3 items-start group/item p-2 rounded-lg hover:bg-linear-to-r hover:from-zinc-50/80 hover:to-transparent dark:hover:from-zinc-900/50 dark:hover:to-transparent transition-colors border border-transparent hover:border-border/40"
                  >
                    <div className="mt-0.5 p-2 rounded-full bg-zinc-100 dark:bg-zinc-800 text-muted-foreground group-hover/item:bg-[#349083]/10 group-hover/item:text-[#349083] transition-colors">
                      {getIcon(activity.description)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none group-hover/item:text-[#349083] transition-colors">
                        {activity.description}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground/70">
                        <span>{activity.date}</span>
                        <span>•</span>
                        <span>{activity.time}</span>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-8 gap-3"
                >
                  <div className="p-3 sm:p-4 rounded-full bg-muted/50">
                    <Clock className="h-7 w-7 text-muted-foreground opacity-50" />
                  </div>
                  <div className="space-y-1 text-center">
                    <p className="text-sm font-medium text-muted-foreground">
                      No Recent Activity
                    </p>
                    <p className="text-xs text-muted-foreground/70">
                      Activity will appear here as you work
                    </p>
                  </div>
                </motion.div>
              )}
            </div>
          </ScrollArea>
          <div
            className="absolute bottom-0 left-0 right-0 h-5 pointer-events-none z-20 bg-linear-to-t from-white via-white/80 to-transparent dark:from-zinc-950 dark:via-zinc-950/80 backdrop-blur-[1px]"
            aria-hidden="true"
          />
        </CardContent>
      </Card>
    </div>
  )
}
