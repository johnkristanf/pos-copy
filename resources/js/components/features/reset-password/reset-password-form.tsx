import { useForm } from "@inertiajs/react"
import { FormEvent } from "react"
import toast from "react-hot-toast"
import { DynamicInertiaForm } from "@/components/ui/forms/dynamic-inertia-form"
import { API_ROUTES } from "@/config/api-routes"
import { catchError } from "@/lib/catch-error"
import { validateForm } from "@/lib/validate-field"
import { InertiaFieldConfig } from "@/types"
import {
  ResetAccountPasswordPayload,
  resetAccountPasswordSchema,
} from "@/types/auth.validation"

interface ResetPasswordFormProps {
  token: string
  email: string
}

export const ResetPasswordForm = ({ token, email }: ResetPasswordFormProps) => {
  const resetPasswordForm = useForm<ResetAccountPasswordPayload>({
    token,
    email,
    password: "",
    password_confirmation: "",
  })

  const resetPasswordFields: InertiaFieldConfig<ResetAccountPasswordPayload>[] =
    [
      {
        name: "email",
        type: "email",
        label: "Email address",
        placeholder: "email@example.com",
        autoComplete: "email",
        disabled: true,
        required: true,
        showRequiredMarker: true,
      },
      {
        name: "password",
        type: "password-input",
        label: "Password",
        placeholder: "••••••••",
        autoFocus: true,
        autoComplete: "new-password",
        disabled: resetPasswordForm.processing,
        required: true,
        showRequiredMarker: true,
        showStrengthIndicator: true,
      },
      {
        name: "password_confirmation",
        type: "password-input",
        label: "Confirm password",
        placeholder: "••••••••",
        autoComplete: "new-password",
        disabled: resetPasswordForm.processing,
        required: true,
        showRequiredMarker: true,
      },
    ]

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()

    if (
      !validateForm(
        resetAccountPasswordSchema,
        resetPasswordForm.data,
        resetPasswordForm,
      )
    ) {
      return
    }

    const resetPasswordPromise = new Promise<void>((resolve, reject) => {
      resetPasswordForm.post(API_ROUTES.RESET_PASSWORD, {
        preserveScroll: true,
        onSuccess: () => {
          resetPasswordForm.reset()
          resolve()
        },
        onError: (errors) => {
          reject(
            new Error(
              (Object.values(errors)[0] as string) || "Password reset failed",
            ),
          )
        },
      })
    })

    toast.promise(resetPasswordPromise, {
      loading: "Resetting password...",
      success: "Password reset successfully!",
      error: (error) => catchError(error),
    })
  }

  return (
    <DynamicInertiaForm<ResetAccountPasswordPayload>
      form={resetPasswordForm}
      fields={resetPasswordFields}
      onSubmit={handleSubmit}
      disabled={resetPasswordForm.processing}
      submitButtonTitle="Reset password"
      submitButtonClassname="w-full"
      size="md"
    />
  )
}
