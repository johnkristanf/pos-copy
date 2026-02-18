import { useForm } from "@inertiajs/react"
import { CircleSlash, Settings } from "lucide-react"
import { FormEvent, useMemo } from "react"
import toast from "react-hot-toast"
import { DynamicInertiaForm } from "@/components/ui/forms/dynamic-inertia-form"
import { API_ROUTES } from "@/config/api-routes"
import { useDynamicDialog } from "@/hooks/ui/use-dynamic-dialog"
import { catchError } from "@/lib/catch-error"
import { validateForm } from "@/lib/validate-field"
import { FormStep, InertiaFieldConfig, Role } from "@/types"
import {
  VoidReasonPayload,
  voidReasonPayloadSchema,
} from "@/types/operation-utility.validation"

interface CreateVoidReasonFormProps {
  roles: Role[]
}
export const CreateVoidReasonForm = ({ roles }: CreateVoidReasonFormProps) => {
  const { closeDialog } = useDynamicDialog()
  const createVoidReasonForm = useForm<VoidReasonPayload>({
    void_reason: "",
    require_password: false,
    roles_require_credentials: [],
  })

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()

    if (
      !validateForm(
        voidReasonPayloadSchema,
        createVoidReasonForm.data,
        createVoidReasonForm,
      )
    ) {
      return
    }

    const createVoidReasonPromise = new Promise<void>((resolve, reject) => {
      createVoidReasonForm.post(API_ROUTES.CREATE_VOID_REASON, {
        preserveScroll: true,
        onSuccess: () => {
          createVoidReasonForm.reset()
          closeDialog()
          resolve()
        },
        onError: (errors) => {
          reject(
            new Error(
              (Object.values(errors)[0] as string) ||
                "Failed to create void reason",
            ),
          )
        },
      })
    })

    toast.promise(createVoidReasonPromise, {
      loading: <span className="animate-pulse">Creating void reason...</span>,
      success: "Void reason created successfully!",
      error: (error) => catchError(error),
    })
  }

  const createVoidReasonFields: InertiaFieldConfig<VoidReasonPayload>[] =
    useMemo(
      () => [
        {
          name: "void_reason",
          type: "text",
          label: "Void Reason",
          placeholder: "e.g., Customer Changed Mind, Wrong Item Scanned",
          disabled: createVoidReasonForm.processing,
          required: true,
          showRequiredMarker: true,
        },
        {
          name: "require_password",
          type: "toggle",
          label: "Require Password",
          description: "Manager password required to use this void reason",
          disabled: createVoidReasonForm.processing,
        },
        {
          name: "roles_require_credentials",
          type: "multi-select",
          label: "Select roles that will override through password",
          options: roles
            .filter((role) => role.code > 400 && role.code < 900)
            .map((role) => ({
              label: role.name,
              value: role.id,
            })),
          placeholder: "Select roles",
          renderCondition: (formData) => formData.require_password,
          disabled: createVoidReasonForm.processing,
        },
      ],
      [createVoidReasonForm.processing, createVoidReasonForm.data],
    )

  const formSteps: FormStep[] = useMemo(
    () => [
      {
        id: "void-reason",
        title: "Void Reason",
        icon: <CircleSlash className="h-4 w-4" />,
        fields: ["void_reason"],
      },
      {
        id: "advanvce-options",
        title: "Advance Options",
        icon: <Settings className="h-4 w-4" />,
        fields: ["require_password", "roles_require_credentials"],
      },
    ],
    [],
  )

  return (
    <DynamicInertiaForm<VoidReasonPayload>
      form={createVoidReasonForm}
      onSubmit={handleSubmit}
      fields={createVoidReasonFields}
      submitButtonTitle="Create Void Reason"
      addCancelButton={true}
      onCancel={closeDialog}
      disabled={createVoidReasonForm.processing}
      size="sm"
      isMultiStepForm={true}
      steps={formSteps}
    />
  )
}
