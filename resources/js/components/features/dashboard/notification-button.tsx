import { AnimatePresence, motion } from "framer-motion"
import { Bell, BellDot, Check, CheckCheck, Info, Loader2 } from "lucide-react"
import { useMemo, useState } from "react"
import {
  useGetManyNotifications,
  useUpdateNotification,
} from "@/hooks/api/notification"
import { useRealtimeInvalidation } from "@/hooks/api/use-realtime-invalidation"
import { useRolePermissionFeatureViewer } from "@/hooks/ui/use-role-permission-viewer"
import { Notification } from "@/types"
import { NotificationItem } from "./notification-item"

type TabType = "all" | "unread"

interface NotificationButtonProps {
  userId: number
}

const parseActionPermission = (
  action: string,
): { feature: string; permission: string } | null => {
  const colonIndex = action.indexOf(":")
  if (colonIndex === -1) return null

  const feature = action.substring(0, colonIndex)
  const permission = action.substring(colonIndex + 1)

  if (
    !feature ||
    !permission ||
    feature.includes(" ") ||
    permission.includes(" ")
  ) {
    return null
  }

  return { feature, permission }
}

const filterNotificationsByPermission = (
  notifications: Notification[],
  viewWrapper: (
    allowedRoles?: string[],
    allowedFeatures?: string[],
    allowedLocations?: string[],
    allowedPermissions?: readonly string[],
  ) => boolean,
): Notification[] => {
  return notifications.filter((notification) => {
    if (!notification.actions || notification.actions.length === 0) return true

    let parsed: { feature: string; permission: string } | null = null
    for (const action of notification.actions) {
      parsed = parseActionPermission(action)
      if (parsed) break
    }

    if (!parsed) return true

    return viewWrapper([], [parsed.feature], [], [parsed.permission])
  })
}

