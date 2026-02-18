import { useForm } from "@inertiajs/react"
import { FormEvent, useMemo } from "react"
import toast from "react-hot-toast"
import { DynamicInertiaForm } from "@/components/ui/forms/dynamic-inertia-form"
import { API_ROUTES } from "@/config/api-routes"
import { useDynamicDialog } from "@/hooks/ui/use-dynamic-dialog"
import { catchError } from "@/lib/catch-error"
import { validateForm } from "@/lib/validate-field"
import { Category, InertiaFieldConfig } from "@/types"
import {
  CategoryPayload,
  categoryPayloadSchema,
} from "@/types/items-utility.validation"

interface EditCategoryProps {
  category: Category
}

export const EditCategoryForm = ({ category }: EditCategoryProps) => {
  const { closeDialog } = useDynamicDialog()
  const editCategoryForm = useForm<CategoryPayload>({
    code: category.code,
    name: category.name,
  })

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()

    if (
      !validateForm(
        categoryPayloadSchema,
        editCategoryForm.data,
        editCategoryForm,
      )
    ) {
      return
    }

    const createCategoryPromise = new Promise<void>((resolve, reject) => {
      editCategoryForm.patch(API_ROUTES.UPDATE_CATEGORY(String(category.id)), {
        preserveScroll: true,
        onSuccess: () => {
          editCategoryForm.reset()
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
        disabled: editCategoryForm.processing,
      },
      {
        name: "name",
        type: "text",
        label: "Name",
        placeholder: "e.g., Auto Supply, Electrical",
        disabled: editCategoryForm.processing,
        required: true,
        showRequiredMarker: true,
      },
    ],
    [editCategoryForm.processing, editCategoryForm.data],
  )

  return (
    <DynamicInertiaForm<CategoryPayload>
      form={editCategoryForm}
      onSubmit={handleSubmit}
      fields={createCategoryFields}
      submitButtonTitle="Edit Category"
      onCancel={closeDialog}
      addCancelButton={true}
      disabled={editCategoryForm.processing}
      size="sm"
    />
  )
}
