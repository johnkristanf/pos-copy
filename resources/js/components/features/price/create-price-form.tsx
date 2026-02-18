import { useForm } from "@inertiajs/react"
import { FormEvent, useMemo } from "react"
import toast from "react-hot-toast"
import { DynamicInertiaForm } from "@/components/ui/forms/dynamic-inertia-form"
import { API_ROUTES } from "@/config/api-routes"
import { useDynamicDialog } from "@/hooks/ui/use-dynamic-dialog"
import { catchError } from "@/lib/catch-error"
import { validateForm } from "@/lib/validate-field"
import { InertiaFieldConfig, ItemPrice } from "@/types"
import {
  ItemPricePayload,
  itemPricePayloadSchema,
} from "@/types/items-utility.validation"

interface CreateItemPriceFormProps {
  item_price: ItemPrice
}

export const CreateItemPriceForm = ({
  item_price,
}: CreateItemPriceFormProps) => {
  const { closeDialog } = useDynamicDialog()

  const createItempriceForm = useForm<ItemPricePayload>({
    unit_price: Number(item_price.selling_prices?.unit_price) || 0,
    wholesale_price: Number(item_price.selling_prices?.wholesale_price) || 0,
    credit_price: Number(item_price.selling_prices?.credit_price) || 0,
    item_id: item_price.id,
  })

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()

    const transformedData = {
      ...createItempriceForm.data,
      unit_price: Number(createItempriceForm.data.unit_price),
      wholesale_price: Number(createItempriceForm.data.wholesale_price),
      credit_price: Number(createItempriceForm.data.credit_price),
    }

    if (
      !validateForm(
        itemPricePayloadSchema,
        transformedData,
        createItempriceForm,
      )
    ) {
      return
    }

    const createItemsPricePromise = new Promise<void>((resolve, reject) => {
      createItempriceForm.post(API_ROUTES.ATTACH_PRICE, {
        preserveScroll: true,
        onSuccess: () => {
          createItempriceForm.reset()
          closeDialog()
          resolve()
        },
        onError: (errors) => {
          reject(
            new Error(
              (Object.values(errors)[0] as string) ||
                "Failed to update item's price",
            ),
          )
        },
      })
    })

    toast.promise(createItemsPricePromise, {
      loading: <span className="animate-pulse">Saving item's price...</span>,
      success: "Item's price saved successfully!",
      error: (error) => catchError(error),
    })
  }

  const createItemsPriceFields: InertiaFieldConfig<ItemPricePayload>[] =
    useMemo(
      () => [
        {
          name: "unit_price",
          type: "number",
          label: "Unit Price",
          disabled: createItempriceForm.processing,
        },
        {
          name: "wholesale_price",
          type: "number",
          label: "Wholesale Price",
          disabled: createItempriceForm.processing,
        },
        {
          name: "credit_price",
          type: "number",
          label: "Credit Price",
          disabled: createItempriceForm.processing,
        },
      ],
      [createItempriceForm.processing, createItempriceForm.data],
    )

  return (
    <DynamicInertiaForm<ItemPricePayload>
      form={createItempriceForm}
      onSubmit={handleSubmit}
      fields={createItemsPriceFields}
      submitButtonTitle={
        item_price.selling_prices?.unit_price ? "Update Price" : "Create Price"
      }
      onCancel={closeDialog}
      addCancelButton={true}
      disabled={createItempriceForm.processing}
      size="sm"
    />
  )
}
