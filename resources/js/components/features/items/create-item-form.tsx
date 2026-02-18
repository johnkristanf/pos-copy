import { useForm } from "@inertiajs/react"
import { Package, Ruler, Tag } from "lucide-react"
import { FormEvent, useMemo } from "react"
import toast from "react-hot-toast"
import { match } from "ts-pattern"
import z from "zod"
import { ConversionUnitsField } from "@/components/ui/common/item-conversion-unit-field"
import { DynamicInertiaForm } from "@/components/ui/forms/dynamic-inertia-form"
import { API_ROUTES } from "@/config/api-routes"
import { useDynamicDialog } from "@/hooks/ui/use-dynamic-dialog"
import { catchError } from "@/lib/catch-error"
import { validateForm } from "@/lib/validate-field"
import { FormStep, InertiaFieldConfig } from "@/types"
import {
  baseItemPayloadSchema,
  CreateItemPayload,
  notSetItemPayloadSchema,
  setItemPayloadSchema,
} from "@/types/items.validation"
import { useItemStore } from "./use-item-store"

type CreateItemFormState = Omit<
  CreateItemPayload,
  "min_quantity" | "max_quantity"
> & {
  min_quantity: number
  max_quantity: number
}

export const CreateItemForm = () => {
  const { closeDialog } = useDynamicDialog()

  const items = useItemStore((state) => state.items)
  const storeCategories = useItemStore((state) => state.categories)
  const storeSuppliers = useItemStore((state) => state.suppliers)
  const storeUnitOfMeasures = useItemStore((state) => state.unitOfMeasures)

  const createItemForm = useForm<CreateItemFormState>({
    image_url: "",
    description: "",
    brand: "",
    color: "",
    size: "",
    min_quantity: 0,
    max_quantity: 0,
    category_id: 0,
    supplier_id: 0,
    item_unit_type: "not_set",
    conversion_units: [],
    components_blueprint: [],
  })

  const categoryOptions = useMemo(
    () =>
      storeCategories?.map((cat) => ({
        value: String(cat.id),
        label: cat.name.charAt(0).toUpperCase() + cat.name.slice(1),
      })) ?? [],
    [storeCategories],
  )

  const supplierOptions = useMemo(
    () =>
      storeSuppliers?.map((sup) => ({
        value: String(sup.id),
        label: sup.name.charAt(0).toUpperCase() + sup.name.slice(1),
      })) ?? [],
    [storeSuppliers],
  )

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()

    const transformedData = {
      ...createItemForm.data,
      category_id: Number(createItemForm.data.category_id),
      supplier_id: Number(createItemForm.data.supplier_id),
      min_quantity: Number(createItemForm.data.min_quantity),
      max_quantity: Number(createItemForm.data.max_quantity),
    }

    const result = match(transformedData)
      .with({ item_unit_type: "set" }, (data) => {
        const { conversion_units, ...cleaned } = data
        return {
          schema: setItemPayloadSchema.omit({ image_url: true }),
          payload: cleaned,
        }
      })
      .with({ item_unit_type: "not_set" }, (data) => {
        const { components_blueprint, ...cleaned } = data
        return {
          schema: notSetItemPayloadSchema.omit({ image_url: true }),
          payload: cleaned,
        }
      })
      .otherwise((data) => ({
        schema: baseItemPayloadSchema
          .extend({ item_unit_type: z.enum(["set", "not_set"]) })
          .omit({ image_url: true }),
        payload: data,
      }))

    if (!validateForm(result.schema, result.payload, createItemForm)) {
      return
    }

    const createItemPromise = new Promise<void>((resolve, reject) => {
      createItemForm.transform((data) => {
        const finalData = match(data)
          .with({ item_unit_type: "set" }, (d) => {
            const { conversion_units, ...rest } = d
            return rest as any
          })
          .with({ item_unit_type: "not_set" }, (d) => {
            const { components_blueprint, ...rest } = d
            return rest as any
          })
          .otherwise((d) => d)

        const imgData = finalData.image_url as any
        let blobId: number | undefined
        let imgUrl = null

        if (imgData && typeof imgData === "object") {
          const id = imgData.file_id || imgData.id
          if (id) {
            blobId = Number(id)
          }
          imgUrl = imgData.file_url || imgData.url
        } else if (typeof imgData === "string") {
          imgUrl = imgData
        }

        return {
          ...finalData,
          ...(blobId !== undefined ? { blob_attachment_id: blobId } : {}),
          image_url: imgUrl,
        }
      })

      createItemForm.post(API_ROUTES.CREATE_ITEM, {
        preserveScroll: true,
        forceFormData: true,
        onSuccess: () => {
          createItemForm.reset()
          closeDialog()
          resolve()
        },
        onError: (errors: any) => {
          reject(
            new Error(
              (Object.values(errors)[0] as string) || "Failed to create item",
            ),
          )
        },
      })
    })

    toast.promise(createItemPromise, {
      loading: <span className="animate-pulse">Creating item...</span>,
      success: "Item created successfully!",
      error: (error) => catchError(error),
    })
  }

  const createItemFields: InertiaFieldConfig<CreateItemFormState>[] = useMemo(
    () => [
      {
        name: "image_url",
        type: "blob-attachment",
        label: "Image URL",
        placeholder: "Enter image URL (optional)",
        disabled: createItemForm.processing,
        accept: "image/png, image/jpeg, image/webp",
      },
      {
        name: "description",
        type: "text",
        label: "Description",
        placeholder: "e.g., Blue T-Shirt, Wire Nails, Screwdriver",
        disabled: createItemForm.processing,
        required: true,
        showRequiredMarker: true,
      },
      {
        name: "brand",
        type: "text",
        label: "Brand",
        placeholder: "e.g., Nike, Adidas, Sony",
        disabled: createItemForm.processing,
      },
      {
        name: "color",
        type: "text",
        label: "Color",
        placeholder: "e.g., Red, Blue, Transparent",
        disabled: createItemForm.processing,
      },
      {
        name: "size",
        type: "text",
        label: "Size",
        placeholder: "e.g., Small, Medium, Large, 32GB",
        disabled: createItemForm.processing,
      },
      {
        name: "min_quantity",
        type: "number",
        label: "Minimum Stocks",
        placeholder: "Enter minimum stock level",
        disabled: createItemForm.processing,
      },
      {
        name: "max_quantity",
        type: "number",
        label: "Maximum Stocks",
        placeholder: "Enter maximum stock level",
        disabled: createItemForm.processing,
      },
      {
        name: "category_id",
        type: "select",
        label: "Category",
        placeholder: "Select category",
        options: categoryOptions,
        disabled: createItemForm.processing,
        required: true,
        showRequiredMarker: true,
      },
      {
        name: "supplier_id",
        type: "select",
        label: "Supplier",
        placeholder: "Select supplier",
        options: supplierOptions,
        disabled: createItemForm.processing,
        required: true,
        showRequiredMarker: true,
      },
      {
        name: "item_unit_type",
        type: "select",
        label: "Unit Type",
        placeholder: "Select unit type",
        options: [
          { value: "not_set", label: "Not Set" },
          { value: "set", label: "Set" },
        ],
        disabled: createItemForm.processing,
      },
      {
        name: "conversion_units" as keyof CreateItemFormState,
        type: "custom",
        label: "Conversion Units",
        customComponent: () => (
          <ConversionUnitsField
            form={createItemForm as any}
            disabled={createItemForm.processing}
            itemUnitType={createItemForm.data.item_unit_type}
            unit_of_measures={storeUnitOfMeasures}
            items={items}
          />
        ),
      },
    ],
    [
      createItemForm.processing,
      categoryOptions,
      supplierOptions,
      createItemForm.data.item_unit_type,
      storeUnitOfMeasures,
      items,
      createItemForm.data.min_quantity,
      createItemForm.data.max_quantity,
    ],
  )

  const formSteps: FormStep[] = useMemo(
    () => [
      {
        id: "item-details",
        title: "Item Details",
        icon: <Package className="h-4 w-4" />,
        fields: ["description", "brand", "color", "size", "image_url"],
      },
      {
        id: "inventory",
        title: "Inventory",
        icon: <Tag className="h-4 w-4" />,
        fields: ["min_quantity", "max_quantity", "category_id", "supplier_id"],
      },
      {
        id: "unit",
        title: "Unit of Measure",
        icon: <Ruler className="h-4 w-4" />,
        fields: ["item_unit_type", "conversion_units"],
      },
    ],
    [],
  )

  return (
    <DynamicInertiaForm<CreateItemFormState>
      form={createItemForm}
      onSubmit={handleSubmit}
      fields={createItemFields}
      submitButtonTitle="Create Item"
      onCancel={closeDialog}
      disabled={createItemForm.processing}
      size="sm"
      isMultiStepForm={true}
      steps={formSteps}
      validateStepBeforeNext={true}
      className="max-w-132.5"
    />
  )
}
