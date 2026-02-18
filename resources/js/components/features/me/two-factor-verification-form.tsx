import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useRef } from "react"
import { useForm } from "react-hook-form"
import toast from "react-hot-toast"
import { Button } from "@/components/ui/common/button"
import { DynamicForm } from "@/components/ui/forms/dynamic-form"
import { APP_CONSTANTS } from "@/config/assets"
import { useTwoFactorVerification } from "@/hooks/api/auth"
import { FieldConfig } from "@/types"
import {
  TwoFactorVerificationPayload,
  twoFactorVerificationSchema,
} from "@/types/auth.validation"

export const TwoFactorVerificationForm = ({
  onClose,
  onBack,
}: {
  onClose: () => void
  onBack: () => void
}) => {
  const { mutate: twoFactorVerificationMutation, isPending } =
    useTwoFactorVerification()
  const pinInputContainerRef = useRef<HTMLDivElement>(null)

  const twoFactorVerificationForm = useForm<TwoFactorVerificationPayload>({
    resolver: zodResolver(twoFactorVerificationSchema),
    defaultValues: {
      code: "",
    },
  })

  useEffect(() => {
    setTimeout(() => {
      pinInputContainerRef.current?.querySelector("input")?.focus()
    }, 0)
  }, [])

  const handleSubmit = async (data: TwoFactorVerificationPayload) => {
    await toast.promise(
      new Promise((resolve, reject) => {
        twoFactorVerificationMutation(data, {
          onSuccess: (response: any) => {
            twoFactorVerificationForm.reset()
            onClose()
            resolve(response?.message || "Verification successful")
          },
          onError: (error: any) => {
            const errorMessage =
              error?.response?.data?.message ||
              error?.message ||
              "Invalid verification code"

            reject(errorMessage)
          },
        })
      }),
      {
        loading: "Verifying code...",
        success: (message) => String(message),
        error: (error) => String(error),
      },
    )
  }

  const twoFactorVerificationField: FieldConfig<TwoFactorVerificationPayload>[] =
    [
      {
        name: "code",
        type: "otp",
        label: "",
        placeholder: "Enter verification code",
        otpLength: APP_CONSTANTS.OTP_MAX_LENGTH,
        containerClassName: "flex justify-center",
        disabled: isPending,
        onComplete: (value: string) => {
          if (value.length === APP_CONSTANTS.OTP_MAX_LENGTH) {
            handleSubmit({ code: value })
          }
        },
      },
    ]

  return (
    <div ref={pinInputContainerRef} className="w-full space-y-3">
      <DynamicForm
        form={twoFactorVerificationForm}
        onSubmit={handleSubmit}
        fields={twoFactorVerificationField}
        submitButtonTitle="Confirm"
        className="space-y-3"
        submitButtonClassname="flex-1"
        disabled={isPending}
      />
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={onBack}
        disabled={isPending}
      >
        Back
      </Button>
    </div>
  )
}
