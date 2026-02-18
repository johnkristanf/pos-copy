import { useForm } from "@inertiajs/react"
import { FormEvent, useRef } from "react"
import toast from "react-hot-toast"
import { DynamicInertiaForm } from "@/components/ui/forms/dynamic-inertia-form"
import { API_ROUTES } from "@/config/api-routes"
import { APP_CONSTANTS } from "@/config/assets"
import { catchError } from "@/lib/catch-error"
import { validateForm } from "@/lib/validate-field"
import {
  TwoFactorChallengePayload,
  twoFactorChallengeSchema,
} from "@/types/auth.validation"
import { InertiaFieldConfig } from "@/types"

interface TwoFactorChallengeFormProps {
  showRecoveryInput: boolean
}

export const TwoFactorChallengeForm = ({
  showRecoveryInput,
}: TwoFactorChallengeFormProps) => {
  const hasAutoSubmitted = useRef(false)

  const twoFactorForm = useForm<TwoFactorChallengePayload>({
    code: "",
    recovery_code: "",
  })

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()

    if (
      !validateForm(twoFactorChallengeSchema, twoFactorForm.data, twoFactorForm)
    ) {
      return
    }

    const twoFactorPromise = new Promise<void>((resolve, reject) => {
      twoFactorForm.post(API_ROUTES.TWO_FACTOR_CHALLENGE, {
        preserveScroll: true,
        onSuccess: () => {
          twoFactorForm.reset()
          hasAutoSubmitted.current = false
          resolve()
        },
        onError: (errors) => {
          hasAutoSubmitted.current = false
          reject(
            new Error(
              (Object.values(errors)[0] as string) || "Verification failed",
            ),
          )
        },
      })
    })

    toast.promise(twoFactorPromise, {
      loading: "Verifying...",
      success: "Two-factor authentication successful!",
      error: (error) => catchError(error),
    })
  }

  const handleOtpComplete = (value: string) => {
    if (
      !hasAutoSubmitted.current &&
      value.length === APP_CONSTANTS.OTP_MAX_LENGTH
    ) {
      hasAutoSubmitted.current = true

      twoFactorForm.setData({ code: value, recovery_code: "" })

      const twoFactorPromise = new Promise<void>((resolve, reject) => {
        twoFactorForm.post(API_ROUTES.TWO_FACTOR_CHALLENGE, {
          preserveScroll: true,
          onSuccess: () => {
            twoFactorForm.reset()
            hasAutoSubmitted.current = false
            resolve()
          },
          onError: (errors) => {
            hasAutoSubmitted.current = false
            reject(
              new Error(
                (Object.values(errors)[0] as string) || "Verification failed",
              ),
            )
          },
        })
      })

      toast.promise(twoFactorPromise, {
        loading: "Verifying...",
        success: "Two-factor authentication successful!",
        error: (error) => catchError(error),
      })
    }
  }

  const twoFactorFields: InertiaFieldConfig<TwoFactorChallengePayload>[] =
    showRecoveryInput
      ? [
          {
            name: "recovery_code",
            type: "text",
            label: "",
            placeholder: "Enter recovery code",
            autoFocus: true,
            autoComplete: "off",
            disabled: twoFactorForm.processing,
            required: true,
            showRequiredMarker: true,
          },
        ]
      : [
          {
            name: "code",
            type: "otp",
            label: "",
            placeholder: "",
            otpLength: APP_CONSTANTS.OTP_MAX_LENGTH,
            disabled: twoFactorForm.processing,
            wrapperClassName: "flex flex-col items-center justify-center",
            containerClassName: "justify-center",
            onComplete: handleOtpComplete,
            required: true,
            showRequiredMarker: true,
          },
        ]

  return (
    <DynamicInertiaForm<TwoFactorChallengePayload>
      form={twoFactorForm}
      fields={twoFactorFields}
      onSubmit={handleSubmit}
      disabled={twoFactorForm.processing}
      submitButtonTitle="Continue"
      submitButtonClassname="w-full"
      size="md"
    />
  )
}
