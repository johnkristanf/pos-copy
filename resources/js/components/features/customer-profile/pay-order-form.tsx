import { useForm } from "@inertiajs/react"
import { FormEvent, useMemo } from "react"
import { DynamicInertiaForm } from "@/components/ui/forms/dynamic-inertia-form"
import { formatCurrency } from "@/lib/format"
import { validateForm } from "@/lib/validate-field"
import { InertiaFieldConfig, Order } from "@/types"
import { PayOrderPayload, payOrderSchema } from "@/types/customers.validation"

export const PayOrderForm = ({
  order,
  onSubmit,
}: {
  order: Order
  onSubmit: (amount: number) => void
}) => {
  const form = useForm<PayOrderPayload>({
    amount: Number(order.total_payable),
  })

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()

    if (!validateForm(payOrderSchema, form.data, form)) {
      return
    }

    if (form.data.amount > Number(order.total_payable)) {
      form.setError(
        "amount",
        `Amount cannot exceed ${formatCurrency(Number(order.total_payable))}`,
      )
      return
    }

    onSubmit(form.data.amount)
  }

  const fields: InertiaFieldConfig<PayOrderPayload>[] = useMemo(
    () => [
      {
        name: "amount",
        type: "number",
        label: "Payment Amount",
        placeholder: "Enter amount",
        description: `Maximum payable: ${formatCurrency(Number(order.total_payable))}`,
        required: true,
        showRequiredMarker: true,
      },
    ],
    [order.total_payable],
  )

  return (
    <div className="pt-4">
      <DynamicInertiaForm<PayOrderPayload>
        form={form}
        onSubmit={handleSubmit}
        fields={fields}
        submitButtonTitle="Continue"
      />
    </div>
  )
}
