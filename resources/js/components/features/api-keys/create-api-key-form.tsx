import { useForm } from "@inertiajs/react"
import { FormEvent, useCallback, useMemo } from "react"
import toast from "react-hot-toast"
import { DynamicInertiaForm } from "@/components/ui/forms/dynamic-inertia-form"
import { API_ROUTES } from "@/config/api-routes"
import { useDynamicDialog } from "@/hooks/ui/use-dynamic-dialog"
import { catchError } from "@/lib/catch-error"
import { validateForm } from "@/lib/validate-field"
import {
  App,
  AppFeature,
  InertiaFieldConfig,
  KeyExpirationOption,
} from "@/types"
import {
  CreateApiKeyPayload,
  createApiKeyPayloadSchema,
} from "@/types/api-key.validation"
import { ApiKeyFeatureSelector } from "./feature-selector"

interface CreateApiKeyFormProps {
  app: App
  features: AppFeature[]
  keyExpirationOptions: KeyExpirationOption[]
  defaultType?: "inbound" | "outbound"
}

export const CreateApiKeyForm = ({
  app,
  features,
  keyExpirationOptions,
  defaultType = "inbound",
}: CreateApiKeyFormProps) => {
  const { closeDialog } = useDynamicDialog()

  const createApiKeyForm = useForm<CreateApiKeyPayload>({
    type: defaultType,
    label: "",
    key: "",
    key_expiration_id: "",
    features: [],
  })

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()

    if (
      !validateForm(
        createApiKeyPayloadSchema,
        createApiKeyForm.data,
        createApiKeyForm,
      )
    ) {
      return
    }

    const createApiKeyPromise = new Promise<void>((resolve, reject) => {
      createApiKeyForm.post(
        API_ROUTES.CREATE_API_KEY(app.slug, String(app.id)),
        {
          preserveScroll: true,
          onSuccess: () => {
            createApiKeyForm.reset()
            closeDialog()
            resolve()
          },
          onError: (errors) => {
            reject(
              new Error(
                (Object.values(errors)[0] as string) ||
                  "Failed to create API key",
              ),
            )
          },
        },
      )
    })

    toast.promise(createApiKeyPromise, {
      loading: <span className="animate-pulse">Creating API Key...</span>,
      success: "API Key created successfully!",
      error: (error) => catchError(error),
    })
  }

  const handleFeaturesChange = useCallback((value: any) => {
    createApiKeyForm.setData("features", value)
  }, [])

  const createApiKeyFields: InertiaFieldConfig<CreateApiKeyPayload>[] = useMemo(
    () => [
      {
        name: "type",
        type: "select",
        label: "Key Type",
        options: [
          { label: "Inbound (System Generated)", value: "inbound" },
          { label: "Outbound (External Service)", value: "outbound" },
        ],
        required: true,
        disabled: createApiKeyForm.processing,
      },
      {
        name: "label",
        type: "text",
        label: "API Key Label",
        placeholder: "Enter a descriptive label (e.g., Production API Key)",
        disabled: createApiKeyForm.processing,
        required: true,
        showRequiredMarker: true,
      },
      {
        name: "key",
        type: "text",
        label: "API Key / Secret (Optional)",
        placeholder: "Leave blank to auto-generate, or paste external key here",
        disabled: createApiKeyForm.processing,
        renderCondition: (data) => data.type === "outbound",
        description:
          "For outbound keys, you can store a 3rd party secret here.",
      },
      {
        name: "key_expiration_id",
        type: "select",
        label: "Expiration",
        placeholder: "Select expiration period",
        options: keyExpirationOptions,
        disabled: createApiKeyForm.processing,
        required: true,
      },
      {
        name: "features",
        type: "text",
        label: "Feature Permissions",
        customComponent: ({ field }) => (
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
      createApiKeyForm.processing,
      features,
      keyExpirationOptions,
      handleFeaturesChange,
    ],
  )

  return (
    <DynamicInertiaForm<CreateApiKeyPayload>
      form={createApiKeyForm}
      onSubmit={handleSubmit}
      fields={createApiKeyFields}
      submitButtonTitle="Create API Key"
      addCancelButton={true}
      onCancel={closeDialog}
      disabled={createApiKeyForm.processing}
      className="space-y-4"
      size="sm"
    />
  )
}
