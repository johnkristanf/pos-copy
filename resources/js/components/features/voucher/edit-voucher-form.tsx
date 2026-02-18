import { useForm } from "@inertiajs/react"
import { BadgePercent, Gift } from "lucide-react"
import { FormEvent, useMemo } from "react"
import toast from "react-hot-toast"
import { DynamicInertiaForm } from "@/components/ui/forms/dynamic-inertia-form"
import { API_ROUTES } from "@/config/api-routes"
import { useDynamicDialog } from "@/hooks/ui/use-dynamic-dialog"
import { catchError } from "@/lib/catch-error"
import { validateForm } from "@/lib/validate-field"
import { FormStep, InertiaFieldConfig, Voucher } from "@/types"
import {
  VoucherPayload,
  VoucherSchema,
} from "@/types/operation-utility.validation"

interface EditVoucherProps {
  voucher: Voucher
}

export const EditVoucherForm = ({ voucher }: EditVoucherProps) => {
  const { closeDialog } = useDynamicDialog()

  const editVoucherForm = useForm<VoucherPayload>({
    code: voucher.code,
    description: voucher.description,
    type: voucher.type,
    amount: Number(voucher.amount),
    min_spend: Number(voucher.min_spend),
    capped_amount: Number(voucher.capped_amount),
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

    if (!validateForm(VoucherSchema, editVoucherForm.data, editVoucherForm)) {
      return
    }

    const editVoucherPromise = new Promise<void>((resolve, reject) => {
      editVoucherForm.put(API_ROUTES.UPDATE_VOUCHER(String(voucher.id)), {
        preserveScroll: true,
        onSuccess: () => {
          editVoucherForm.reset()
          closeDialog()
          resolve()
        },
        onError: (errors) => {
          reject(
            new Error(
              (Object.values(errors)[0] as string) || "Failed to edit voucher",
            ),
          )
        },
      })
    })

    toast.promise(editVoucherPromise, {
      loading: <span className="animate-pulse">Editing voucher...</span>,
      success: "Voucher edited successfully!",
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
        disabled: editVoucherForm.processing,
        required: true,
        showRequiredMarker: true,
      },
      {
        name: "description",
        type: "text",
        label: "Description",
        placeholder: "e.g., 25% off summer collection",
        disabled: editVoucherForm.processing,
        required: true,
        showRequiredMarker: true,
      },
      {
        name: "type",
        type: "select",
        label: "Discount Type",
        options: voucherOptions,
        disabled: editVoucherForm.processing,
        required: true,
        showRequiredMarker: true,
      },
      {
        name: "amount",
        type: "number",
        label: "Specific",
        disabled: editVoucherForm.processing,
        required: true,
        showRequiredMarker: true,
      },
      {
        name: "min_spend",
        type: "number",
        label: "Minimum Spend",
        disabled: editVoucherForm.processing,
        placeholder: "Enter minimum spend amount",
      },
      {
        name: "capped_amount",
        type: "number",
        label: "Capped At",
        disabled: editVoucherForm.processing,
        placeholder: "Enter maximum discount cap",
      },
    ],
    [editVoucherForm.processing, voucherOptions],
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
        icon: <BadgePercent className="h-4 w-4" />,
        fields: ["min_spend", "capped_amount"],
      },
    ],
    [],
  )

  return (
    <DynamicInertiaForm<VoucherPayload>
      form={editVoucherForm}
      onSubmit={handleSubmit}
      fields={createVoucherFields}
      submitButtonTitle="Edit Voucher"
      onCancel={closeDialog}
      disabled={editVoucherForm.processing}
      size="sm"
      isMultiStepForm={true}
      steps={formSteps}
      validateStepBeforeNext={true}
      schema={VoucherSchema}
    />
  )
}
