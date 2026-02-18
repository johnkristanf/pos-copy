import { useForm } from "@inertiajs/react"
import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import { FileWarning, Loader2, LockKeyhole, ShieldAlert } from "lucide-react"
import { FormEventHandler, useState } from "react"
import toast from "react-hot-toast"
import { Button } from "@/components/ui/common/button"
import { Label } from "@/components/ui/common/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/common/select"
import { Input } from "@/components/ui/inputs/input"
import { API_ROUTES } from "@/config/api-routes"
import { useDynamicDialog } from "@/hooks/ui/use-dynamic-dialog"
import { VoidReason } from "@/types"

interface OverrideVoidOrderFormProps {
  orderId: number
  onSuccess?: () => void
  onCancel?: () => void
}

export const OverrideVoidOrderForm = ({
  orderId,
  onSuccess,
  onCancel,
}: OverrideVoidOrderFormProps) => {
  const [isOverrideRequired, setIsOverrideRequired] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const { closeDialog } = useDynamicDialog()

  const { data: voidReasons, isLoading: isLoadingReasons } = useQuery({
    queryKey: ["void-reasons"],
    queryFn: async () => {
      const res = await axios.get(API_ROUTES.CREATE_VOID_REASON)
      return (res.data?.voidReasons?.data as VoidReason[]) || []
    },
  })

  const { data, setData, post, processing, errors, clearErrors } = useForm({
    order_id: orderId,
    void_id: "",
    email: "",
    password: "",
    override_email: "",
    override_password: "",
  })

  const selectedReason = voidReasons?.find(
    (r) => r.id.toString() === data.void_id,
  )
  const isPasswordRequired = selectedReason?.require_password

  const handleSubmit: FormEventHandler = (e) => {
    e.preventDefault()
    clearErrors()
    setErrorMessage(null)

    post(API_ROUTES.VOID_ORDER, {
      preserveScroll: true,
      onSuccess: () => {
        toast.success("Order voided successfully")
        onSuccess?.()
        closeDialog()
      },
      onError: (err: any) => {
        const errorMsg = err.error || Object.values(err).join(" ")

        if (
          errorMsg.toLowerCase().includes("permission") ||
          errorMsg.toLowerCase().includes("override")
        ) {
          if (!isOverrideRequired && isPasswordRequired) {
            setIsOverrideRequired(true)
            setErrorMessage(errorMsg)
          } else {
            toast.error("Authorization failed.")
          }
        } else {
          toast.error("Failed to void order.")
          closeDialog()
        }
      },
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* Permission Denied Alert */}
      {isOverrideRequired && (
        <div className="flex items-start gap-3 rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive animate-in fade-in slide-in-from-top-2">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" />
          <div className="flex flex-col gap-1">
            <p className="font-semibold leading-none">Permission Denied</p>
            <p className="text-destructive/90">
              {errorMessage ||
                "This action requires authorization from an EVP or Purchasing Head."}
            </p>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {/* Void Reason Selection */}
        <div className="space-y-2">
          <Label>Reason for Voiding</Label>
          <Select
            value={data.void_id}
            onValueChange={(val) => {
              setData("void_id", val)
              if (isOverrideRequired) {
                setIsOverrideRequired(false)
                setErrorMessage(null)
              }
            }}
            disabled={processing || isOverrideRequired}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a reason" />
            </SelectTrigger>
            <SelectContent>
              {isLoadingReasons ? (
                <div className="flex h-24 items-center justify-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-xs">Loading reasons...</span>
                </div>
              ) : voidReasons?.length === 0 ? (
                <div className="flex h-24 flex-col items-center justify-center gap-2 p-2 text-muted-foreground">
                  <FileWarning className="h-6 w-6 opacity-50" />
                  <span className="text-xs">No void reasons available</span>
                </div>
              ) : (
                voidReasons?.map((reason) => (
                  <SelectItem key={reason.id} value={reason.id.toString()}>
                    <div className="flex items-center gap-2">
                      {reason.void_reason}
                      {reason.require_password && (
                        <LockKeyhole className="h-3 w-3 text-muted-foreground/70" />
                      )}
                    </div>
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          {errors.void_id && (
            <p className="text-[0.8rem] font-medium text-destructive">
              {errors.void_id}
            </p>
          )}
        </div>

        {/* User Credentials (if reason requires password) */}
        {isPasswordRequired && !isOverrideRequired && (
          <div className="rounded-lg border bg-muted/30 p-4 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <LockKeyhole className="h-4 w-4" />
              <span>Authentication Required</span>
            </div>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Email</Label>
                <Input
                  type="email"
                  value={data.email}
                  onChange={(e) => setData("email", e.target.value)}
                  required
                  placeholder="your@email.com"
                  disabled={processing}
                  className="bg-background"
                />
                {errors.email && (
                  <p className="text-[0.8rem] font-medium text-destructive">
                    {errors.email}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">
                  Password
                </Label>
                <Input
                  type="password"
                  value={data.password}
                  onChange={(e) => setData("password", e.target.value)}
                  required
                  placeholder="••••••••"
                  disabled={processing}
                  className="bg-background"
                />
                {errors.password && (
                  <p className="text-[0.8rem] font-medium text-destructive">
                    {errors.password}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Override Section */}
        {isOverrideRequired && (
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-2 text-sm font-medium text-destructive">
              <ShieldAlert className="h-4 w-4" />
              <span>Override Credentials</span>
            </div>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-destructive/80">
                  Authorized Email
                </Label>
                <Input
                  type="email"
                  value={data.override_email}
                  onChange={(e) => setData("override_email", e.target.value)}
                  required
                  placeholder="admin@example.com"
                  disabled={processing}
                  className="bg-background border-destructive/20 focus-visible:ring-destructive/20"
                />
                {errors.override_email && (
                  <p className="text-[0.8rem] font-medium text-destructive">
                    {errors.override_email}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-destructive/80">
                  Authorized Password
                </Label>
                <Input
                  type="password"
                  value={data.override_password}
                  onChange={(e) => setData("override_password", e.target.value)}
                  required
                  placeholder="••••••••"
                  disabled={processing}
                  className="bg-background border-destructive/20 focus-visible:ring-destructive/20"
                />
                {errors.override_password && (
                  <p className="text-[0.8rem] font-medium text-destructive">
                    {errors.override_password}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel || closeDialog}
          disabled={processing}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="destructive"
          disabled={processing || !data.void_id}
          className="min-w-25"
        >
          {processing ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : isOverrideRequired ? (
            <ShieldAlert className="mr-2 h-4 w-4" />
          ) : null}
          {isOverrideRequired ? "Authorize" : "Void Order"}
        </Button>
      </div>
    </form>
  )
}
