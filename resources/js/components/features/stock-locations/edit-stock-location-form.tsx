import { useForm } from "@inertiajs/react"
import { FormEvent, useMemo } from "react"
import toast from "react-hot-toast"
import { DynamicInertiaForm } from "@/components/ui/forms/dynamic-inertia-form"
import { API_ROUTES } from "@/config/api-routes"
import { useDynamicDialog } from "@/hooks/ui/use-dynamic-dialog"
import { catchError } from "@/lib/catch-error"
import { validateForm } from "@/lib/validate-field"
import { InertiaFieldConfig, StockLocation } from "@/types"
import {
  StockLocationsPayload,
  StockLocationsSchema,
} from "@/types/operation-utility.validation"

interface editStockLocationsFormProps {
  stockLocation: StockLocation
}

export const EditStockLocationsForm = ({
  stockLocation,
}: editStockLocationsFormProps) => {
  const { closeDialog } = useDynamicDialog()

  const editStockLocationForm = useForm<StockLocationsPayload>({
    name: stockLocation.name,
  })

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()

    if (
      !validateForm(
        StockLocationsSchema,
        editStockLocationForm.data,
        editStockLocationForm,
      )
    ) {
      return
    }

    const editStockLocationPromise = new Promise<void>((resolve, reject) => {
      editStockLocationForm.put(
        API_ROUTES.UPDATE_STOCK_LOCATION(String(stockLocation.id)),
        {
          preserveScroll: true,
          onSuccess: () => {
            editStockLocationForm.reset()
            closeDialog()
            resolve()
          },
          onError: (errors) => {
            reject(
              new Error(
                (Object.values(errors)[0] as string) ||
                  "Failed to edit stock location",
              ),
            )
          },
        },
      )
    })

    toast.promise(editStockLocationPromise, {
      loading: <span className="animate-pulse">Editing stock location...</span>,
      success: "Stock location edited successfully!",
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
          disabled: editStockLocationForm.processing,
          required: true,
          showRequiredMarker: true,
        },
      ],
      [editStockLocationForm.processing, editStockLocationForm],
    )

  return (
    <DynamicInertiaForm<StockLocationsPayload>
      form={editStockLocationForm}
      onSubmit={handleSubmit}
      fields={createStockLocationFields}
      submitButtonTitle="Edit Stock Location"
      onCancel={closeDialog}
      disabled={editStockLocationForm.processing}
      size="sm"
    />
  )
}
