import { router } from "@inertiajs/react"
import { useQueryClient } from "@tanstack/react-query"
import { AnimatePresence, motion } from "framer-motion"
import { AlertCircle, Loader2, PauseIcon, Trash2Icon } from "lucide-react"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import { Button } from "@/components/ui/common/button"
import { Input } from "@/components/ui/inputs/input"
import { API_ROUTES } from "@/config/api-routes"
import { useDynamicDialog } from "@/hooks/ui/use-dynamic-dialog"
import { cn } from "@/lib/cn"
import { PaymentMethod } from "@/types"
import { CreditLimitOverrideForm } from "../active-orders/credit-limit-override-form"
import { PaymentMethodSelector } from "./payment-method-selector"
import { SelectCustomer } from "./select-customer"
import {
  useCreateOrderActions,
  useCreateOrderStore,
  useOrderErrors,
  useSelectedItems,
} from "./use-create-order-store"
import {
  useDraftOrderActions,
  useDraftOrderState,
} from "./use-draft-order-store"

interface BillingSalesOrderProps {
  paymentMethods?: PaymentMethod[]
}

export const BillingSalesOrder = ({
  paymentMethods = [],
}: BillingSalesOrderProps) => {
  const { resetSelection, validateAll } = useCreateOrderActions()
  const { selectedCustomer, paymentMethod, discount, draftId } =
    useDraftOrderState()
  const { resetDraft } = useDraftOrderActions()

  const queryClient = useQueryClient()
  const selectedItems = useSelectedItems()
  const quantities = useCreateOrderStore((state) => state.quantities)
  const selectedUoms = useCreateOrderStore((state) => state.selectedUoms)
  const itemErrors = useOrderErrors()

  const [processing, setProcessing] = useState(false)
  const [errors, setErrors] = useState({ customer: false, payment: false })
  const [poNumber, setPoNumber] = useState("")

  const { openConfirmation, openDialog, closeDialog } = useDynamicDialog()

  const isCreditSelected =
    paymentMethod?.tag?.toLowerCase().includes("credit") || false

  useEffect(() => {
    if (selectedCustomer) setErrors((prev) => ({ ...prev, customer: false }))
  }, [selectedCustomer])

  useEffect(() => {
    if (paymentMethod) setErrors((prev) => ({ ...prev, payment: false }))

    if (paymentMethod && !paymentMethod.tag?.toLowerCase().includes("credit")) {
      setPoNumber("")
    }
  }, [paymentMethod])

  const handleCancel = () => {
    resetSelection()
    resetDraft()
    setErrors({ customer: false, payment: false })
    setPoNumber("")
  }

  const handleSaveDraft = () => {
    const items = Object.values(selectedItems)

    if (items.length === 0) {
      toast.error("Cannot draft an empty order.")
      return
    }

    if (!selectedCustomer) {
      toast.error("Please select a customer to draft this order.")
      return
    }

    if (!paymentMethod) {
      toast.error("Please select a payment method to draft.")
      return
    }

    openConfirmation({
      title: "Save as Draft",
      description:
        "Are you sure you want to save this order as a draft? You can resume it later.",
      type: "warning",
      confirmText: "Save Draft",
      cancelText: "Cancel",
      onConfirm: async () => {
        const ordered_items = items.map((item) => ({
          id: item.id,
          selected_uom_id: selectedUoms[item.id],
          quantity: quantities[item.id] || 1,
        }))

        const subtotal = items.reduce((sum, item) => {
          const price = Number(item.selling_prices?.unit_price) || 0
          const quantity = quantities[item.id] ?? 1
          return sum + price * quantity
        }, 0)

        const total_payable = subtotal - discount

        const payload = {
          customer_id: selectedCustomer.id,
          payment_method: {
            id: paymentMethod.id,
            tag: paymentMethod.tag,
          },
          ordered_items,
          total_payable,
          paid_amount: 0,
          is_draft: true,
          draft_id: draftId,
          // CHANGED: Ensure PO number is only sent when credit is selected
          po_number: isCreditSelected ? poNumber.trim() || null : null,
        }

        setProcessing(true)

        const submitDraft = new Promise<void>((resolve, reject) => {
          router.post(API_ROUTES.CREATE_ORDER, payload, {
            onSuccess: () => {
              queryClient.invalidateQueries({ queryKey: ["draft-orders"] })
              handleCancel()
              resolve()
            },
            onError: (errors) => {
              console.error(errors)
              reject(errors)
            },
            onFinish: () => setProcessing(false),
          })
        })

        await toast.promise(submitDraft, {
          loading: "Saving draft...",
          success: "Draft saved successfully!",
          error: "Failed to save draft.",
        })
      },
    })
  }

  const submitOrder = async (overrideCreds?: {
    email: string
    password: string
  }) => {
    const items = Object.values(selectedItems)
    const ordered_items = items.map((item) => ({
      id: item.id,
      selected_uom_id: selectedUoms[item.id],
      quantity: quantities[item.id] || 1,
    }))

    const subtotal = items.reduce((sum, item) => {
      const price = Number(item.selling_prices?.unit_price) || 0
      const quantity = quantities[item.id] ?? 1
      return sum + price * quantity
    }, 0)

    const total_payable = subtotal - discount

    const payload: any = {
      customer_id: selectedCustomer!.id,
      payment_method: {
        id: paymentMethod!.id,
        tag: paymentMethod!.tag,
      },
      ordered_items,
      total_payable,
      paid_amount: total_payable,
      draft_id: draftId,
      // CHANGED: Ensure PO number is only sent when credit is selected
      po_number: isCreditSelected ? poNumber.trim() || null : null,
    }

    if (overrideCreds) {
      payload.override_email = overrideCreds.email
      payload.override_password = overrideCreds.password
    }

    setProcessing(true)

    const orderPromise = new Promise<void>((resolve, reject) => {
      router.post(API_ROUTES.CREATE_ORDER, payload, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["draft-orders"] })
          handleCancel()
          resolve()
        },
        onError: (errors: any) => {
          console.error(errors)
          if (errors.credit_limit) {
            openDialog({
              title: "Credit Limit Override",
              children: (
                <CreditLimitOverrideForm
                  errorMessage={errors.credit_limit}
                  onCancel={closeDialog}
                  onConfirm={async (creds) => {
                    await submitOrder(creds)
                    closeDialog()
                  }}
                />
              ),
            })
          }
          reject(errors)
        },
        onFinish: () => setProcessing(false),
      })
    })

    await toast.promise(orderPromise, {
      loading: overrideCreds
        ? "Authorizing and creating order..."
        : "Creating order...",
      success: "Order created successfully!",
      error: (err: any) =>
        err.credit_limit
          ? "Authorization required for credit limit."
          : "Failed to create order. Please check inputs.",
    })
  }

  const handleProcessPayment = async () => {
    const isItemsValid = validateAll()
    const currentItemErrors = useCreateOrderStore.getState().errors
    const errorCount = Object.keys(currentItemErrors).length

    if (!isItemsValid || errorCount > 0) {
      toast.error(
        <div className="flex flex-col gap-0.5">
          <span className="font-semibold">Action Required</span>
          <span className="text-xs">
            Please resolve the issues with{" "}
            <strong>
              {errorCount} item{errorCount > 1 ? "s" : ""}
            </strong>{" "}
            in your list before proceeding.
          </span>
        </div>,
        { duration: 4000 },
      )
      return
    }

    const newErrors = {
      customer: !selectedCustomer,
      payment: !paymentMethod,
    }

    if (newErrors.customer || newErrors.payment) {
      setErrors(newErrors)

      const missingFields = []
      if (newErrors.customer) missingFields.push("Customer")
      if (newErrors.payment) missingFields.push("Payment Method")

      toast.error(`Please select a ${missingFields.join(" and ")}.`)
      return
    }

    const items = Object.values(selectedItems)
    if (items.length === 0) {
      toast.error("Your order is empty. Please select items to proceed.")
      return
    }

    const missingUoms = items.filter((item) => !selectedUoms[item.id])
    if (missingUoms.length > 0) {
      toast.error(
        `Please select units for: ${missingUoms.map((i) => i.description).join(", ")}`,
      )
      return
    }

    openConfirmation({
      title: "Confirm Order",
      description: `Are you sure you want to create this order for ${selectedCustomer?.name}? This action cannot be undone.`,
      type: "warning",
      confirmText: "Yes, Create Order",
      cancelText: "Cancel",
      onConfirm: async () => {
        await submitOrder()
      },
    })
  }

  const hasItemErrors = Object.keys(itemErrors).length > 0

  return (
    <div className="flex flex-col border-0 shadow-none bg-transparent gap-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Customer
          </span>
          {errors.customer && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-[10px] text-destructive font-medium flex items-center gap-1"
            >
              <AlertCircle className="w-3 h-3" /> Required
            </motion.span>
          )}
        </div>
        <div
          className={cn(
            "rounded-lg transition-all duration-200 border bg-card/50",
            errors.customer
              ? "border-destructive/50 ring-2 ring-destructive/10"
              : "border-border hover:border-border/80",
          )}
        >
          <SelectCustomer />
        </div>
      </div>

      <AnimatePresence>
        {isCreditSelected && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-col gap-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                PO Number{" "}
                <span className="text-muted-foreground/60 normal-case font-normal">
                  (Optional)
                </span>
              </span>
            </div>
            <Input
              placeholder="Enter PO Number..."
              value={poNumber}
              onChange={(e) => setPoNumber(e.target.value)}
              disabled={processing}
              className="h-10 bg-card/50"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <PaymentMethodSelector
        paymentMethods={paymentMethods}
        hasError={errors.payment}
      />

      <div className="grid grid-cols-2 gap-3 pt-2">
        <Button
          variant={hasItemErrors ? "secondary" : "bridge_digital"}
          className={cn(
            "w-full col-span-2 h-11 shadow-sm transition-all active:scale-[0.98]",
            hasItemErrors ? "opacity-90" : "shadow-primary/20",
          )}
          size="lg"
          onClick={handleProcessPayment}
          disabled={processing}
        >
          {processing ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          <span className="text-sm font-semibold">
            {hasItemErrors ? "Review & Proceed" : "Proceed to Pay"}
          </span>
        </Button>

        <Button
          className="w-full h-10 border-border bg-card hover:bg-accent hover:text-accent-foreground"
          variant="outline"
          disabled={processing}
          onClick={handleSaveDraft}
        >
          <PauseIcon className="mr-2 h-4 w-4" />
          <span className="text-xs font-medium">Save Draft</span>
        </Button>

        <Button
          variant="outline"
          className="w-full h-10 border-border bg-card text-muted-foreground hover:bg-destructive/5 hover:text-destructive hover:border-destructive/20"
          onClick={handleCancel}
          disabled={processing}
        >
          <Trash2Icon className="mr-2 h-4 w-4" />
          <span className="text-xs font-medium">Cancel</span>
        </Button>
      </div>
    </div>
  )
}
