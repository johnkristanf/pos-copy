import { useForm } from "@inertiajs/react"
import { FormEvent, useMemo } from "react"
import toast from "react-hot-toast"
import { DynamicInertiaForm } from "@/components/ui/forms/dynamic-inertia-form"
import { API_ROUTES } from "@/config/api-routes"
import { useDynamicDialog } from "@/hooks/ui/use-dynamic-dialog"
import { catchError } from "@/lib/catch-error"
import { validateForm } from "@/lib/validate-field"
import { InertiaFieldConfig, UnitOfMeasure } from "@/types"
import {
  UnitOfMeasurePayload,
  unitOfMeasurePayloadSchema,
} from "@/types/items-utility.validation"

interface EditUnitOfMeasureFormProps {
  unitOfMeasure: UnitOfMeasure
}

export const EditUnitOfMeasureForm = ({
  unitOfMeasure,
}: EditUnitOfMeasureFormProps) => {
  const { closeDialog } = useDynamicDialog()
  const editUnitOfMeasureForm = useForm<UnitOfMeasurePayload>({
    code: unitOfMeasure.code,
    name: unitOfMeasure.name,
  })

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()

    if (
      !validateForm(
        unitOfMeasurePayloadSchema,
        editUnitOfMeasureForm.data,
        editUnitOfMeasureForm,
      )
    ) {
      return
    }

    const editUnitOfMeasurePromise = new Promise<void>((resolve, reject) => {
      editUnitOfMeasureForm.patch(
        API_ROUTES.UPDATE_UNIT_OF_MEASURE(String(unitOfMeasure.id)),
        {
          preserveScroll: true,
          onSuccess: () => {
            editUnitOfMeasureForm.reset()
            closeDialog()
            resolve()
          },
          onError: (errors) => {
            reject(
              new Error(
                (Object.values(errors)[0] as string) ||
                  "Failed to edit unit of measure",
              ),
            )
          },
        },
      )
    })

    toast.promise(editUnitOfMeasurePromise, {
      loading: (
        <span className="animate-pulse">Editing unit of measure...</span>
      ),
      success: "Unit of measure edited successfully!",
      error: (error) => catchError(error),
    })
  }

  const editCategoryFields: InertiaFieldConfig<UnitOfMeasurePayload>[] =
    useMemo(
      () => [
        {
          name: "code",
          type: "text",
          label: "Code",
          placeholder: "e.g, KG, PCS, L",
          disabled: editUnitOfMeasureForm.processing,
        },
        {
          name: "name",
          type: "text",
          label: "Name",
          placeholder: "e.g., Kilogram, Pieces, Liter",
          disabled: editUnitOfMeasureForm.processing,
          required: true,
          showRequiredMarker: true,
        },
      ],
      [editUnitOfMeasureForm.processing, editUnitOfMeasureForm.data],
    )

  return (
    <DynamicInertiaForm<UnitOfMeasurePayload>
      form={editUnitOfMeasureForm}
      onSubmit={handleSubmit}
      fields={editCategoryFields}
      submitButtonTitle="Edit Unit of Measure"
      addCancelButton={true}
      onCancel={closeDialog}
      disabled={editUnitOfMeasureForm.processing}
      size="sm"
    />
  )
}
