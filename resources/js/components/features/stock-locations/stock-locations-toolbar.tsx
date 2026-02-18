import { Plus, RefreshCcw } from "lucide-react"
import { Button } from "@/components/ui/common/button"
import { useRolePermissionFeatureViewer } from "@/hooks/ui/use-role-permission-viewer"
import { User } from "@/types"

interface StockLocationsToolbarProps {
  onCreateNew?: () => void
  user: User
}

export function StockLocationsToolbar({
  onCreateNew,
  user,
}: StockLocationsToolbarProps) {
  const { viewWrapper } = useRolePermissionFeatureViewer()

  const canCreate = viewWrapper([], ["tenant_management"], [], ["create"], user)

  return (
    <div className="flex justify-between">
      <div className="flex gap-2">
        <Button variant={"outline"} onClick={() => window.location.reload()}>
          <RefreshCcw className="size-4" /> Refresh
        </Button>

        {canCreate && (
          <Button onClick={onCreateNew} variant={"bridge_digital"}>
            <Plus className="mr-2 h-4 w-4" /> Create Store
          </Button>
        )}
      </div>
    </div>
  )
}
