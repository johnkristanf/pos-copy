import { EyeIcon, MoreHorizontal } from "lucide-react"
import { useMemo } from "react"
import { Button } from "@/components/ui/common/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/common/dropdown-menu"
import { useDynamicDialog } from "@/hooks/ui/use-dynamic-dialog"
import { useRolePermissionFeatureViewer } from "@/hooks/ui/use-role-permission-viewer"
import { StockAdjustment, User } from "@/types"
import { ViewAdjustmentDialog } from "./view-adjustment-dialog"

interface AdjustmentActionsProps {
  stockAdjustment: StockAdjustment
  user?: User
  status?: string
}

export function AdjustmentActions({
  stockAdjustment,
  user,
  status,
}: AdjustmentActionsProps) {
  const { openDialog } = useDynamicDialog()
  const { viewWrapper } = useRolePermissionFeatureViewer()

  const canView = viewWrapper(
    ["Inventory Manager", "Supervisor", "Executive Vice President"],
    ["inventory"],
    [],
    ["read"],
    user,
  )

  const hasApprovePermission = useMemo(
    () => viewWrapper([], ["item_management"], [], ["approve"], user),
    [viewWrapper, user],
  )

  if (!canView) {
    return null
  }

  const handleView = () => {
    openDialog({
      title: "Stock Adjustment Details",
      description: `View details for`,
      children: (
        <ViewAdjustmentDialog
          stockAdjustment={stockAdjustment}
          hasApprovePermission={hasApprovePermission}
          status={status}
        />
      ),
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="size-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleView}>
          <EyeIcon className="mr-2 size-4" />
          <span className="text-xs">View Details</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
