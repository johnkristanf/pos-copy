import { useState } from "react"
import { Button } from "@/components/ui/common/button"
import { cn } from "@/lib/cn"
import { Order } from "@/types"

interface ServeOrderRemarksProps {
  selectedOrder: Order | null
  className?: string
}

export function ServeOrderRemarks({
  selectedOrder,
  className,
}: ServeOrderRemarksProps) {
  const [remarks, setRemarks] = useState("")

  if (!selectedOrder) {
    return (
      <div
        className={cn(
          "rounded-xl border bg-card text-card-foreground shadow-sm",
          className,
        )}
      >
        <div className="flex flex-col items-center justify-center space-y-2 p-6 text-center">
          <p className="text-sm text-muted-foreground">
            Select an order to serve
          </p>
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "rounded-xl border bg-card text-card-foreground shadow-sm",
        className,
      )}
    >
      <div className="flex flex-col space-y-1.5 p-6">
        <h3 className="font-semibold leading-none tracking-tight">
          Serve Order
        </h3>
        <p className="text-sm text-muted-foreground">
          Add remarks for Order #{selectedOrder.id}
        </p>
      </div>
      <div className="space-y-4 p-6 pt-0">
        <textarea
          className="flex min-h-20 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="Enter remarks..."
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
        />
        <Button className="w-full" variant="bridge_digital">
          Submit
        </Button>
      </div>
    </div>
  )
}
