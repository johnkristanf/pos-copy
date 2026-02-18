import { Plus, RefreshCcw } from "lucide-react"
import { Button } from "@/components/ui/common/button"
import { useRolePermissionFeatureViewer } from "@/hooks/ui/use-role-permission-viewer"
import { User } from "@/types"

interface SupplierToolbarProps {
  onCreateNew?: () => void
  user: User
}

export function SupplierToolbar({ onCreateNew, user }: SupplierToolbarProps) {
  const { viewWrapper } = useRolePermissionFeatureViewer()
  const canCreate = viewWrapper(
    [],
    ["return_to_supplier"],
    [],
    ["create"],
    user,
  )

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Button variant={"outline"} onClick={() => window.location.reload()}>
        <RefreshCcw className="size-4" /> Refresh
      </Button>
      {canCreate && (
        <Button onClick={onCreateNew} variant="bridge_digital">
          <Plus className="h-4 w-4 mr-2" />
          Create Supplier
        </Button>
      )}
    </div>
  )
}
