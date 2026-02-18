"use client"

import { useForm } from "@inertiajs/react"
import { FormEvent } from "react"
import toast from "react-hot-toast"
import { DynamicInertiaForm } from "@/components/ui/forms/dynamic-inertia-form"
import { API_ROUTES } from "@/config/api-routes"
import { useDynamicDialog } from "@/hooks/ui/use-dynamic-dialog"
import { catchError } from "@/lib/catch-error"
import { validateForm } from "@/lib/validate-field"
import { App, InertiaFieldConfig } from "@/types"
import {
  UpdateAppPayload,
  updateAppPayloadSchema,
} from "@/types/apps.validation"

interface EditAppFormProps {
  app: App
}

export const EditAppForm = ({ app }: EditAppFormProps) => {
  const { closeDialog } = useDynamicDialog()

  const updateAppForm = useForm<UpdateAppPayload>({
    name: app.name,
    slug: app.slug,
    isactive: app.isactive?.toString(),
  })

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()

    if (
      !validateForm(updateAppPayloadSchema, updateAppForm.data, updateAppForm)
    ) {
      return
    }

    const updateAppPromise = new Promise<void>((resolve, reject) => {
      updateAppForm.put(API_ROUTES.UPDATE_APP(app.id.toString()), {
        preserveScroll: true,
        onSuccess: () => {
          updateAppForm.reset()
          closeDialog()
          resolve()
        },
        onError: (errors) => {
          reject(
            new Error(
              (Object.values(errors)[0] as string) || "Failed to update app",
            ),
          )
        },
      })
    })

    toast.promise(updateAppPromise, {
      loading: <span className="animate-pulse">Updating App...</span>,
      success: "App updated successfully!",
      error: (error) => catchError(error),
    })
  }

  const updateAppFields: InertiaFieldConfig<UpdateAppPayload>[] = [
    {
      name: "name",
      type: "text",
      label: "App Name",
      placeholder: "Enter app name",
      disabled: updateAppForm.processing,
      required: true,
      showRequiredMarker: true,
    },
    {
      name: "slug",
      type: "text",
      label: "App Slug",
      placeholder: "Enter app slug",
      disabled: updateAppForm.processing,
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

      disabled: updateAppForm.processing,
      required: true,
      showRequiredMarker: true,
    },
  ]

  return (
    <DynamicInertiaForm<UpdateAppPayload>
      form={updateAppForm}
      onSubmit={handleSubmit}
      fields={updateAppFields}
      submitButtonTitle="Update App"
      addCancelButton={true}
      onCancel={closeDialog}
      disabled={updateAppForm.processing}
      className="space-y-4"
      size="sm"
    />
  )
}
