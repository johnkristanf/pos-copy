import { useForm } from "@inertiajs/react"
import { FormEvent } from "react"
import toast from "react-hot-toast"
import { DynamicInertiaForm } from "@/components/ui/forms/dynamic-inertia-form"
import { API_ROUTES } from "@/config/api-routes"
import { catchError } from "@/lib/catch-error"
import { validateForm } from "@/lib/validate-field"
import { InertiaFieldConfig } from "@/types"
import {
  ForgotAccountPasswordPayload,
  forgotAccountPasswordSchema,
} from "@/types/auth.validation"

export const ForgotPasswordForm = () => {
  const forgotPasswordForm = useForm<ForgotAccountPasswordPayload>({
    email: "",
  })

  const forgotPasswordFields: InertiaFieldConfig<ForgotAccountPasswordPayload>[] =
    [
      {
        name: "email",
        type: "email",
        label: "Email address",
        placeholder: "email@example.com",
        autoFocus: true,
        autoComplete: "email",
        disabled: forgotPasswordForm.processing,
        required: true,
        showRequiredMarker: true,
      },
    ]

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()

    if (
      !validateForm(
        forgotAccountPasswordSchema,
        forgotPasswordForm.data,
        forgotPasswordForm,
      )
    ) {
      return
    }

    const forgotPasswordPromise = new Promise<void>((resolve, reject) => {
      forgotPasswordForm.post(API_ROUTES.FORGOT_PASSWORD, {
        preserveScroll: true,
        onSuccess: () => {
          forgotPasswordForm.reset()
          resolve()
        },
        onError: (errors) => {
          reject(
            new Error(
              (Object.values(errors)[0] as string) ||
                "Failed to send reset link",
            ),
          )
        },
      })
    })

    toast.promise(forgotPasswordPromise, {
      loading: "Sending reset link...",
      success: "Password reset link sent! Check your email.",
      error: (error) => catchError(error),
    })
  }

  return (
    <DynamicInertiaForm<ForgotAccountPasswordPayload>
      form={forgotPasswordForm}
      fields={forgotPasswordFields}
      onSubmit={handleSubmit}
      disabled={forgotPasswordForm.processing}
      submitButtonTitle="Email password reset link"
      submitButtonClassname="w-full"
      size="md"
    />
  )
}
