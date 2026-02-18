// File: administrator-activity-feed.tsx
import { motion, Variants } from "framer-motion"
import {
  CheckCircle2,
  Key,
  Lock,
  ShieldAlert,
  ShieldCheck,
  UserCog,
} from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/common/card"
import { ScrollArea } from "@/components/ui/common/scroll-area"
import { cn } from "@/lib/cn"

export interface AdminActivity {
  id: number
  description: string
  causer: string
  module: string
  event: string
  created_at: string
  time_ago: string
  severity: "high" | "normal"
}

interface AdministratorActivityFeedProps {
  activities: AdminActivity[]
}

export const AdministratorActivityFeed = ({
  activities,
}: AdministratorActivityFeedProps) => {
  const getActivityIcon = (log: AdminActivity) => {
    if (log.severity === "high")
      return <ShieldAlert className="h-3.5 w-3.5 text-red-500" />
    if (log.module === "AUTHENTICATION")
      return <Lock className="h-3.5 w-3.5 text-blue-500" />
    if (log.module === "API_KEYS")
      return <Key className="h-3.5 w-3.5 text-amber-500" />
    if (log.module === "USER")
      return <UserCog className="h-3.5 w-3.5 text-purple-500" />
    return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
  }

  const getSeverityStyles = (severity: string) => {
    if (severity === "high") {
      return "from-red-500/10 to-red-600/5 border-red-500/20 hover:border-red-500/30"
    }
    return "from-zinc-50 to-zinc-100/50 dark:from-zinc-900 dark:to-zinc-800/50 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
  }

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  }

  const itemVariants: Variants = {
    hidden: { opacity: 0, x: -10 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
  }

  return (
    <div className="group relative h-full rounded-xl transition-all duration-300 hover:shadow-lg">
      <div
        className="absolute -inset-px rounded-xl bg-linear-to-r from-[#349083] to-[#e3ea4e] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        aria-hidden="true"
      />
      <Card className="relative h-full flex flex-col border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm overflow-hidden z-10">
        <CardHeader className="border-b border-border/40 pb-3 sm:pb-4 bg-linear-to-br from-zinc-50/50 to-zinc-100/30 dark:from-zinc-900/50 dark:to-zinc-800/30 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-linear-to-r from-[#349083] to-[#e3ea4e] shadow-sm">
                <ShieldCheck className="h-3.5 w-3.5 text-white" />
              </div>
              <div className="space-y-0.5">
                <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                  System Audit
                </CardTitle>
                <CardDescription className="text-[11px] text-muted-foreground/70 leading-relaxed">
                  Security & operational logs
                </CardDescription>
              </div>
            </div>
            <div className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20">
              <span className="text-[10px] font-mono font-medium text-emerald-600 dark:text-emerald-400">
                LIVE
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden p-0 relative">
          <ScrollArea className="h-full">
            <motion.div
              className="p-4 space-y-3"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {activities.length > 0 ? (
                activities.map((log) => (
                  <motion.div
                    key={log.id}
                    variants={itemVariants}
                    className={cn(
                      "relative flex flex-col gap-1.5 p-3 rounded-lg bg-linear-to-br border transition-all duration-200 hover:shadow-sm",
                      getSeverityStyles(log.severity),
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="shrink-0 p-1 rounded-full bg-white dark:bg-zinc-950 shadow-sm border border-border/50">
                          {getActivityIcon(log)}
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          {log.module}
                        </span>
                      </div>
                      <span className="text-[10px] text-muted-foreground/70 font-mono shrink-0">
                        {log.time_ago}
                      </span>
                    </div>

                    <p className="text-xs font-medium text-foreground pl-7 leading-snug">
                      {log.description}
                    </p>
                    <div className="flex items-center gap-1.5 pl-7 mt-0.5">
                      <span className="text-[10px] text-muted-foreground/70">
                        Actor:
                      </span>
                      <span className="text-[10px] font-medium text-foreground/80 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded border border-border/30">
                        {log.causer}
                      </span>
                    </div>
                  </motion.div>
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-12 gap-3"
                >
                  <div className="h-14 w-14 rounded-full bg-linear-to-br from-zinc-100 to-zinc-200 dark:from-zinc-900/30 dark:to-zinc-800/30 flex items-center justify-center border border-zinc-200 dark:border-zinc-800/50">
                    <ShieldCheck className="h-7 w-7 text-zinc-400 dark:text-zinc-500" />
                  </div>
                  <div className="space-y-1 text-center">
                    <p className="font-semibold text-sm text-foreground">
                      No Recent Activity
                    </p>
                    <p className="text-xs text-muted-foreground/70">
                      System activity will appear here
                    </p>
                  </div>
                </motion.div>
              )}
            </motion.div>
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
