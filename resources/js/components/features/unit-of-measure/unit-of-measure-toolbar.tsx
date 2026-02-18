import { Plus, RefreshCcw } from "lucide-react"
import { Button } from "@/components/ui/common/button"
import { useRolePermissionFeatureViewer } from "@/hooks/ui/use-role-permission-viewer"
import { User } from "@/types"

interface UnitOfMeasureToolbarProps {
  onCreateNew?: () => void
  user: User
}

export const UnitOfMeasureToolbar = ({
  onCreateNew,
  user,
}: UnitOfMeasureToolbarProps) => {
  const { viewWrapper } = useRolePermissionFeatureViewer()

  const canCreate = viewWrapper([], ["item_management"], [], ["create"], user)

  if (!canCreate) {
    return null
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Button variant={"outline"} onClick={() => window.location.reload()}>
        <RefreshCcw className="size-4" /> Refresh
      </Button>
      <Button onClick={onCreateNew} variant="bridge_digital">
        <Plus className="size-4" />
        Create Unit of Measure
      </Button>
    </div>
  )
}
