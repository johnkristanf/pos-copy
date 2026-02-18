import { useForm } from "@inertiajs/react"
import { FormEvent } from "react"
import toast from "react-hot-toast"
import { DynamicInertiaForm } from "@/components/ui/forms/dynamic-inertia-form"
import { API_ROUTES } from "@/config/api-routes"
import { catchError } from "@/lib/catch-error"
import { validateForm } from "@/lib/validate-field"
import { InertiaFieldConfig } from "@/types"

import { RememberMeToggle } from "./remember-me-toggle"
import {
  LoginAccountPayload,
  loginAccountSchema,
} from "@/types/auth.validation"

export const LoginForm = () => {
  const loginForm = useForm<LoginAccountPayload>({
    email: "",
    password: "",
    remember: false,
  })

  const loginFields: InertiaFieldConfig<LoginAccountPayload>[] = [
    {
      name: "email",
      type: "email",
      label: "Email",
      placeholder: "email@example.com",
      autoFocus: true,
      autoComplete: "email",
      disabled: loginForm.processing,
      required: true,
    },
    {
      name: "password",
      type: "password-input",
      label: "Password",
      placeholder: "••••••••",
      autoComplete: "current-password",
      disabled: loginForm.processing,
      required: true,
    },
    {
      name: "remember",
      type: "checkbox",
      label: "",
      placeholder: "Remember me",
      customComponent: RememberMeToggle,
      disabled: loginForm.processing,
      onChange: (value: boolean) => {
        loginForm.setData("remember", value)
      },
    },
  ]

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()

    if (!validateForm(loginAccountSchema, loginForm.data, loginForm)) {
      return
    }

    const loginPromise = new Promise<void>((resolve, reject) => {
      loginForm.post(API_ROUTES.LOGIN, {
        preserveScroll: true,
        onSuccess: () => {
          loginForm.reset()
          resolve()
        },
        onError: (errors) => {
          reject(
            new Error((Object.values(errors)[0] as string) || "Login failed"),
          )
        },
      })
    })

    toast.promise(loginPromise, {
      loading: "Logging in...",
      success: "Successfully logged in",
      error: (error) => catchError(error),
    })
  }

  return (
    <DynamicInertiaForm<LoginAccountPayload>
      form={loginForm}
      fields={loginFields}
      onSubmit={handleSubmit}
      disabled={loginForm.processing}
      submitButtonTitle="Log-in"
      submitButtonClassname="w-full"
      size="md"
    />
  )
}
