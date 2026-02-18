import { useForm } from "@inertiajs/react"
import { FormEvent, useState } from "react"
import toast from "react-hot-toast"
import { DynamicInertiaForm } from "@/components/ui/forms/dynamic-inertia-form"
import { API_ROUTES } from "@/config/api-routes"
import { useDynamicDialog } from "@/hooks/ui/use-dynamic-dialog"
import { catchError } from "@/lib/catch-error"
import { validateForm } from "@/lib/validate-field"
import { InertiaFieldConfig, Supplier } from "@/types"
import {
  ReturnToSupplierPayload,
  returnToSupplierPayloadSchema,
} from "@/types/return-to-supplier.validation"
import { SelectSupplier } from "@/components/ui/common/select-supplier"
import { ReturnToSupplierItemSelector } from "@/components/ui/common/return-to-supplier-item-selector"

export const ReturnToSupplierForm = () => {
  const { closeDialog } = useDynamicDialog()
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(
    null,
  )

  const returnToSupplierForm = useForm<ReturnToSupplierPayload>({
    supplier_id: 0,
    remarks: "",
    type: "replacement",
    items_to_return: [],
  })

  const typeOptions = [
    {
      value: "replacement",
      label: "Replacement",
    },
    {
      value: "offset",
      label: "Offset",
    },
  ]

  const returnToSupplierFields: InertiaFieldConfig<ReturnToSupplierPayload>[] =
    [
      {
        name: "supplier_id",
        label: "Supplier Name",
        placeholder: "(e.g. Acme Incorporated)",
        customComponent: () => (
          <SelectSupplier
            selectedSupplier={selectedSupplier}
            onSupplierChange={(supplier) => {
              setSelectedSupplier(supplier)
              returnToSupplierForm.setData(
                "supplier_id",
                supplier ? supplier.id : 0,
              )
            }}
            label="Return to Supplier"
          />
        ),
      },
      {
        name: "type",
        type: "select",
        label: "Type",
        placeholder: "Select type",
        options: typeOptions,
        disabled: returnToSupplierForm.processing,
        required: true,
        showRequiredMarker: true,
      },
      {
        name: "items_to_return",
        label: "Items",
        disabled: returnToSupplierForm.processing,
        customComponent: () => (
          <ReturnToSupplierItemSelector
            form={returnToSupplierForm}
            supplierId={selectedSupplier?.id || null}
            disabled={returnToSupplierForm.processing}
          />
        ),
        containerClassName: "",
      },
      {
        name: "remarks",
        type: "textarea",
        label: "Remarks",
        placeholder: "(e.g. Defective, Damage, Wrong Model)",
        autoFocus: true,
        disabled: returnToSupplierForm.processing,
        required: true,
        containerClassName: "",
      },
    ]

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()

    if (
      !validateForm(
        returnToSupplierPayloadSchema,
        returnToSupplierForm.data,
        returnToSupplierForm,
      )
    ) {
      return
    }

    const returnPromise = new Promise<void>((resolve, reject) => {
      returnToSupplierForm.post(API_ROUTES.CREATE_RETURN_TO_SUPPLIER, {
        preserveScroll: true,
        onSuccess: () => {
          returnToSupplierForm.reset()
          setSelectedSupplier(null)
          closeDialog()
          resolve()
        },
        onError: (errors) => {
          reject(
            new Error((Object.values(errors)[0] as string) || "Return failed"),
          )
        },
      })
    })

    toast.promise(returnPromise, {
      loading: "Returning to supplier...",
      success: "Successfully returned items",
      error: (error) => catchError(error),
    })
  }

  return (
    <DynamicInertiaForm<ReturnToSupplierPayload>
      form={returnToSupplierForm}
      fields={returnToSupplierFields}
      onSubmit={handleSubmit}
      disabled={returnToSupplierForm.processing}
      submitButtonTitle="Submit Form"
      addCancelButton={true}
      onCancel={closeDialog}
      submitButtonClassname="w-full"
      size="md"
    />
  )
}
