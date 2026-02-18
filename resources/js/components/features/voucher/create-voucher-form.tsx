import { useForm } from "@inertiajs/react"
import { Gift, Settings } from "lucide-react"
import { FormEvent, useMemo } from "react"
import toast from "react-hot-toast"
import { DynamicInertiaForm } from "@/components/ui/forms/dynamic-inertia-form"
import { API_ROUTES } from "@/config/api-routes"
import { useDynamicDialog } from "@/hooks/ui/use-dynamic-dialog"
import { catchError } from "@/lib/catch-error"
import { validateForm } from "@/lib/validate-field"
import { FormStep, InertiaFieldConfig } from "@/types"
import {
  VoucherPayload,
  VoucherSchema,
} from "@/types/operation-utility.validation"

export const CreateVoucherForm = () => {
  const { closeDialog } = useDynamicDialog()

  const createVoucherForm = useForm<VoucherPayload>({
    code: "",
    description: "",
    type: "amount",
    amount: 0,
    min_spend: 0,
    capped_amount: 0,
  })

  const selectVoucherType = [
    {
      id: "percentage",
      name: "Percentage",
    },
    {
      id: "amount",
      name: "Amount",
    },
    {
      id: "to_cash_price",
      name: "To Cash Price",
    },
    {
      id: "complimentary",
      name: "Complimentary",
    },
  ]

  const voucherOptions = useMemo(
    () =>
      selectVoucherType?.map((vouType) => ({
        value: String(vouType.id),
        label: vouType.name.charAt(0).toUpperCase() + vouType.name.slice(1),
      })) ?? [],
    [selectVoucherType],
  )

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()

    if (
      !validateForm(VoucherSchema, createVoucherForm.data, createVoucherForm)
    ) {
      return
    }

    const createVoucherPromise = new Promise<void>((resolve, reject) => {
      createVoucherForm.post(API_ROUTES.CREATE_VOUCHER, {
        preserveScroll: true,
        onSuccess: () => {
          createVoucherForm.reset()
          closeDialog()
          resolve()
        },
        onError: (errors) => {
          reject(
            new Error(
              (Object.values(errors)[0] as string) ||
                "Failed to create voucher",
            ),
          )
        },
      })
    })

    toast.promise(createVoucherPromise, {
      loading: <span className="animate-pulse">Creating voucher...</span>,
      success: "Voucher created successfully!",
      error: (error) => catchError(error),
    })
  }

  const createVoucherFields: InertiaFieldConfig<VoucherPayload>[] = useMemo(
    () => [
      {
        name: "code",
        type: "text",
        label: "Code",
        placeholder: "e.g., SUMMER25, WELCOME10, FREESHIP",
        disabled: createVoucherForm.processing,
        required: true,
        showRequiredMarker: true,
      },
      {
        name: "description",
        type: "text",
        label: "Description",
        placeholder: "e.g., 25% off summer collection",
        disabled: createVoucherForm.processing,
        required: true,
        showRequiredMarker: true,
      },
      {
        name: "type",
        type: "select",
        label: "Discount Type",
        options: voucherOptions,
        disabled: createVoucherForm.processing,
        required: true,
        showRequiredMarker: true,
      },
      {
        name: "amount",
        type: "number",
        label: "Specific",
        disabled: createVoucherForm.processing,
        required: true,
        showRequiredMarker: true,
      },
      {
        name: "min_spend",
        type: "number",
        label: "Minimum Spend",
        disabled: createVoucherForm.processing,
        placeholder: "Enter minimum spend amount",
      },
      {
        name: "capped_amount",
        type: "number",
        label: "Capped At",
        disabled: createVoucherForm.processing,
        placeholder: "Enter maximum discount cap",
      },
    ],
    [createVoucherForm.processing, voucherOptions],
  )

  const formSteps: FormStep[] = useMemo(
    () => [
      {
        id: "voucher-details",
        title: "Voucher Details",
        icon: <Gift className="h-4 w-4" />,
        fields: ["code", "description", "type", "amount"],
      },
      {
        id: "advance-option",
        title: "Advance Option",
        icon: <Settings className="h-4 w-4" />,
        fields: ["min_spend", "capped_amount"],
      },
    ],
    [],
  )

  return (
    <DynamicInertiaForm<VoucherPayload>
      form={createVoucherForm}
      onSubmit={handleSubmit}
      fields={createVoucherFields}
      submitButtonTitle="Create Voucher"
      onCancel={closeDialog}
      disabled={createVoucherForm.processing}
      size="sm"
      isMultiStepForm={true}
      steps={formSteps}
      validateStepBeforeNext={true}
      schema={VoucherSchema}
    />
  )
}
