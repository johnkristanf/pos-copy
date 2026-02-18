import { useForm } from "@inertiajs/react"
import { FormEvent } from "react"
import toast from "react-hot-toast"
import { DynamicInertiaForm } from "@/components/ui/forms/dynamic-inertia-form"
import { API_ROUTES } from "@/config/api-routes"
import { catchError } from "@/lib/catch-error"
import { validateForm } from "@/lib/validate-field"
import { VerifyEmailPayload, verifyEmailSchema } from "@/types/auth.validation"
import { InertiaFieldConfig } from "@/types"

interface VerifyEmailFormProps {
  status?: string
}

export const VerifyEmailForm = ({ status }: VerifyEmailFormProps) => {
  const verifyEmailForm = useForm<VerifyEmailPayload>({} as VerifyEmailPayload)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()

    if (
      !validateForm(verifyEmailSchema, verifyEmailForm.data, verifyEmailForm)
    ) {
      return
    }

    const verifyEmailPromise = new Promise<void>((resolve, reject) => {
      verifyEmailForm.post(API_ROUTES.RESEND_VERIFICATION_EMAIL, {
        preserveScroll: true,
        onSuccess: () => {
          verifyEmailForm.reset()
          resolve()
        },
        onError: (errors) => {
          reject(
            new Error(
              (Object.values(errors)[0] as string) ||
                "Failed to send verification email",
            ),
          )
        },
      })
    })

    toast.promise(verifyEmailPromise, {
      loading: "Sending verification email...",
      success: "A new verification link has been sent to your email address.",
      error: (error) => catchError(error),
    })
  }

  const verifyEmailFields: InertiaFieldConfig<VerifyEmailPayload>[] = []

  return (
    <div className="space-y-6 text-center">
      {status === "verification-link-sent" && (
        <div className="mb-4 text-center text-sm font-medium text-green-600">
          A new verification link has been sent to the email address you
          provided during registration.
        </div>
      )}

      <DynamicInertiaForm<VerifyEmailPayload>
        // @ts-expect-error
        form={verifyEmailForm}
        fields={verifyEmailFields}
        onSubmit={handleSubmit}
        disabled={verifyEmailForm.processing}
        submitButtonTitle="Resend verification email"
        submitButtonClassname="w-full"
        size="md"
      />
    </div>
  )
}
