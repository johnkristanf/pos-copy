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
  CategoryPayload,
  categoryPayloadSchema,
} from "@/types/items-utility.validation"

export const CreateCategoryForm = () => {
  const { closeDialog } = useDynamicDialog()
  const createCategoryForm = useForm<CategoryPayload>({
    code: "",
    name: "",
  })

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()

    if (
      !validateForm(
        categoryPayloadSchema,
        createCategoryForm.data,
        createCategoryForm,
      )
    ) {
      return
    }

    const createCategoryPromise = new Promise<void>((resolve, reject) => {
      createCategoryForm.post(API_ROUTES.CREATE_CATEGORY, {
        preserveScroll: true,
        onSuccess: () => {
          createCategoryForm.reset()
          closeDialog()
          resolve()
        },
        onError: (errors) => {
          reject(
            new Error(
              (Object.values(errors)[0] as string) ||
                "Failed to create category",
            ),
          )
        },
      })
    })

    toast.promise(createCategoryPromise, {
      loading: <span className="animate-pulse">Creating category...</span>,
      success: "Category created successfully!",
      error: (error) => catchError(error),
    })
  }

  const createCategoryFields: InertiaFieldConfig<CategoryPayload>[] = useMemo(
    () => [
      {
        name: "code",
        type: "text",
        label: "Code",
        placeholder: "e.g, CHA, AUT, ELC",
        disabled: createCategoryForm.processing,
      },
      {
        name: "name",
        type: "text",
        label: "Name",
        placeholder: "e.g., Auto Supply, Electrical",
        disabled: createCategoryForm.processing,
        required: true,
        showRequiredMarker: true,
      },
    ],
    [createCategoryForm.processing, createCategoryForm.data],
  )

  return (
    <DynamicInertiaForm<CategoryPayload>
      form={createCategoryForm}
      onSubmit={handleSubmit}
      fields={createCategoryFields}
      submitButtonTitle="Create Category"
      onCancel={closeDialog}
      addCancelButton={true}
      disabled={createCategoryForm.processing}
      size="sm"
    />
  )
}
