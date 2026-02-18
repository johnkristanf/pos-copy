import { Package } from "lucide-react"

export const RecentOrdersEmptyState = () => {
  return (
    <div className="h-full flex flex-col items-center justify-center py-12 text-center space-y-3 bg-muted/10 rounded-xl border border-dashed">
      <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
        <Package className="h-6 w-6 text-muted-foreground/60" />
      </div>
      <div className="space-y-1">
        <h3 className="font-medium text-base text-foreground">No orders yet</h3>
        <p className="text-sm text-muted-foreground max-w-xs mx-auto">
          This customer hasn't placed any orders yet. Once they do, they'll
          appear here.
        </p>
      </div>
    </div>
  )
}
