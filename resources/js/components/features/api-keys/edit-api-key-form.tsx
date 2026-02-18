import { useForm } from "@inertiajs/react"
import { FormEvent, useCallback, useMemo } from "react"
import toast from "react-hot-toast"
import { DynamicInertiaForm } from "@/components/ui/forms/dynamic-inertia-form"
import { API_ROUTES } from "@/config/api-routes"
import { useDynamicDialog } from "@/hooks/ui/use-dynamic-dialog"
import { catchError } from "@/lib/catch-error"
import { validateForm } from "@/lib/validate-field"
import {
  ApiKey,
  App,
  AppFeature,
  FeaturePermission,
  InertiaFieldConfig,
  KeyExpirationOption,
} from "@/types"
import {
  UpdateApiKeyPayload,
  updateApiKeyPayloadSchema,
} from "@/types/api-key.validation"
import { ApiKeyFeatureSelector } from "./feature-selector"

interface EditApiKeyFormProps {
  app: App
  apiKey: ApiKey
  features: AppFeature[]
  keyExpirationOptions: KeyExpirationOption[]
}

export const EditApiKeyForm = ({
  app,
  apiKey,
  features,
  keyExpirationOptions,
}: EditApiKeyFormProps) => {
  const { closeDialog } = useDynamicDialog()

  const editApiKeyForm = useForm<UpdateApiKeyPayload>({
    label: apiKey.label,
    key_expiration_id: String(apiKey.key_expiration_id),
    features: (apiKey.features ?? []).map((feature) => ({
      id: feature.id,
      permissions: feature.permissions,
    })),
  })

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()

    if (
      !validateForm(
        updateApiKeyPayloadSchema,
        editApiKeyForm.data,
        editApiKeyForm,
      )
    ) {
      return
    }

    const updateApiKeyPromise = new Promise<void>((resolve, reject) => {
      editApiKeyForm.put(
        API_ROUTES.UPDATE_API_KEY(app.slug, String(app.id), String(apiKey.id)),
        {
          preserveScroll: true,
          onSuccess: () => {
            editApiKeyForm.reset()
            closeDialog()
            resolve()
          },
          onError: (errors) => {
            reject(
              new Error(
                (Object.values(errors)[0] as string) ||
                  "Failed to update API key",
              ),
            )
          },
        },
      )
    })

    toast.promise(updateApiKeyPromise, {
      loading: <span className="animate-pulse">Updating API Key...</span>,
      success: "API Key updated successfully!",
      error: (error) => catchError(error),
    })
  }

  const handleFeaturesChange = useCallback((value: any) => {
    editApiKeyForm.setData("features", value)
  }, [])

  const editApiKeyFields: InertiaFieldConfig<UpdateApiKeyPayload>[] = useMemo(
    () => [
      {
        name: "label",
        type: "text",
        label: "Type",
        defaultValue: apiKey.type === "inbound" ? "Inbound" : "Outbound",
        disabled: true,
        readOnly: true,
      } as any,
      {
        name: "label",
        type: "text",
        label: "API Key Label",
        placeholder: "Enter a descriptive label",
        disabled: editApiKeyForm.processing,
        required: true,
        showRequiredMarker: true,
      },
      {
        name: "key_expiration_id",
        type: "select",
        label: "Expiration",
        placeholder: "Select expiration period",
        options: keyExpirationOptions,
        disabled: editApiKeyForm.processing,
        required: true,
        showRequiredMarker: true,
      },
      {
        name: "features",
        type: "text",
        label: "Feature Permissions",
        customComponent: ({ field }: { field: FeaturePermission[] }) => (
          <ApiKeyFeatureSelector
            field={field}
            onChange={handleFeaturesChange}
            features={features}
            isLoading={false}
          />
        ),
      },
    ],
    [
      editApiKeyForm.processing,
      features,
      keyExpirationOptions,
      handleFeaturesChange,
      apiKey.type,
    ],
  )

  return (
    <DynamicInertiaForm<UpdateApiKeyPayload>
      form={editApiKeyForm}
      onSubmit={handleSubmit}
      fields={editApiKeyFields}
      submitButtonTitle="Update API Key"
      addCancelButton={true}
      onCancel={closeDialog}
      disabled={editApiKeyForm.processing}
      className="space-y-4"
      size="sm"
    />
  )
}
