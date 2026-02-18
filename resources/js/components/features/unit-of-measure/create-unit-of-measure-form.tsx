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
  UnitOfMeasurePayload,
  unitOfMeasurePayloadSchema,
} from "@/types/items-utility.validation"

export const CreateUnitOfMeasureForm = () => {
  const { closeDialog } = useDynamicDialog()
  const createUnitOfMeasureForm = useForm<UnitOfMeasurePayload>({
    code: "",
    name: "",
  })

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()

    if (
      !validateForm(
        unitOfMeasurePayloadSchema,
        createUnitOfMeasureForm.data,
        createUnitOfMeasureForm,
      )
    ) {
      return
    }

    const createCategoryPromise = new Promise<void>((resolve, reject) => {
      createUnitOfMeasureForm.post(API_ROUTES.CREATE_UNIT_OF_MEASURE, {
        preserveScroll: true,
        onSuccess: () => {
          createUnitOfMeasureForm.reset()
          closeDialog()
          resolve()
        },
        onError: (errors) => {
          reject(
            new Error(
              (Object.values(errors)[0] as string) ||
                "Failed to create unit of measure",
            ),
          )
        },
      })
    })

    toast.promise(createCategoryPromise, {
      loading: (
        <span className="animate-pulse">Creating unit of measure...</span>
      ),
      success: "Unit of measure created successfully!",
      error: (error) => catchError(error),
    })
  }

  const createCategoryFields: InertiaFieldConfig<UnitOfMeasurePayload>[] =
    useMemo(
      () => [
        {
          name: "code",
          type: "text",
          label: "Code",
          placeholder: "e.g, KG, PCS, L",
          disabled: createUnitOfMeasureForm.processing,
        },
        {
          name: "name",
          type: "text",
          label: "Name",
          placeholder: "e.g., Kilogram, Pieces, Liter",
          disabled: createUnitOfMeasureForm.processing,
          required: true,
          showRequiredMarker: true,
        },
      ],
      [createUnitOfMeasureForm.processing, createUnitOfMeasureForm.data],
    )

  return (
    <DynamicInertiaForm<UnitOfMeasurePayload>
      form={createUnitOfMeasureForm}
      onSubmit={handleSubmit}
      fields={createCategoryFields}
      submitButtonTitle="Create Unit of Measure"
      addCancelButton={true}
      onCancel={closeDialog}
      disabled={createUnitOfMeasureForm.processing}
      size="sm"
    />
  )
}
