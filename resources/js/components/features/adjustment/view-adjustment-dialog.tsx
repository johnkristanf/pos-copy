import { useForm } from "@inertiajs/react"
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Calendar,
  CheckCircle,
  Hash,
  MapPin,
  Package,
  Tag,
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
import { getCategoryIcon } from "@/components/ui/common/get-category-icon"
import { getLocationIcon } from "@/components/ui/common/get-stock-location-icon"
import { StockAdjustment } from "@/types"

interface ViewAdjustmentDialogProps {
  stockAdjustment: StockAdjustment
  hasApprovePermission?: boolean
  status?: string
}

export function ViewAdjustmentDialog({
  stockAdjustment,
  hasApprovePermission,
  status,
}: ViewAdjustmentDialogProps) {
  const checkForm = useForm({})
  const approveForm = useForm({})
  const rejectForm = useForm({})
  const { closeDialog } = useDynamicDialog()

  const handleCheck = () => {
    const checkPromise = new Promise<void>((resolve, reject) => {
      checkForm.post(
        API_ROUTES.SET_CHECKED_STOCK_ADJUSTMENT(String(stockAdjustment.id)),
        {
          preserveScroll: true,
          onSuccess: () => {
            checkForm.reset()
            closeDialog()
            resolve()
          },
          onError: (errors) => {
            reject(
              new Error(
                (Object.values(errors)[0] as string) ||
                  "Failed to check adjustment",
              ),
            )
          },
        },
      )
    })

    toast.promise(checkPromise, {
      loading: <span className="animate-pulse">Checking adjustment...</span>,
      success: "Adjustment checked successfully!",
      error: (error) => catchError(error),
    })
  }

  const handleApprove = () => {
    const approvePromise = new Promise<void>((resolve, reject) => {
      approveForm.post(
        API_ROUTES.APPROVE_STOCK_ADJUSTMENT(String(stockAdjustment.id)),
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
                  "Failed to approve adjustment",
              ),
            )
          },
        },
      )
    })

    toast.promise(approvePromise, {
      loading: <span className="animate-pulse">Approving adjustment...</span>,
      success: "Adjustment approved successfully!",
      error: (error) => catchError(error),
    })
  }

  const handleReject = () => {
    const rejectPromise = new Promise<void>((resolve, reject) => {
      rejectForm.post(
        API_ROUTES.REJECT_STOCK_ADJUSTMENT(String(stockAdjustment.id)),
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
                  "Failed to reject adjustment",
              ),
            )
          },
        },
      )
    })

    toast.promise(rejectPromise, {
      loading: <span className="animate-pulse">Rejecting adjustment...</span>,
      success: "Adjustment rejected successfully!",
      error: (error) => catchError(error),
    })
  }

  const isForChecking = stockAdjustment.status === "for_checking"
  const isForApproval = stockAdjustment.status === "for_approval"
  const showAction =
    hasApprovePermission &&
    (isForChecking || isForApproval) &&
    status !== "rejected" &&
    status !== "approved"

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
              <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Package className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              </div>
              <div className="flex-1 w-full sm:w-auto">
                <h3 className="text-base sm:text-lg font-semibold wrap-break-word">
                  {stockAdjustment.item.description}
                </h3>
                <div className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground mt-1">
                  <Tag className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
                  <span>SKU: {stockAdjustment.item.sku}</span>
                </div>
              </div>
              <Badge
                variant={
                  stockAdjustment.status === "for_checking"
                    ? "secondary"
                    : stockAdjustment.status === "for_approval"
                      ? "default"
                      : stockAdjustment.status === "approved"
                        ? "default"
                        : "destructive"
                }
                className="capitalize self-start sm:self-center"
              >
                {stockAdjustment.status.replace(/_/g, " ")}
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-3 sm:pt-4 border-t">
              <div className="flex items-start gap-2">
                <div className="min-w-0">
                  <div className="text-xs text-muted-foreground">Brand</div>
                  <div className="font-medium mt-1 text-xs sm:text-sm">
                    {stockAdjustment.item.brand || "—"}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <div className="min-w-0">
                  <div className="text-xs text-muted-foreground">Category</div>
                  <div className="font-medium mt-1">
                    <Badge
                      variant="outline"
                      className="gap-1.5 font-normal text-xs"
                    >
                      {getCategoryIcon(
                        stockAdjustment.item.category?.name || "",
                      )}
                      <span className="capitalize">
                        {stockAdjustment.item.category?.name || ""}
                      </span>
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <div className="min-w-0">
                  <div className="text-xs text-muted-foreground">
                    Attributes
                  </div>
                  <div className="font-medium mt-1 flex flex-wrap gap-1">
                    {stockAdjustment.item.size && (
                      <Badge
                        variant="secondary"
                        className="gap-1.5 font-normal text-xs"
                      >
                        <span>{stockAdjustment.item.size}</span>
                      </Badge>
                    )}
                    {stockAdjustment.item.color && (
                      <Badge
                        variant="secondary"
                        className="gap-1.5 font-normal text-xs"
                      >
                        <div
                          className="size-3 rounded-full border border-gray-300"
                          style={{
                            backgroundColor: stockAdjustment.item.color,
                          }}
                        />
                        <span className="capitalize">
                          {stockAdjustment.item.color}
                        </span>
                      </Badge>
                    )}
                    {!stockAdjustment.item.size &&
                      !stockAdjustment.item.color && (
                        <span className="text-muted-foreground text-xs sm:text-sm">
                          —
                        </span>
                      )}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <div className="min-w-0">
                  <div className="text-xs text-muted-foreground">
                    Date Created
                  </div>
                  <div className="font-medium text-xs mt-1 flex items-center gap-1.5">
                    <Calendar className="h-3 w-3 shrink-0" />
                    {formatDate(stockAdjustment.created_at) || "—"}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <div className="min-w-0">
                  <div className="text-xs text-muted-foreground">
                    Prepared By
                  </div>
                  <div className="font-medium mt-1 text-xs sm:text-sm">
                    {stockAdjustment.preparer?.name || "—"}
                  </div>
                </div>
              </div>

              {stockAdjustment.checker && (
                <div className="flex items-start gap-2">
                  <div className="min-w-0">
                    <div className="text-xs text-muted-foreground">
                      Checked By
                    </div>
                    <div className="font-medium mt-1 text-xs sm:text-sm">
                      {stockAdjustment.checker?.name || "—"}
                    </div>
                  </div>
                </div>
              )}

              {stockAdjustment.approver && (
                <div className="flex items-start gap-2">
                  <div className="min-w-0">
                    <div className="text-xs text-muted-foreground">
                      Approved By
                    </div>
                    <div className="font-medium mt-1 text-xs sm:text-sm">
                      {stockAdjustment.approver?.name || "—"}
                    </div>
                  </div>
                </div>
              )}

              {stockAdjustment.rejecter && (
                <div className="flex items-start gap-2">
                  <div className="min-w-0">
                    <div className="text-xs text-muted-foreground">
                      Rejected By
                    </div>
                    <div className="font-medium mt-1 text-xs sm:text-sm">
                      {stockAdjustment.rejecter?.name || "—"}
                    </div>
                  </div>
                </div>
              )}
            </div>

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

      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="space-y-4">
            <h4 className="font-semibold text-sm sm:text-base flex items-center gap-2">
              <Hash className="h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0" />
              Adjustment Details
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  {stockAdjustment.action === "increase" ? (
                    <ArrowUpCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <ArrowDownCircle className="h-5 w-5 text-red-600" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="text-xs text-muted-foreground">Action</div>
                  <div
                    className={`font-semibold mt-1 text-sm capitalize ${
                      stockAdjustment.action === "increase"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {stockAdjustment.action}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Hash className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs text-muted-foreground">Quantity</div>
                  <div className="font-semibold mt-1 text-sm">
                    {stockAdjustment.quantity}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs text-muted-foreground">Location</div>
                  <div className="font-medium mt-1 flex items-center gap-1.5 text-sm">
                    {getLocationIcon(stockAdjustment.stock_location?.name)}
                    <span className="capitalize">
                      {stockAdjustment.stock_location?.name || "—"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
