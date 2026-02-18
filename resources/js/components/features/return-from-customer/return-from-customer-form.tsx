import { useForm } from "@inertiajs/react"
import { FormEvent } from "react"
import toast from "react-hot-toast"
import { ReturnItemSelector } from "@/components/ui/common/return-item-selector"
import { DynamicInertiaForm } from "@/components/ui/forms/dynamic-inertia-form"
import { API_ROUTES } from "@/config/api-routes"
import { useDynamicDialog } from "@/hooks/ui/use-dynamic-dialog"
import { catchError } from "@/lib/catch-error"
import { validateForm } from "@/lib/validate-field"
import { InertiaFieldConfig, StockLocation } from "@/types"
import {
  ReturnFromCustomerPayload,
  returnFromCustomerPayloadSchema,
} from "@/types/return-from-customer.validation"
import { SelectCustomer } from "../create-orders/select-customer"
import { InvoiceDateSelection } from "./return-from-customer-duration-field"

interface ReturnFromCustomerFormProps {
  stockLocations: StockLocation[]
}

export const ReturnFromCustomerForm = ({
  stockLocations,
}: ReturnFromCustomerFormProps) => {
  const { closeDialog } = useDynamicDialog()
  const returnFromCustomerForm = useForm<ReturnFromCustomerPayload>({
    customer_id: 0,
    invoice_number: "",
    invoice_issued_date: "",
    reason: "",
    returned_items: [],
  })

  const returnFromCustomerField: InertiaFieldConfig<ReturnFromCustomerPayload>[] =
    [
      {
        name: "customer_id",
        label: "Customer Name",
        placeholder: "(e.g. Acme Incorporated)",
        customComponent: () => (
          <SelectCustomer
            returnForm={true}
            onCustomerChange={(customer) => {
              returnFromCustomerForm.setData(
                "customer_id",
                customer ? customer.id : 0,
              )
            }}
          />
        ),
      },
      {
        name: "invoice_number",
        type: "text",
        label: "Invoice Number",
        placeholder: "(e.x. ABC-2025-001)",
        disabled: returnFromCustomerForm.processing,
        required: true,
        containerClassName: "",
        groupId: "invoiceDetails",
      },
      {
        name: "invoice_issued_date",
        groupId: "invoiceDetails",
        customComponent: () => (
          <InvoiceDateSelection
            form={returnFromCustomerForm}
            disabled={returnFromCustomerForm.processing}
          />
        ),
      },
      {
        name: "returned_items",
        label: "Items",
        disabled: returnFromCustomerForm.processing,
        customComponent: () => (
          <ReturnItemSelector
            form={returnFromCustomerForm}
            customerId={returnFromCustomerForm.data.customer_id}
            stockLocations={stockLocations}
            disabled={returnFromCustomerForm.processing}
          />
        ),
        containerClassName: "",
      },
      {
        name: "reason",
        type: "textarea",
        label: "Reason",
        placeholder: "(e.g. Defective, Damage, Wrong Model)",
        autoFocus: true,
        disabled: returnFromCustomerForm.processing,
        required: true,
        containerClassName: "",
      },
    ]

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()

    if (
      !validateForm(
        returnFromCustomerPayloadSchema,
        returnFromCustomerForm.data,
        returnFromCustomerForm,
      )
    ) {
      return
    }

    const returnFromCustomerFormPromise = new Promise<void>(
      (resolve, reject) => {
        returnFromCustomerForm.post(API_ROUTES.CREATE_RETURN_FROM_CUSTOMER, {
          preserveScroll: true,
          forceFormData: true,
          onSuccess: () => {
            returnFromCustomerForm.reset()
            closeDialog()
            resolve()
          },
          onError: (errors) => {
            reject(
              new Error(
                (Object.values(errors)[0] as string) ||
                  "Failed to create return from customer form",
              ),
            )
          },
        })
      },
    )

    toast.promise(returnFromCustomerFormPromise, {
      loading: (
        <span className="animate-pulse">
          Creating return from customer form...
        </span>
      ),
      success: "From submitted successfully!",
      error: (error) => catchError(error),
    })
  }

  return (
    <DynamicInertiaForm<ReturnFromCustomerPayload>
      form={returnFromCustomerForm}
      fields={returnFromCustomerField}
      onSubmit={handleSubmit}
      disabled={returnFromCustomerForm.processing}
      submitButtonTitle="Submit Form"
      addCancelButton={true}
      onCancel={closeDialog}
      size="md"
    />
  )
}
