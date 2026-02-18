import { useForm } from "@inertiajs/react"
import { FormEvent, useMemo } from "react"
import toast from "react-hot-toast"
import { DynamicInertiaForm } from "@/components/ui/forms/dynamic-inertia-form"
import { API_ROUTES } from "@/config/api-routes"
import { useDynamicDialog } from "@/hooks/ui/use-dynamic-dialog"
import { catchError } from "@/lib/catch-error"
import { validateForm } from "@/lib/validate-field"
import { FormStep, InertiaFieldConfig, Role, VoidReason } from "@/types"
import {
  VoidReasonPayload,
  voidReasonPayloadSchema,
} from "@/types/operation-utility.validation"
import { CircleSlash, Settings } from "lucide-react"

interface EditVoidReasonFormProps {
  roles: Role[]
  voidReason: VoidReason
}

export const EditVoidReasonForm = ({
  voidReason,
  roles,
}: EditVoidReasonFormProps) => {
  const { closeDialog } = useDynamicDialog()
  const editVoidReasonForm = useForm<VoidReasonPayload>({
    void_reason: voidReason.void_reason,
    require_password: voidReason.require_password,
    roles_require_credentials: [],
  })

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()

    if (
      !validateForm(
        voidReasonPayloadSchema,
        editVoidReasonForm.data,
        editVoidReasonForm,
      )
    ) {
      return
    }

    const updateVoidReasonPromise = new Promise<void>((resolve, reject) => {
      editVoidReasonForm.put(API_ROUTES.UPDATE_VOID_REASON(voidReason.id), {
        preserveScroll: true,
        onSuccess: () => {
          closeDialog()
          resolve()
        },
        onError: (errors) => {
          reject(
            new Error(
              (Object.values(errors)[0] as string) ||
                "Failed to update void reason",
            ),
          )
        },
      })
    })

    toast.promise(updateVoidReasonPromise, {
      loading: <span className="animate-pulse">Updating void reason...</span>,
      success: "Void reason updated successfully!",
      error: (error) => catchError(error),
    })
  }

  const editVoidReasonFields: InertiaFieldConfig<VoidReasonPayload>[] = useMemo(
    () => [
      {
        name: "void_reason",
        type: "text",
        label: "Void Reason",
        placeholder: "e.g., Customer Changed Mind, Wrong Item Scanned",
        disabled: editVoidReasonForm.processing,
        required: true,
        showRequiredMarker: true,
      },
      {
        name: "require_password",
        type: "toggle",
        label: "Require Password",
        description: "Manager password required to use this void reason",
        disabled: editVoidReasonForm.processing,
      },
      {
        name: "roles_require_credentials",
        type: "multi-select",
        label: "Select roles that will override through password",
        options: roles.map((role) => ({
          label: role.name,
          value: role.id,
        })),
        placeholder: "Select roles",
        renderCondition: (formData) => formData.require_password,
        disabled: editVoidReasonForm.processing,
      },
    ],
    [editVoidReasonForm.processing, editVoidReasonForm.data],
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
      form={editVoidReasonForm}
      onSubmit={handleSubmit}
      fields={editVoidReasonFields}
      submitButtonTitle="Update Void Reason"
      addCancelButton={true}
      onCancel={closeDialog}
      disabled={editVoidReasonForm.processing}
      size="sm"
      isMultiStepForm={true}
      steps={formSteps}
      debug
    />
  )
}
