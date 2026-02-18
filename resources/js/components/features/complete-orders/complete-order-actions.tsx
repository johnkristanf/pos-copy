import { CheckCircle, Eye, MoreHorizontal, XCircle } from "lucide-react"
import { Button } from "@/components/ui/common/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/common/dropdown-menu"
import { Order } from "@/types"

interface CompleteOrdersActionsProps {
  order: Order
}

export const CompleteOrdersActions = ({
  order,
}: CompleteOrdersActionsProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => console.log("View order", order.id)}>
          <Eye className="mr-2 h-4 w-4" />
          View Details
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => console.log("Complete order", order.id)}
        >
          <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
          Mark Completed
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onClick={() => console.log("Cancel order", order.id)}
        >
          <XCircle className="mr-2 h-4 w-4" />
          Cancel Order
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
