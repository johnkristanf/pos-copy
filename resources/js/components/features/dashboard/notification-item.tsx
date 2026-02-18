import { formatDistanceToNow } from "date-fns"
import { Check } from "lucide-react"
import { useMemo } from "react"
import { Notification } from "@/types"

interface NotificationItemProps {
  notification: Notification
  userId: number
  onMarkAsSeen: (id: number) => void
}

const formatNotificationMessage = (text: string) => {
  const regex =
    /\b(created|performed|updated|deleted|removed|added|approved|rejected|voided|processed|requested|set|saved|marked|transferred|assembled|applied|stored|recorded|served|cancelled)\b\s+(.*?)(?=\s+\b(for item|for|of|to|in|on)\b|\s*:|$)/i
  const match = text.match(regex)

  if (!match) return <span>{text}</span>

  const startIndex = match.index!
  const highlighted = match[0].trimEnd()
  const before = text.substring(0, startIndex)
  const after = text.substring(startIndex + highlighted.length)

  return (
    <span className="leading-snug">
      {before}
      <span className="inline-flex items-center rounded-md bg-[#349083]/10 dark:bg-[#349083]/20 px-1.5 py-0.5 text-[11px] font-bold text-[#349083] dark:text-[#e3ea4e] shadow-xs">
        {highlighted}
      </span>
      {after}
    </span>
  )
}

export const NotificationItem = ({
  notification,
  userId,
  onMarkAsSeen,
}: NotificationItemProps) => {
  const isSeen = notification.seen_by?.includes(userId) ?? false

  const rawMessage = useMemo(() => {
    if (!notification.actions || notification.actions.length === 0) {
      return "New activity on your account."
    }
    const lastAction = notification.actions[notification.actions.length - 1]
    return lastAction.replace(/_/g, " ")
  }, [notification.actions])

  return (
    <div
      className={`
        group relative flex flex-col gap-1 p-3 text-sm transition-colors duration-150
        ${isSeen ? "bg-white dark:bg-zinc-950 hover:bg-zinc-50 dark:hover:bg-zinc-900" : "bg-blue-50/50 dark:bg-blue-950/20 hover:bg-blue-50 dark:hover:bg-blue-950/30"}
      `}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div
            className={`mt-1.5 flex h-2 w-2 shrink-0 rounded-full ${isSeen ? "bg-transparent" : "bg-blue-500"}`}
          />
          <div className="flex flex-col gap-1">
            <div
              className={`font-medium ${isSeen ? "text-zinc-700 dark:text-zinc-300" : "text-zinc-900 dark:text-zinc-100"}`}
            >
              {formatNotificationMessage(rawMessage)}
            </div>
            <span className="text-xs text-zinc-400 dark:text-zinc-500">
              {formatDistanceToNow(new Date(notification.created_at), {
                addSuffix: true,
              })}
            </span>
          </div>
        </div>

        {!isSeen && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onMarkAsSeen(notification.id)
            }}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-full"
            title="Mark as read"
          >
            <Check className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  )
}
