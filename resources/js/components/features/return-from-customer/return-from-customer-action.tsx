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
import { ReturnFromCustomer } from "@/types"
import { ReturnFromCustomerPrint } from "./return-from-customer-print"
import { ViewReturnFromCustomer } from "./view-return-from-customer"

interface ReturnFromCustomerActionProps {
  returnItem: ReturnFromCustomer
  hasApprovePermission: boolean
  hasPrintPermission: boolean
  status: string
}

export function ReturnFromCustomerAction({
  returnItem,
  hasApprovePermission,
  hasPrintPermission,
  status,
}: ReturnFromCustomerActionProps) {
  const { openDialog } = useDynamicDialog()

  const handleView = () => {
    openDialog({
      title: "View Return From Customer",
      description: `Return #${returnItem.invoice_number}`,
      children: (
        <ViewReturnFromCustomer
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
      title: "Print Return Slip",
      description: `Preview for Return #${returnItem.invoice_number}`,
      children: <ReturnFromCustomerPrint returnItem={returnItem} />,
      dialogClass: "sm:max-w-3xl",
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
