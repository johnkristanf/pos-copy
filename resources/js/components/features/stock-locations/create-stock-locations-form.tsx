import { useForm } from "@inertiajs/react"
import { FormEvent, useMemo } from "react"
import toast from "react-hot-toast"
import { DynamicInertiaForm } from "@/components/ui/forms/dynamic-inertia-form"
import { API_ROUTES } from "@/config/api-routes"
import { useDynamicDialog } from "@/hooks/ui/use-dynamic-dialog"
import { catchError } from "@/lib/catch-error"
import { validateForm } from "@/lib/validate-field"
import { InertiaFieldConfig } from "@/types"
import {
  StockLocationsPayload,
  StockLocationsSchema,
} from "@/types/operation-utility.validation"

export const CreateStockLocationsForm = () => {
  const { closeDialog } = useDynamicDialog()

  const createstockLocationForm = useForm<StockLocationsPayload>({
    name: "",
  })

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()

    if (
      !validateForm(
        StockLocationsSchema,
        createstockLocationForm.data,
        createstockLocationForm,
      )
    ) {
      return
    }

    const createStockLocationPromise = new Promise<void>((resolve, reject) => {
      createstockLocationForm.post(API_ROUTES.CREATE_STOCK_LOCATION, {
        preserveScroll: true,
        onSuccess: () => {
          createstockLocationForm.reset()
          closeDialog()
          resolve()
        },
        onError: (errors) => {
          reject(
            new Error(
              (Object.values(errors)[0] as string) ||
                "Failed to create stock location",
            ),
          )
        },
      })
    })

    toast.promise(createStockLocationPromise, {
      loading: (
        <span className="animate-pulse">Creating stock location...</span>
      ),
      success: "Stock location created successfully!",
      error: (error) => catchError(error),
    })
  }

  const createStockLocationFields: InertiaFieldConfig<StockLocationsPayload>[] =
    useMemo(
      () => [
        {
          name: "name",
          type: "text",
          label: "Name",
          placeholder: "e.g., Warehouse 2",
          disabled: createstockLocationForm.processing,
          required: true,
          showRequiredMarker: true,
        },
      ],
      [createstockLocationForm.processing, createstockLocationForm],
    )

  return (
    <DynamicInertiaForm<StockLocationsPayload>
      form={createstockLocationForm}
      onSubmit={handleSubmit}
      fields={createStockLocationFields}
      submitButtonTitle="Create Stock Location"
      onCancel={closeDialog}
      disabled={createstockLocationForm.processing}
      size="sm"
    />
  )
}
