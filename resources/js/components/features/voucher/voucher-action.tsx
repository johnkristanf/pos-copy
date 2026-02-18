import { router } from "@inertiajs/react"
import { Edit, MoreHorizontal, Printer, Trash } from "lucide-react"
import toast from "react-hot-toast"
import { Button } from "@/components/ui/common/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/common/dropdown-menu"
import { API_ROUTES } from "@/config/api-routes"
import { useDynamicDialog } from "@/hooks/ui/use-dynamic-dialog"
import { useRolePermissionFeatureViewer } from "@/hooks/ui/use-role-permission-viewer"
import { User, Voucher } from "@/types"
import { EditVoucherForm } from "./edit-voucher-form"

interface VoucherActionsProps {
  voucher: Voucher
  onActionStart?: (id: number | null) => void
  user?: User
  onPrint?: (voucher: Voucher) => void
}

export function VoucherAction({
  voucher,
  onActionStart,
  user,
  onPrint,
}: VoucherActionsProps) {
  const { openDialog, openConfirmation, closeDialog } = useDynamicDialog()
  const { viewWrapper } = useRolePermissionFeatureViewer()

  const canEdit = viewWrapper([], ["price_and_discount"], [], ["update"], user)
  const canDelete = viewWrapper(
    [],
    ["price_and_discount"],
    [],
    ["delete"],
    user,
  )
  const canPrint = viewWrapper([], ["price_and_discount"], [], ["print"], user)

  const handleEdit = () => {
    openDialog({
      title: "Edit Voucher",
      description: `Update details for ${voucher.code}`,
      children: <EditVoucherForm voucher={voucher} />,
    })
  }

  const handleDeleteVoucher = async () => {
    onActionStart?.(voucher.id)

    await toast.promise(
      new Promise<void>((resolve, reject) => {
        router.delete(API_ROUTES.DELETE_VOUCHER(String(voucher.id)), {
          preserveScroll: true,
          onSuccess: () => {
            closeDialog()
            resolve()
          },
          onError: (errors) => {
            reject(
              new Error(
                (Object.values(errors)[0] as string) ||
                  "Failed to delete voucher",
              ),
            )
          },
          onFinish: () => {
            onActionStart?.(null)
          },
        })
      }),
      {
        loading: <span className="animate-pulse">Deleting voucher...</span>,
        success: "Voucher deleted successfully!",
        error: (error) => error.message || "Failed to delete voucher",
      },
    )
  }

  const handleConfirmDeleteVoucher = () => {
    openConfirmation({
      title: "Delete Voucher",
      description: `Are you sure you want to delete this voucher (${voucher.code})? This cannot be undone.`,
      type: "warning",
      onConfirm: handleDeleteVoucher,
      confirmText: "Confirm",
      cancelText: "Cancel",
    })
  }

  if (!canEdit && !canDelete && !canPrint) {
    return null
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
        {canEdit && (
          <DropdownMenuItem onClick={handleEdit}>
            <Edit className="mr-2 size-4" />
            <span className="text-xs">Edit Voucher</span>
          </DropdownMenuItem>
        )}

        {canPrint && onPrint && (
          <DropdownMenuItem onClick={() => onPrint(voucher)}>
            <Printer className="mr-2 size-4" />
            <span className="text-xs">Print</span>
          </DropdownMenuItem>
        )}

        {canDelete && (
          <DropdownMenuItem
            onClick={handleConfirmDeleteVoucher}
            className="text-destructive"
          >
            <Trash className="mr-2 size-4" />
            <span className="text-xs">Delete Voucher</span>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
