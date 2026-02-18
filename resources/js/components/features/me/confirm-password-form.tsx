import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import toast from "react-hot-toast"
import { Button } from "@/components/ui/common/button"
import { DynamicForm } from "@/components/ui/forms/dynamic-form"
import { useConfirmPassword } from "@/hooks/api/auth"
import { FieldConfig } from "@/types"
import {
  ConfirmAccountPasswordPayload,
  confirmAccountPasswordSchema,
} from "@/types/auth.validation"

interface ConfirmPasswordFormProps {
  onSuccess: () => void
  onCancel: () => void
  onConfirmed: () => void
}

export const ConfirmPasswordForm = ({
  // onSuccess,
  onCancel,
  onConfirmed,
}: ConfirmPasswordFormProps) => {
  const { mutate: confirmPasswordMutation, isPending } = useConfirmPassword()
  const confirmPasswordForm = useForm<ConfirmAccountPasswordPayload>({
    resolver: zodResolver(confirmAccountPasswordSchema),
    defaultValues: {
      password: "",
    },
  })

  const handleSubmit = async (data: ConfirmAccountPasswordPayload) => {
    await toast.promise(
      new Promise((resolve, reject) => {
        confirmPasswordMutation(data, {
          onSuccess: (response) => {
            confirmPasswordForm.reset()
            onConfirmed()
            resolve(response.message)
          },
          onError: (error) => {
            reject(error.message)
          },
        })
      }),
      {
        loading: "Confirming password...",
        success: (message) => message as string,
        error: (error) => error as string,
      },
    )
  }

  const confirmPasswordField: FieldConfig<ConfirmAccountPasswordPayload>[] = [
    {
      name: "password",
      type: "password",
      label: "Password",
      placeholder: "Enter your password",
      disabled: isPending,
    },
  ]

  return (
    <div className="w-full space-y-3">
      <DynamicForm
        form={confirmPasswordForm}
        onSubmit={handleSubmit}
        fields={confirmPasswordField}
        submitButtonTitle="Confirm"
        addCancelButton={true}
        className="space-y-3"
        submitButtonClassname="flex-1"
        disabled={isPending}
      />
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={onCancel}
        disabled={isPending}
      >
        Cancel
      </Button>
    </div>
  )
}
