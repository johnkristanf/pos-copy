import { useForm } from "@inertiajs/react"
import { FormEvent } from "react"
import toast from "react-hot-toast"
import { DynamicInertiaForm } from "@/components/ui/forms/dynamic-inertia-form"
import { API_ROUTES } from "@/config/api-routes"
import { useDynamicDialog } from "@/hooks/ui/use-dynamic-dialog"
import { catchError } from "@/lib/catch-error"
import { validateForm } from "@/lib/validate-field"
import {
  ChangeAccountPasswordPayload,
  changeAccountPasswordSchema,
} from "@/types/auth.validation"
import { InertiaFieldConfig } from "@/types"

export const ChangePasswordForm = () => {
  const { closeDialog } = useDynamicDialog()
  const changePasswordForm = useForm<ChangeAccountPasswordPayload>({
    current_password: "",
    password: "",
    password_confirmation: "",
  })

  const changePasswordFields: InertiaFieldConfig<ChangeAccountPasswordPayload>[] =
    [
      {
        name: "current_password",
        type: "password-input",
        label: "Current Password",
        placeholder: "Enter your current password",
        autoComplete: "current-password",
        disabled: changePasswordForm.processing,
        required: true,
        showRequiredMarker: true,
      },
      {
        name: "password",
        type: "password-input",
        label: "New Password",
        placeholder: "Enter your new password",
        autoComplete: "new-password",
        disabled: changePasswordForm.processing,
        required: true,
        showRequiredMarker: true,
        showStrengthIndicator: true,
      },
      {
        name: "password_confirmation",
        type: "password-input",
        label: "Confirm New Password",
        placeholder: "Confirm your new password",
        autoComplete: "new-password",
        disabled: changePasswordForm.processing,
        required: true,
        showRequiredMarker: true,
      },
    ]

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()

    if (
      !validateForm(
        changeAccountPasswordSchema,
        changePasswordForm.data,
        changePasswordForm,
      )
    ) {
      return
    }

    const changePasswordPromise = new Promise<void>((resolve, reject) => {
      changePasswordForm.put(API_ROUTES.CHANGE_PASSWORD, {
        preserveScroll: true,
        onSuccess: () => {
          changePasswordForm.reset()
          resolve()
          closeDialog()
        },
        onError: (errors) => {
          reject(
            new Error(
              (Object.values(errors)[0] as string) || "Password change failed",
            ),
          )
          closeDialog()
        },
      })
    })

    toast.promise(changePasswordPromise, {
      loading: "Changing password...",
      success: "Password changed successfully!",
      error: (error) => catchError(error),
    })
  }

  return (
    <DynamicInertiaForm<ChangeAccountPasswordPayload>
      form={changePasswordForm}
      fields={changePasswordFields}
      onSubmit={handleSubmit}
      disabled={changePasswordForm.processing}
      submitButtonTitle="Change Password"
      submitButtonClassname="w-full"
      addCancelButton={true}
      size="md"
    />
  )
}
