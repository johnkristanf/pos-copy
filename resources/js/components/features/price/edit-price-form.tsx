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

interface UpdateItemPriceFormProps {
  item_price: ItemPrice
}
export const UpdateItemPriceForm = ({
  item_price,
}: UpdateItemPriceFormProps) => {
  const { closeDialog } = useDynamicDialog()

  const updateItempriceForm = useForm<ItemPricePayload>({
    unit_price: Number(item_price.selling_prices?.unit_price) || 0,
    wholesale_price: Number(item_price.selling_prices?.wholesale_price) || 0,
    credit_price: Number(item_price.selling_prices?.credit_price) || 0,
    item_id: item_price.id,
  })

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()

    const transformedData = {
      ...updateItempriceForm.data,
      unit_price: Number(updateItempriceForm.data.unit_price),
      wholesale_price: Number(updateItempriceForm.data.wholesale_price),
      credit_price: Number(updateItempriceForm.data.credit_price),
    }

    if (
      !validateForm(
        itemPricePayloadSchema,
        transformedData,
        updateItempriceForm,
      )
    ) {
      return
    }

    const updateItemsPricePromise = new Promise<void>((resolve, reject) => {
      updateItempriceForm.put(API_ROUTES.UPDATE_PRICE(String(item_price.id)), {
        preserveScroll: true,
        onSuccess: () => {
          updateItempriceForm.reset()
          closeDialog()
          resolve()
        },
        onError: (errors) => {
          reject(
            new Error(
              (Object.values(errors)[0] as string) ||
                "Failed to edit item's price",
            ),
          )
        },
      })
    })

    toast.promise(updateItemsPricePromise, {
      loading: <span className="animate-pulse">Updating item's price...</span>,
      success: "Item's price updated successfully!",
      error: (error) => catchError(error),
    })
  }

  const updateItemsPriceFields: InertiaFieldConfig<ItemPricePayload>[] =
    useMemo(
      () => [
        {
          name: "unit_price",
          type: "number",
          label: "Unit Price",
          disabled: updateItempriceForm.processing,
        },
        {
          name: "wholesale_price",
          type: "number",
          label: "Wholesale Price",
          disabled: updateItempriceForm.processing,
        },
        {
          name: "credit_price",
          type: "number",
          label: "Credit Price",
          disabled: updateItempriceForm.processing,
        },
      ],
      [updateItempriceForm.processing, updateItempriceForm.data],
    )

  return (
    <DynamicInertiaForm<ItemPricePayload>
      form={updateItempriceForm}
      onSubmit={handleSubmit}
      fields={updateItemsPriceFields}
      submitButtonTitle="Update Item's Price"
      onCancel={closeDialog}
      addCancelButton={true}
      disabled={updateItempriceForm.processing}
      size="sm"
    />
  )
}
