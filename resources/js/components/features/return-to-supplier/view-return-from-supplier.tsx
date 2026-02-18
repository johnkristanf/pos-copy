import { useForm } from "@inertiajs/react"
import {
  Calendar,
  CheckCircle,
  FileText,
  Package,
  Ruler,
  Tag,
  Truck,
  User as UserIcon,
  XCircle,
} from "lucide-react"
import toast from "react-hot-toast"
import { Badge } from "@/components/ui/common/badge"
import { Button } from "@/components/ui/common/button"
import { Card, CardContent } from "@/components/ui/common/card"
import { Separator } from "@/components/ui/common/separator"
import { API_ROUTES } from "@/config/api-routes"
import { useDynamicDialog } from "@/hooks/ui/use-dynamic-dialog"
import { catchError } from "@/lib/catch-error"
import { formatDate } from "@/lib/format"
import {
  ReturnStatus,
  ReturnType,
  statusConfigMap,
  typeConfigMap,
} from "@/lib/status-config"
import { ReturnToSupplier } from "@/types"

interface ViewReturnToSupplierProps {
  returnItem: ReturnToSupplier
  hasApprovePermission: boolean
  status: string
}

export function ViewReturnToSupplier({
  returnItem,
  hasApprovePermission,
  status,
}: ViewReturnToSupplierProps) {
  const checkForm = useForm({})
  const approveForm = useForm({})
  const rejectForm = useForm({})
  const { closeDialog } = useDynamicDialog()

  const statusConfig =
    statusConfigMap[returnItem.status as ReturnStatus] ||
    statusConfigMap.default

  const typeConfig =
    typeConfigMap[returnItem.type as ReturnType] ||
    typeConfigMap[ReturnType.Replacement]

  const StatusIcon = statusConfig.icon

  const handleCheck = () => {
    const checkPromise = new Promise<void>((resolve, reject) => {
      checkForm.patch(API_ROUTES.CHECK_RETURN_TO_SUPPLIER(returnItem.id).url, {
        preserveScroll: true,
        onSuccess: () => {
          checkForm.reset()
          closeDialog()
          resolve()
        },
        onError: (errors) => {
          reject(
            new Error(
              (Object.values(errors)[0] as string) || "Failed to check return",
            ),
          )
        },
      })
    })

    toast.promise(checkPromise, {
      loading: <span className="animate-pulse">Checking return...</span>,
      success: "Return checked successfully!",
      error: (error) => catchError(error),
    })
  }

  const handleApprove = () => {
    const approvePromise = new Promise<void>((resolve, reject) => {
      approveForm.patch(
        API_ROUTES.APPROVE_RETURN_TO_SUPPLIER(returnItem.id).url,
        {
          preserveScroll: true,
          onSuccess: () => {
            approveForm.reset()
            closeDialog()
            resolve()
          },
          onError: (errors) => {
            reject(
              new Error(
                (Object.values(errors)[0] as string) ||
                  "Failed to approve return",
              ),
            )
          },
        },
      )
    })

    toast.promise(approvePromise, {
      loading: <span className="animate-pulse">Approving return...</span>,
      success: "Return approved successfully!",
      error: (error) => catchError(error),
    })
  }

  const handleReject = () => {
    const rejectPromise = new Promise<void>((resolve, reject) => {
      rejectForm.patch(
        API_ROUTES.REJECT_RETURN_TO_SUPPLIER(returnItem.id).url,
        {
          preserveScroll: true,
          onSuccess: () => {
            rejectForm.reset()
            closeDialog()
            resolve()
          },
          onError: (errors) => {
            reject(
              new Error(
                (Object.values(errors)[0] as string) ||
                  "Failed to reject return",
              ),
            )
          },
        },
      )
    })

    toast.promise(rejectPromise, {
      loading: <span className="animate-pulse">Rejecting return...</span>,
      success: "Return rejected successfully!",
      error: (error) => catchError(error),
    })
  }

  const isForChecking = returnItem.status === ReturnStatus.ForChecking
  const isForApproval = returnItem.status === ReturnStatus.ForApproval

  const showAction =
    hasApprovePermission &&
    (isForChecking || isForApproval) &&
    status !== "rejected" &&
    status !== "approved"

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center size-10 rounded-full bg-primary/10 text-primary">
                  <FileText className="size-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold font-mono">
                    Return #{returnItem.id}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Calendar className="size-3" />
                    <span>Created: {formatDate(returnItem.created_at)}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge
                  variant={typeConfig.variant}
                  className={`gap-1.5 pl-1.5 pr-2.5 ${typeConfig.className}`}
                >
                  <Tag className="size-3.5" />
                  <span className="capitalize">{typeConfig.label}</span>
                </Badge>
                <Badge
                  variant={statusConfig.variant}
                  className={`gap-1.5 pl-1.5 pr-2.5 ${statusConfig.className}`}
                >
                  <StatusIcon className="size-3.5" />
                  <span className="capitalize">{statusConfig.label}</span>
                </Badge>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Supplier Details */}
              <div className="space-y-1.5">
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Supplier
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center size-8 rounded-full bg-primary/10 text-primary">
                    <Truck className="size-4" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">
                      {returnItem.supplier?.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Supplier ID: {returnItem.supplier_id}
                    </div>
                  </div>
                </div>
              </div>

              {/* Prepared By */}
              <div className="space-y-1.5">
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Prepared By
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center size-8 rounded-full bg-muted">
                    <UserIcon className="size-4" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">
                      {returnItem.prepared_by?.first_name}{" "}
                      {returnItem.prepared_by?.last_name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      User ID: {returnItem.prepared_by?.id}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Remarks */}
            {returnItem.remarks && (
              <div className="space-y-1.5">
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Remarks
                </div>
                <div className="flex items-start">
                  <Badge
                    variant="outline"
                    className="border-dashed text-foreground bg-muted/30 px-3 py-1 font-medium"
                  >
                    {returnItem.remarks}
                  </Badge>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {showAction && (
              <>
                <Separator />
                <div className="flex flex-col sm:flex-row gap-3 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleReject}
                    disabled={rejectForm.processing}
                    className="gap-2"
                  >
                    <XCircle className="size-4" />
                    Reject
                  </Button>

                  {isForChecking && (
                    <Button
                      type="button"
                      variant="bridge_digital"
                      onClick={handleCheck}
                      disabled={checkForm.processing}
                      className="gap-2"
                    >
                      <CheckCircle className="size-4" />
                      Check
                    </Button>
                  )}

                  {isForApproval && (
                    <Button
                      type="button"
                      variant="bridge_digital"
                      onClick={handleApprove}
                      disabled={approveForm.processing}
                      className="gap-2"
                    >
                      <CheckCircle className="size-4" />
                      Approve
                    </Button>
                  )}
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Items List Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary shrink-0" />
            <h4 className="font-semibold text-sm sm:text-base">
              Returned Items
            </h4>
            <Badge variant="secondary" className="ml-1 text-xs rounded-full">
              {returnItem.items?.length || 0}
            </Badge>
          </div>
        </div>

        <Card>
          <div className="relative w-full overflow-x-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b">
                <tr className="border-b transition-colors hover:bg-muted/50">
                  <th className="h-10 px-2 text-left align-middle font-medium text-muted-foreground text-xs">
                    SKU
                  </th>
                  <th className="h-10 px-2 text-left align-middle font-medium text-muted-foreground text-xs">
                    Item
                  </th>
                  <th className="h-10 px-2 text-left align-middle font-medium text-muted-foreground text-xs">
                    Brand
                  </th>
                  <th className="h-10 px-2 text-left align-middle font-medium text-muted-foreground text-xs">
                    Size / Color
                  </th>
                  <th className="h-10 px-2 text-center align-middle font-medium text-muted-foreground text-xs">
                    Qty
                  </th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {returnItem.items && returnItem.items.length > 0 ? (
                  returnItem.items.map((item: any) => {
                    const quantity = item.pivot?.quantity || 0

                    return (
                      <tr
                        key={item.id}
                        className="border-b transition-colors hover:bg-muted/50"
                      >
                        <td className="p-2 align-middle font-mono text-xs text-muted-foreground whitespace-nowrap">
                          {item.sku}
                        </td>
                        <td className="p-2 align-middle font-medium text-sm">
                          {item.description}
                        </td>
                        <td className="p-2 align-middle text-xs">
                          {item.brand || "—"}
                        </td>
                        <td className="p-2 align-middle">
                          <div className="flex items-center gap-1.5 text-xs">
                            {item.size && (
                              <span className="inline-flex items-center gap-1">
                                <Ruler className="size-3 text-muted-foreground" />
                                <span>{item.size}</span>
                              </span>
                            )}
                            {item.size && item.color && (
                              <span className="text-muted-foreground">•</span>
                            )}
                            {item.color && (
                              <span className="inline-flex items-center gap-1">
                                <div
                                  className="size-3 rounded-full border border-gray-300"
                                  style={{ backgroundColor: item.color }}
                                />
                                <span className="capitalize">{item.color}</span>
                              </span>
                            )}
                            {!item.size && !item.color && (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </div>
                        </td>
                        <td className="p-2 align-middle text-center">
                          <Badge
                            variant="outline"
                            className="font-mono text-xs"
                          >
                            {quantity}
                          </Badge>
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="p-4 text-center text-muted-foreground text-xs"
                    >
                      No items found in this return.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  )
}
