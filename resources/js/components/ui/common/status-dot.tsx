import { cn } from "@/lib/cn"

function getStatusConfig(status: string) {
  switch (status) {
    case "paid":
    case "fully_paid":
      return {
        classes: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
        dot: "bg-emerald-500",
      }
    case "pending":
    case "partially_paid":
      return {
        classes: "bg-amber-500/10 text-amber-700 border-amber-500/20",
        dot: "bg-amber-500",
      }
    case "void":
    case "cancelled":
      return {
        classes: "bg-red-500/10 text-red-700 border-red-500/20",
        dot: "bg-red-500",
      }
    case "draft":
      return {
        classes: "bg-muted text-muted-foreground border-border",
        dot: "bg-muted-foreground",
      }
    default:
      return {
        classes: "bg-muted text-foreground border-border",
        dot: "bg-foreground",
      }
  }
}

export const StatusDot = ({ color }: { color: string }) => (
  <span className="relative flex h-2 w-2">
    <span
      className={cn(
        "absolute inline-flex h-full w-full animate-ping rounded-full opacity-75",
        color,
      )}
    />
    <span className={cn("relative inline-flex h-2 w-2 rounded-full", color)} />
  </span>
)

export const DashboardStatusDot = ({ status }: { status: string }) => {
  const variant = getStatusConfig(status)
  return (
    <div
      className={cn(
        "flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-medium uppercase tracking-wide",
        variant.classes,
      )}
    >
      <div className={cn("w-1.5 h-1.5 rounded-full", variant.dot)} />
      {status.replace("_", " ")}
    </div>
  )
}
