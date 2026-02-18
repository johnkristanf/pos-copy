import { Download, Plus, RefreshCcw } from "lucide-react"
import { Button } from "@/components/ui/common/button"
import { useRolePermissionFeatureViewer } from "@/hooks/ui/use-role-permission-viewer"
import { User } from "@/types"

interface VoidReasonToolbarProps {
  onCreateNew?: () => void
  user: User
  onExport?: () => void
}

export function VoidReasonToolbar({
  onCreateNew,
  user,
  onExport,
}: VoidReasonToolbarProps) {
  const { viewWrapper } = useRolePermissionFeatureViewer()

  const canCreate = viewWrapper(
    [],
    [
      "price_and_discount",
      "override_order_wholesale_discount",
      "item_wholesale_discount",
    ],
    [],
    ["create"],
    user,
  )

  return (
    <div className="flex justify-between">
      <div className="flex gap-2">
        <Button variant={"outline"} onClick={() => window.location.reload()}>
          <RefreshCcw className="size-4" /> Refresh
        </Button>

        <Button variant={"outline"} onClick={onExport}>
          <Download className="mr-2 h-4 w-4" /> Export
        </Button>

        {canCreate && (
          <Button onClick={onCreateNew} variant={"bridge_digital"}>
            <Plus className="mr-2 h-4 w-4" /> Create Void Reason
          </Button>
        )}
      </div>
    </div>
  )
}
