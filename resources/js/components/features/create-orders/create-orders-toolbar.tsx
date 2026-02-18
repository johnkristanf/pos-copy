import {
  ClipboardList,
  // Filter,
  // ShoppingCartIcon,
  Trash2,
  // X,
} from "lucide-react"
import { Button } from "@/components/ui/common/button"
import { useDynamicDialog } from "@/hooks/ui/use-dynamic-dialog"
import { useRolePermissionFeatureViewer } from "@/hooks/ui/use-role-permission-viewer"
import { Category, Location, User } from "@/types"
import { DraftOrders } from "./draft-order"
import { useCreateOrderActions } from "./use-create-order-store"

interface CreateOrdersToolbarProps {
  categories: Category[]
  locations: Location[]
  isSalesOfficer?: boolean
  hasSelectedItems?: boolean
  selectedCount?: number
  user: User
}

export const CreateOrdersToolbar = ({
  // categories,
  // locations,
  // isSalesOfficer,
  hasSelectedItems,
  selectedCount = 0,
  user,
}: CreateOrdersToolbarProps) => {
  const { resetSelection } = useCreateOrderActions()
  const { openDialog } = useDynamicDialog()
  const { viewWrapper } = useRolePermissionFeatureViewer()

  const canViewDrafts = viewWrapper(
    ["Sales Officer"],
    ["create_order"],
    [],
    ["read", "create", "update"],
    user,
  )

  const handleOpenDrafts = () => {
    openDialog({
      title: "Draft Orders",
      description: "Select a draft to resume working on it.",
      children: <DraftOrders />,
      dialogClassName: "sm:max-w-[600px] p-0 overflow-hidden",
    })
  }

  return (
    <div className="flex items-center gap-2 flex-wrap w-full p-0.5">
      <div className="ml-auto flex items-center gap-1">
        {hasSelectedItems && (
          <div className="flex items-center gap-2 mr-2 animate-in fade-in zoom-in-95 duration-200">
            <span className="text-xs font-medium text-muted-foreground whitespace-nowrap hidden sm:inline-block bg-muted/50 px-2 py-1 rounded-md">
              {selectedCount} selected
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={resetSelection}
              className="h-9 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20 border-dashed bg-transparent shadow-none"
            >
              <Trash2 className="size-4" />
              Clear
            </Button>
            <div className="h-4 w-px bg-border mx-1 hidden sm:block" />
          </div>
        )}

        {canViewDrafts && (
          <Button
            variant="outline"
            size="sm"
            className="h-9 gap-2 shadow-sm bg-background"
            onClick={handleOpenDrafts}
          >
            <ClipboardList className="size-4 text-muted-foreground" />
            <span className="hidden sm:inline">Drafts</span>
          </Button>
        )}
      </div>
    </div>
  )
}
