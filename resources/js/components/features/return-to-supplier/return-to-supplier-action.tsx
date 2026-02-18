import { Eye, MoreHorizontal, Printer } from "lucide-react"
import { Button } from "@/components/ui/common/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/common/dropdown-menu"
import { useDynamicDialog } from "@/hooks/ui/use-dynamic-dialog"
import { ReturnToSupplier } from "@/types"
import { ViewReturnToSupplier } from "./view-return-from-supplier"
import { ReturnToSupplierPrint } from "./return-to-supplier-print"

interface ReturnToSupplierActionProps {
  returnItem: ReturnToSupplier
  hasApprovePermission: boolean
  hasPrintPermission: boolean
  status: string
}

export function ReturnToSupplierAction({
  returnItem,
  hasApprovePermission,
  hasPrintPermission,
  status,
}: ReturnToSupplierActionProps) {
  const { openDialog } = useDynamicDialog()

  const handleView = () => {
    openDialog({
      title: "View Return To Supplier",
      description: `Return to ${returnItem.supplier?.name}`,
      children: (
        <ViewReturnToSupplier
          returnItem={returnItem}
          hasApprovePermission={hasApprovePermission}
          status={status}
        />
      ),
      dialogClass: "sm:max-w-lg",
    })
  }

  const handlePrint = () => {
    openDialog({
      title: "Print Return to Supplier",
      description: `Generate return slip for ${returnItem.supplier?.name}`,
      children: <ReturnToSupplierPrint returnItem={returnItem} />,
      dialogClass: "sm:max-w-4xl",
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="size-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={handleView}>
          <Eye className="mr-2 size-4" />
          <span className="text-xs">View Return</span>
        </DropdownMenuItem>

        {hasPrintPermission && (
          <DropdownMenuItem onClick={handlePrint}>
            <Printer className="mr-2 size-4" />
            <span className="text-xs">Print Return</span>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
