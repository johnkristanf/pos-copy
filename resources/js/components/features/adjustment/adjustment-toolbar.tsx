import { Download, Plus, RefreshCcw } from "lucide-react"
import { Button } from "@/components/ui/common/button"
import { useRolePermissionFeatureViewer } from "@/hooks/ui/use-role-permission-viewer"
import { User } from "@/types"

interface AdjustmentToolbarProps {
  onCreateNew?: () => void
  user: User
  onExport?: () => void
}

export function AdjustmentToolbar({
  onCreateNew,
  user,
  onExport,
}: AdjustmentToolbarProps) {
  const { viewWrapper } = useRolePermissionFeatureViewer()

  const canCreate = viewWrapper(
    ["Inventory Manager"],
    ["inventory"],
    [],
    ["create"],
    user,
  )

  const canExport = viewWrapper(
    ["Inventory Manager"],
    ["inventory"],
    [],
    ["print"],
    user,
  )

  return (
    <div className="flex justify-between">
      <div className="flex gap-2">
        <Button variant={"outline"} onClick={() => window.location.reload()}>
          <RefreshCcw className="mr-2 h-4 w-4" /> Refresh
        </Button>

        {canExport && (
          <Button variant={"outline"} onClick={onExport}>
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
        )}

        {canCreate && (
          <Button onClick={onCreateNew} variant={"bridge_digital"}>
            <Plus className="mr-2 h-4 w-4" /> Create Adjustment
          </Button>
        )}
      </div>
    </div>
  )
}
