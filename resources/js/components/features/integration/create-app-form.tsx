import { useForm } from "@inertiajs/react"
import { FormEvent } from "react"
import toast from "react-hot-toast"
import { DynamicInertiaForm } from "@/components/ui/forms/dynamic-inertia-form"
import { API_ROUTES } from "@/config/api-routes"
import { useDynamicDialog } from "@/hooks/ui/use-dynamic-dialog"
import { catchError } from "@/lib/catch-error"
import { validateForm } from "@/lib/validate-field"
import { InertiaFieldConfig } from "@/types"
import {
  CreateAppPayload,
  createAppPayloadSchema,
} from "@/types/apps.validation"

export const CreateAppForm = () => {
  const { closeDialog } = useDynamicDialog()

  const createAppform = useForm<CreateAppPayload>({
    name: "",
    slug: "",
    isactive: 1,
  })

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()

    if (
      !validateForm(createAppPayloadSchema, createAppform.data, createAppform)
    ) {
      return
    }

    const createAppPromise = new Promise<void>((resolve, reject) => {
      createAppform.post(API_ROUTES.CREATE_APP, {
        preserveScroll: true,
        onSuccess: () => {
          createAppform.reset()
          closeDialog()
          resolve()
        },
        onError: (errors) => {
          reject(
            new Error(
              (Object.values(errors)[0] as string) || "Failed to create app",
            ),
          )
        },
      })
    })

    toast.promise(createAppPromise, {
      loading: <span className="animate-pulse">Creating App...</span>,
      success: "App created successfully!",
      error: (error) => catchError(error),
    })
  }

  const createAppFields: InertiaFieldConfig<CreateAppPayload>[] = [
    {
      name: "name",
      type: "text",
      label: "App Name",
      placeholder: "Enter app name",
      disabled: createAppform.processing,
      required: true,
      showRequiredMarker: true,
    },
    {
      name: "slug",
      type: "text",
      label: "App Slug",
      placeholder: "Enter app slug (e.g., app_name)",
      disabled: createAppform.processing,
      required: true,
      showRequiredMarker: true,
    },
    {
      name: "isactive",
      type: "select",
      label: "Status",
      placeholder: "Select status",
      options: [
        { value: "1", label: "Active" },
        { value: "0", label: "Inactive" },
      ],
      disabled: createAppform.processing,
      required: true,
      showRequiredMarker: true,
    },
  ]

  return (
    <DynamicInertiaForm<CreateAppPayload>
      form={createAppform}
      onSubmit={handleSubmit}
      fields={createAppFields}
      submitButtonTitle="Create App"
      addCancelButton={true}
      onCancel={closeDialog}
      disabled={createAppform.processing}
      className="space-y-4"
      size="sm"
    />
  )
}
