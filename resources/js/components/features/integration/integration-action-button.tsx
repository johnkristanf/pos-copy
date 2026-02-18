import { Edit2Icon, KeyRound, Link, Trash2Icon } from "lucide-react"
import { Button } from "@/components/ui/common/button"
import { Separator } from "@/components/ui/common/separator"

interface IntegrationActionButtonProps {
  status: string
  onEdit: () => void
  onKeys: () => void
  onConnect: () => void
  onDelete: () => void
}

export const IntegrationActionButton = ({
  status,
  onEdit,
  onKeys,
  onConnect,
  onDelete,
}: IntegrationActionButtonProps) => {
  if (status === "active") {
    return (
      <>
        <Separator />
        <div className="flex flex-row justify-start gap-2 -mb-2">
          <Button
            variant="bridge_digital"
            size="sm"
            onClick={onKeys}
            className="text-xs h-7 px-2"
          >
            <KeyRound className="w-3 h-3" />
            <span className="hidden sm:inline">Keys</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
            className="text-xs h-7 px-2"
          >
            <Edit2Icon className="w-3 h-3" />
            <span className="hidden sm:inline">Edit</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onDelete}
            className="text-xs h-7 px-2"
          >
            <Trash2Icon className="w-3 h-3" />
            <span className="hidden sm:inline">Delete</span>
          </Button>
        </div>
      </>
    )
  }

  if (status === "inactive") {
    return (
      <>
        <Separator />
        <div className="flex flex-row justify-start gap-2 -mb-2">
          <Button
            variant="bridge_digital"
            size="sm"
            onClick={onConnect}
            className="text-xs h-7 px-2"
          >
            <Link className="w-3 h-3" />
            <span className="hidden sm:inline">Connect</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
            className="text-xs h-7 px-2"
          >
            <Edit2Icon className="w-3 h-3" />
            <span className="hidden sm:inline">Edit</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onDelete}
            className="text-xs h-7 px-2"
          >
            <Trash2Icon className="w-3 h-3" />
            <span className="hidden sm:inline">Delete</span>
          </Button>
        </div>
      </>
    )
  }

  return null
}
