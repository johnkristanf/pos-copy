import { Plus } from "lucide-react"
import { Button } from "@/components/ui/common/button"

interface UsersToolbarProps {
  onCreateNew?: () => void
}

export function UsersToolbar({ onCreateNew }: UsersToolbarProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Button onClick={onCreateNew} variant="bridge_digital">
        <Plus className="h-4 w-4 mr-2" />
        Create User
      </Button>
    </div>
  )
}
