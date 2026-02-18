import { Download, Plus } from "lucide-react"
import { Button } from "@/components/ui/common/button"
import { useRolePermissionFeatureViewer } from "@/hooks/ui/use-role-permission-viewer"
import { User } from "@/types"

interface ReturnToolbarProps {
  onCreateNew?: () => void
  onExport?: () => void
  isOnReturnToCustomer?: boolean
  isOnReturnToSupplier?: boolean
  user?: User
}

export function ReturnToolbar({
  onCreateNew,
  onExport,
  isOnReturnToCustomer,
  isOnReturnToSupplier,
  user,
}: ReturnToolbarProps) {
  const { viewWrapper } = useRolePermissionFeatureViewer()

  const featureTag = isOnReturnToCustomer
    ? "return_from_customer"
    : isOnReturnToSupplier
      ? "return_to_supplier"
      : "returns"

  const canCreate = viewWrapper([], [featureTag], [], ["create"], user)
  const canExport = viewWrapper([], [featureTag], [], ["print"], user)

  const getLabel = () => {
    if (isOnReturnToCustomer) return "Return From Customer"
    if (isOnReturnToSupplier) return "Return to Supplier"
    return "Create Return"
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {canExport && (
        <Button onClick={onExport} variant="outline">
          <Download className="size-3 mr-2" />
          Export
        </Button>
      )}

      {canCreate && (
        <Button onClick={onCreateNew} variant="bridge_digital">
          <Plus className="size-3" />
          {getLabel()}
        </Button>
      )}
    </div>
  )
}