export const NotificationButton = ({ userId }: NotificationButtonProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>("all")
  const [limit, setLimit] = useState(10)
  const [isMarkingAll, setIsMarkingAll] = useState(false)

  const { viewWrapper } = useRolePermissionFeatureViewer()

  useRealtimeInvalidation("notifications", "notification.modified", [
    "notifications",
  ])

  const {
    data: notificationData,
    isLoading,
    isFetching,
  } = useGetManyNotifications(
    {
      user_id: Number(userId),
      per_page: limit,
    },
    {
      refetchInterval: 30000,
    },
  )

  const { mutateAsync: updateNotificationAsync } = useUpdateNotification()

  const notifications = useMemo(() => {
    const rawNotifications = notificationData?.data || []
    return filterNotificationsByPermission(rawNotifications, viewWrapper)
  }, [notificationData?.data, viewWrapper])

  const totalNotifications = notifications.length
  const hasMore =
    (notificationData?.total || 0) > (notificationData?.data?.length || 0)

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.seen_by?.includes(Number(userId)))
      .length
  }, [notifications, userId])

  const filteredNotifications = useMemo(() => {
    if (activeTab === "all") return notifications
    return notifications.filter((n) => !n.seen_by?.includes(Number(userId)))
  }, [notifications, activeTab, userId])

  const handleToggle = () => setIsOpen(!isOpen)

  const handleFetchAll = () => {
    setLimit(100)
  }

  const handleMarkAsSeen = async (id: number) => {
    const notif = notifications.find((n) => n.id === id)
    if (notif) {
      const currentSeen = notif.seen_by || []
      if (!currentSeen.includes(Number(userId))) {
        await updateNotificationAsync({
          id,
          payload: { seen_by: [...currentSeen, Number(userId)] },
        })
      }
    }
  }

  const handleMarkAllSeen = async () => {
    setIsMarkingAll(true)

    const updatePromises = filteredNotifications
      .filter((n) => !n.seen_by?.includes(Number(userId)))
      .map((n) => {
        const currentSeen = n.seen_by || []
        return updateNotificationAsync({
          id: n.id,
          payload: { seen_by: [...currentSeen, Number(userId)] },
        })
      })

    await Promise.allSettled(updatePromises)
    setIsMarkingAll(false)
  }

  return (
    <div className="relative z-50">
      <button
        type="button"
        onClick={handleToggle}
        className={`
          relative flex h-10 w-10 items-center justify-center rounded-full transition-all duration-200
          ${
            isOpen
              ? "bg-linear-to-r from-[#349083] to-[#e3ea4e] text-white hover:from-[#349083]/90 hover:to-[#e3ea4e]/90 focus-visible:ring-[#e3ea4e]/50"
              : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100"
          }
        `}
      >
        {unreadCount > 0 ? (
          <BellDot className="h-5 w-5" />
        ) : (
          <Bell className="h-5 w-5" />
        )}

        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-linear-to-br from-red-500 to-red-600 px-1.5 text-[10px] font-bold text-white shadow-lg ring-2 ring-white dark:ring-zinc-950"
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </motion.span>
        )}

        {unreadCount > 0 && !isOpen && (
          <span className="absolute inset-0 size-10 rounded-full bg-red-500 opacity-20 animate-ping" />
        )}
      </button>

      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
            className="absolute right-0 top-12 z-50 w-120 origin-top-right overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-2xl ring-1 ring-black/5"
          >
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 bg-linear-to-br from-zinc-50/50 to-zinc-100/30 dark:from-zinc-900/50 dark:to-zinc-800/30 px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-linear-to-r from-[#349083] to-[#e3ea4e] shadow-sm">
                  <Bell className="h-3.5 w-3.5 text-white" />
                </div>
                <h3 className="text-sm font-semibold text-foreground">
                  Notifications
                </h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400">
                    {unreadCount} new
                  </span>
                )}
              </div>

              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllSeen}
                  disabled={isMarkingAll}
                  className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md bg-linear-to-r from-[#349083] to-[#2a7569] text-white hover:from-[#2a7569] hover:to-[#349083] transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isMarkingAll ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <CheckCheck className="h-3 w-3" />
                  )}
                  {isMarkingAll ? "Marking..." : "Mark all read"}
                </button>
              )}
            </div>
            <div className="flex gap-1 border-b border-zinc-200 dark:border-zinc-800 px-3 py-2 bg-zinc-50/50 dark:bg-zinc-900/30">
              {(["all", "unread"] as const).map((tab) => {
                const count = tab === "all" ? notifications.length : unreadCount
                return (
                  <button
                    type="button"
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`
                      relative flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all
                      ${
                        activeTab === tab
                          ? "bg-white dark:bg-zinc-800 text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground hover:bg-white/50 dark:hover:bg-zinc-800/50"
                      }
                    `}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    <span
                      className={`
                      px-1.5 py-0.5 text-[10px] font-bold rounded-full
                      ${
                        activeTab === tab
                          ? "bg-[#349083]/10 text-[#349083] dark:text-[#e3ea4e]"
                          : "bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400"
                      }
                    `}
                    >
                      {count}
                    </span>
                  </button>
                )
              })}
            </div>
            <div className="h-96 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto scrollbar-thin">
                {isLoading ? (
                  <div className="flex h-full items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-[#349083]" />
                  </div>
                ) : filteredNotifications.length > 0 ? (
                  <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {filteredNotifications.map((notification) => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        userId={Number(userId)}
                        onMarkAsSeen={handleMarkAsSeen}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-3 px-4">
                    <div className="h-16 w-16 rounded-full bg-linear-to-br from-zinc-100 to-zinc-200 dark:from-zinc-900/30 dark:to-zinc-800/30 flex items-center justify-center border border-zinc-200 dark:border-zinc-800/50">
                      {activeTab === "unread" ? (
                        <CheckCheck className="h-8 w-8 text-emerald-500" />
                      ) : (
                        <Info className="h-8 w-8 text-zinc-400 dark:text-zinc-500" />
                      )}
                    </div>
                    <div className="space-y-1 text-center">
                      <p className="font-semibold text-sm text-foreground">
                        {activeTab === "unread"
                          ? "All caught up!"
                          : "No notifications"}
                      </p>
                      <p className="text-xs text-muted-foreground/70 max-w-xs">
                        {activeTab === "unread"
                          ? "You've read all your notifications"
                          : "You'll see updates here when they arrive"}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {hasMore && filteredNotifications.length > 0 && (
                <div className="border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 p-3 shrink-0">
                  <button
                    type="button"
                    onClick={handleFetchAll}
                    disabled={isFetching}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-white dark:bg-zinc-800 px-4 py-2.5 text-xs font-medium text-foreground shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-700 transition-all hover:bg-zinc-50 dark:hover:bg-zinc-700 hover:shadow active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isFetching ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        <Check className="h-3.5 w-3.5" />
                        View All {totalNotifications} Notifications
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
