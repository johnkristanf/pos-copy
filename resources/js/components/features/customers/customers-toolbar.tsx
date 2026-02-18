import { Download, Plus } from "lucide-react"
import { Button } from "@/components/ui/common/button"
import { useRolePermissionFeatureViewer } from "@/hooks/ui/use-role-permission-viewer"
import { Customer, User } from "@/types"

interface CustomersToolbarProps {
  onCreateNew?: () => void
  onExport?: () => void
  user: User
  customers?: Customer[]
}

export function CustomersToolbar({
  onCreateNew,
  onExport,
  user,
  customers,
}: CustomersToolbarProps) {
  const { viewWrapper } = useRolePermissionFeatureViewer()

  const canCreate = viewWrapper([], ["customer_profile"], [], ["create"], user)
  const canExport = viewWrapper([], ["customer_profile"], [], ["print"], user)

  return (
    <div className="flex items-center gap-2 flex-wrap justify-between w-full sm:w-auto">
      <div className="flex items-center gap-2">
        {canExport && (
          <Button
            variant="outline"
            onClick={onExport}
            disabled={!customers || customers.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        )}

        {canCreate && (
          <Button onClick={onCreateNew} variant="bridge_digital">
            <Plus className="h-4 w-4 mr-2" />
            Create Customer
          </Button>
        )}
      </div>
    </div>
  )
}
