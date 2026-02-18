import { useForm } from "@inertiajs/react"
import { FormEvent } from "react"
import toast from "react-hot-toast"
import { DynamicInertiaForm } from "@/components/ui/forms/dynamic-inertia-form"
import { API_ROUTES } from "@/config/api-routes"
import { catchError } from "@/lib/catch-error"
import { validateForm } from "@/lib/validate-field"
import { InertiaFieldConfig } from "@/types"
import {
  RegisterAccountPayload,
  registerAccountSchema,
} from "@/types/auth.validation"

export const RegisterForm = () => {
  const registerForm = useForm<RegisterAccountPayload>({
    first_name: "",
    middle_name: "",
    last_name: "",
    email: "",
    password: "",
    password_confirmation: "",
  })

  const registerFields: InertiaFieldConfig<RegisterAccountPayload>[] = [
    {
      name: "first_name",
      type: "text",
      label: "First Name",
      placeholder: "First Name",
      autoFocus: true,
      autoComplete: "given-name",
      disabled: registerForm.processing,
      required: true,
      showRequiredMarker: true,
    },
    {
      name: "middle_name",
      type: "text",
      label: "Middle Name",
      placeholder: "Middle Name (Optional)",
      autoComplete: "additional-name",
      disabled: registerForm.processing,
    },
    {
      name: "last_name",
      type: "text",
      label: "Last Name",
      placeholder: "Last Name",
      autoComplete: "family-name",
      disabled: registerForm.processing,
      required: true,
      showRequiredMarker: true,
    },
    {
      name: "email",
      type: "email",
      label: "Email address",
      placeholder: "email@example.com",
      autoComplete: "email",
      disabled: registerForm.processing,
      required: true,
      showRequiredMarker: true,
    },
    {
      name: "password",
      type: "password-input",
      label: "Password",
      placeholder: "••••••••",
      autoComplete: "new-password",
      disabled: registerForm.processing,
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
      disabled: registerForm.processing,
      required: true,
      showRequiredMarker: true,
    },
  ]

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()

    if (!validateForm(registerAccountSchema, registerForm.data, registerForm)) {
      return
    }

    const registerPromise = new Promise<void>((resolve, reject) => {
      registerForm.post(API_ROUTES.REGISTER, {
        preserveScroll: true,
        onSuccess: () => {
          registerForm.reset()
          resolve()
        },
        onError: (errors) => {
          reject(
            new Error(
              (Object.values(errors)[0] as string) || "Registration failed",
            ),
          )
        },
      })
    })

    toast.promise(registerPromise, {
      loading: "Creating account...",
      success:
        "Account created successfully! Please check your email to verify your account.",
      error: (error) => catchError(error),
    })
  }

  return (
    <DynamicInertiaForm<RegisterAccountPayload>
      form={registerForm}
      fields={registerFields}
      onSubmit={handleSubmit}
      disabled={registerForm.processing}
      submitButtonTitle="Create account"
      submitButtonClassname="w-full"
      size="md"
    />
  )
}
