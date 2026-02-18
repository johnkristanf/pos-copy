import { useForm } from "@inertiajs/react"
import { BadgePercent, Bolt, Settings } from "lucide-react"
import { FormEvent, useState } from "react"
import toast from "react-hot-toast"
import { useItemsUtilityContext } from "@/components/contexts/items-utility"
import { DynamicInertiaForm } from "@/components/ui/forms/dynamic-inertia-form"
import { API_ROUTES } from "@/config/api-routes"
import { useDynamicDialog } from "@/hooks/ui/use-dynamic-dialog"
import { catchError } from "@/lib/catch-error"
import { validateForm } from "@/lib/validate-field"
import { Discount, FormStep, InertiaFieldConfig } from "@/types"
import {
  DiscountPayload,
  DiscountSchema,
} from "@/types/operation-utility.validation"
import { DiscountDurationFields } from "./discount-duration-fields"
import { DiscountTypeFields } from "./discount-type-fields"

interface EditDiscountFormProps {
  discount: Discount
}

export const EditDiscountForm = ({ discount }: EditDiscountFormProps) => {
  const { closeDialog } = useDynamicDialog()
  const { categories, items } = useItemsUtilityContext()

  const [enableRequiredQty, setEnableRequiredQty] = useState(
    (discount.min_purchase_qty || 0) > 0,
  )

  const [enableItemCategorySelect, setEnableItemCategorySelect] = useState(
    (discount.item_category_type || "all_item") !== "all_item",
  )

  const editDiscountForm = useForm<DiscountPayload>({
    name: discount.name,
    description: discount.description ?? "",
    discount_type: discount.discount_type,
    amount: Number(discount.amount),
    min_purchase_qty: discount.min_purchase_qty || 0,
    min_spend: Number(discount.min_spend) || 0,
    capped_amount: Number(discount.capped_amount) || 0,
    start_date: discount.start_date ?? "",
    start_time: discount.start_time ?? "",
    end_date: discount.end_date ?? "",
    end_time: discount.end_time ?? "",
    item_category_type: discount.item_category_type || "all_item",
    category_ids: discount.category_ids ?? [],
    item_ids: discount.item_ids ?? [],
  })

  const selectDiscountType = [
    { id: "percentage", name: "Percentage" },
    { id: "amount", name: "Amount" },
  ]

  const selectCategoryType = [
    { id: "all_item", name: "All Items" },
    { id: "select_item", name: "Select Item" },
    { id: "select_category", name: "Select Category" },
    { id: "select_supplier", name: "Select Supplier" },
  ]

  const discountOptions = selectDiscountType.map((disType) => ({
    value: String(disType.id),
    label: disType.name.charAt(0).toUpperCase() + disType.name.slice(1),
  }))

  const selectCategoryOptions = selectCategoryType.map((catType) => ({
    value: String(catType.id),
    label: catType.name.charAt(0).toUpperCase() + catType.name.slice(1),
  }))

  const categoryOptions =
    categories?.map((cat: any) => ({
      value: cat.id,
      label: cat.name.charAt(0).toUpperCase() + cat.name.slice(1),
    })) ?? []

  const itemOptions =
    items?.map((item: any) => ({
      value: item.id,
      label: item.description,
      attributes: `${item.brand}  ${item.color} | ${item.size}`,
      sku: item.sku,
    })) ?? []

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()

    const submissionData = {
      ...editDiscountForm.data,
      min_purchase_qty: enableRequiredQty
        ? editDiscountForm.data.min_purchase_qty
        : 0,
      item_category_type: enableItemCategorySelect
        ? editDiscountForm.data.item_category_type
        : "all_item",
    }

    if (!validateForm(DiscountSchema, submissionData, editDiscountForm)) {
      return
    }

    const editDiscountPromise = new Promise<void>((resolve, reject) => {
      editDiscountForm.put(API_ROUTES.UPDATE_DISCOUNT(discount.id), {
        preserveScroll: true,
        onSuccess: () => {
          editDiscountForm.reset()
          closeDialog()
          resolve()
        },
        onError: (errors) => {
          reject(
            new Error(
              (Object.values(errors)[0] as string) ||
                "Failed to update discount",
            ),
          )
        },
      })
    })

    toast.promise(editDiscountPromise, {
      loading: <span className="animate-pulse">Updating discount...</span>,
      success: "Discount updated successfully!",
      error: (error) => catchError(error),
    })
  }

  const editCategoryFields: InertiaFieldConfig<DiscountPayload>[] = [
    {
      name: "name",
      type: "text",
      label: "Name",
      placeholder: "e.g, 11.11 Sale, Mid-year Sale, Christmas Sale",
      disabled: editDiscountForm.processing,
      required: true,
      showRequiredMarker: true,
      span: 2,
    },
    {
      name: "description",
      type: "textarea",
      label: "Description",
      placeholder: "e.g., Seasonal clearance for old stock",
      disabled: editDiscountForm.processing,
      required: true,
      showRequiredMarker: true,
      span: 2,
    },
    {
      name: "discount_type",
      type: "custom",
      span: 2,
      customComponent: () => (
        <DiscountTypeFields
          form={editDiscountForm}
          discountOptions={discountOptions}
        />
      ),
    },
    // Amount is handled by custom component
    {
      name: "amount",
      type: "number",
      hidden: true,
    },
    {
      name: "start_date",
      type: "custom",
      span: 2,
      customComponent: () => <DiscountDurationFields form={editDiscountForm} />,
    },
    // End date is handled by custom component
    {
      name: "end_date",
      type: "text",
      hidden: true,
    },
    {
      name: "enable_item_category_select" as any,
      type: "switch",
      label: "Items or Category",
      description:
        "Apply this discount to selected items, selected category or all items.",
      span: 2,
      onChange: (value: boolean) => {
        setEnableItemCategorySelect(value)
        if (!value) {
          editDiscountForm.setData("item_category_type", "all_item")
          editDiscountForm.setData("item_ids", [])
          editDiscountForm.setData("category_ids", [])
        }
      },
    },
    {
      name: "item_category_type",
      type: "toggle-group",
      options: selectCategoryOptions,
      renderCondition: () => enableItemCategorySelect,
      disabled: editDiscountForm.processing,
      span: 2,
      onChange: (value: string) => {
        if (value !== "select_item") {
          editDiscountForm.setData("item_ids", [])
        }
        if (value !== "select_category") {
          editDiscountForm.setData("category_ids", [])
        }
      },
    },
    {
      name: "category_ids",
      type: "popover",
      label: "Category",
      placeholder: "Select category",
      options: categoryOptions,
      disabled: editDiscountForm.processing,
      required: true,
      showRequiredMarker: true,
      span: 2,
      renderCondition: () =>
        enableItemCategorySelect &&
        editDiscountForm.data.item_category_type === "select_category",
    },
    {
      name: "item_ids",
      type: "popover",
      label: "Select Items",
      placeholder: "Select items",
      options: itemOptions,
      disabled: editDiscountForm.processing,
      showSearch: true,
      showClearButton: true,
      showRequiredMarker: true,
      span: 2,
      renderCondition: () =>
        enableItemCategorySelect &&
        editDiscountForm.data.item_category_type === "select_item",
    },
    {
      name: "enable_required_qty" as any,
      type: "switch",
      label: "Quantity",
      description: "Apply this discount to a set quantity.",
      disabled: editDiscountForm.processing,
      span: 2,
      onChange: (value: boolean) => {
        setEnableRequiredQty(value)
        if (!value) {
          editDiscountForm.setData("min_purchase_qty", 0)
        }
      },
    },
    {
      name: "min_purchase_qty",
      type: "number",
      label: "Quantity",
      disabled: editDiscountForm.processing || !enableRequiredQty,
      renderCondition: () => enableRequiredQty,
      placeholder: "Enter minimum quantity required",
      showRequiredMarker: true,
      span: 2,
    },
    {
      name: "min_spend",
      type: "number",
      label: "Minimum Spend",
      disabled: editDiscountForm.processing,
      placeholder: "Enter minimum spend amount",
      span: 2,
    },
    {
      name: "capped_amount",
      type: "number",
      label: "Capped At",
      disabled: editDiscountForm.processing,
      placeholder: "Enter maximum discount cap",
      span: 2,
    },
  ]

  const formSteps: FormStep[] = [
    {
      id: "discount-details",
      title: "Discount Details",
      icon: <BadgePercent className="h-4 w-4" />,
      fields: ["name", "description", "discount_type", "amount"],
    },
    {
      id: "discount-rules",
      title: "Discount Rules",
      icon: <Bolt className="h-4 w-4" />,
      fields: [
        "start_date",
        "end_date",
        "enable_item_category_select",
        "category_ids",
        "item_ids",
        "enable_required_qty",
        "item_category_type",
        "min_purchase_qty",
      ],
    },
    {
      id: "advance-option",
      title: "Advance Option",
      icon: <Settings className="h-4 w-4" />,
      fields: ["min_spend", "capped_amount"],
    },
  ]

  return (
    <DynamicInertiaForm<DiscountPayload>
      form={editDiscountForm}
      onSubmit={handleSubmit}
      fields={editCategoryFields}
      submitButtonTitle="Edit Discount"
      onCancel={closeDialog}
      disabled={editDiscountForm.processing}
      size="sm"
      isMultiStepForm={true}
      steps={formSteps}
      validateStepBeforeNext={true}
      schema={DiscountSchema}
      gridColumns={2}
    />
  )
}
