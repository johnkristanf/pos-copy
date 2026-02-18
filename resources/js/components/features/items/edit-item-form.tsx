import { useForm } from "@inertiajs/react"
import { Package, Ruler, Tag } from "lucide-react"
import { FormEvent, useMemo } from "react"
import toast from "react-hot-toast"
import { match } from "ts-pattern"
import z from "zod"
import { ConversionUnitsField } from "@/components/ui/common/item-conversion-unit-field"
import { DynamicInertiaForm } from "@/components/ui/forms/dynamic-inertia-form"
import { StockLevelInputs } from "@/components/ui/inputs/min-max-stock-level-input"
import { API_ROUTES } from "@/config/api-routes"
import { useDynamicDialog } from "@/hooks/ui/use-dynamic-dialog"
import { catchError } from "@/lib/catch-error"
import { validateForm } from "@/lib/validate-field"
import {
  Category,
  FormStep,
  InertiaFieldConfig,
  Item,
  Supplier,
  UnitOfMeasure,
} from "@/types"
import {
  baseItemPayloadSchema,
  CreateItemPayload,
  notSetItemPayloadSchema,
  setItemPayloadSchema,
} from "@/types/items.validation"

interface EditFormProps {
  category: Category[]
  supplier: Supplier[]
  unit_of_measures: UnitOfMeasure[]
  items: Item[]
  item: Item
}

export const EditItemForm = ({
  category,
  supplier,
  unit_of_measures,
  items,
  item,
}: EditFormProps) => {
  const { closeDialog } = useDynamicDialog()

  const initialImage =
    (item as any).blobAttachments?.find(
      (att: any) => att.file_url === item.image_url,
    ) ||
    item.image_url ||
    ""

  const editItemForm = useForm<CreateItemPayload>({
    image_url: initialImage,
    description: item.description,
    brand: item.brand || "",
    color: item.color || "",
    size: item.size || "",
    min_quantity: item.min_quantity || 0,
    max_quantity: item.max_quantity || 0,
    category_id: item.category_id,
    supplier_id: item.supplier_id,
    item_unit_type:
      item.components_blueprint != null && item.components_blueprint.length > 0
        ? "set"
        : "not_set",
    conversion_units:
      item.conversion_units?.map((unit: any) => ({
        ...unit,
        conversion_factor: Number(unit.conversion_factor),
      })) || [],
    components_blueprint: item.components_blueprint || [],
  })

  const dynamicSchema = useMemo(() => {
    return match(editItemForm.data.item_unit_type)
      .with("set", () => setItemPayloadSchema)
      .with("not_set", () => notSetItemPayloadSchema)
      .otherwise(() =>
        baseItemPayloadSchema.extend({
          item_unit_type: z.enum(["set", "not_set"]),
        }),
      )
  }, [editItemForm.data.item_unit_type])

  const categoryOptions = useMemo(
    () =>
      category.map((cat) => ({
        value: String(cat.id),
        label: cat.name.charAt(0).toUpperCase() + cat.name.slice(1),
      })),
    [category],
  )

  const supplierOptions = useMemo(
    () =>
      supplier.map((sup) => ({
        value: String(sup.id),
        label: sup.name.charAt(0).toUpperCase() + sup.name.slice(1),
      })),
    [supplier],
  )

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()

    const rawData = editItemForm.data as any

    const transformedData = {
      ...rawData,
      category_id: Number(rawData.category_id),
      supplier_id: Number(rawData.supplier_id),
      min_quantity: Number(rawData.min_quantity),
      max_quantity: Number(rawData.max_quantity),
      conversion_units: rawData.conversion_units?.map((unit: any) => ({
        ...unit,
        purchase_uom_id: Number(unit.purchase_uom_id),
        base_uom_id: Number(unit.base_uom_id),
        conversion_factor: Number(unit.conversion_factor),
      })),
      components_blueprint: rawData.components_blueprint?.map((comp: any) => ({
        ...comp,
        child_item_id: Number(comp.child_item_id),
        quantity: Number(comp.quantity),
      })),
    }

    const { schema, data: dataToValidate } = match(transformedData)
      .with({ item_unit_type: "set" }, (data) => {
        const { conversion_units, image_url, ...rest } = data as any
        return {
          schema: setItemPayloadSchema,
          data: rest,
        }
      })
      .with({ item_unit_type: "not_set" }, (data) => {
        const { components_blueprint, image_url, ...rest } = data as any
        return {
          schema: notSetItemPayloadSchema,
          data: rest,
        }
      })
      .otherwise((data) => {
        const { image_url, ...rest } = data as any
        return {
          schema: baseItemPayloadSchema.extend({
            item_unit_type: z.enum(["set", "not_set"]),
          }),
          data: rest,
        }
      })

    if (!validateForm(schema, dataToValidate, editItemForm)) {
      return
    }

    const editItemPromise = new Promise<void>((resolve, reject) => {
      editItemForm.transform((data) => {
        const payload = data as any
        const imgData = payload.image_url
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

        const transformed = {
          ...payload,
          category_id: Number(payload.category_id),
          supplier_id: Number(payload.supplier_id),
          min_quantity: Number(payload.min_quantity),
          max_quantity: Number(payload.max_quantity),
          conversion_units: payload.conversion_units?.map((unit: any) => ({
            ...unit,
            purchase_uom_id: Number(unit.purchase_uom_id),
            base_uom_id: Number(unit.base_uom_id),
            conversion_factor: Number(unit.conversion_factor),
          })),
          components_blueprint: payload.components_blueprint?.map(
            (comp: any) => ({
              ...comp,
              child_item_id: Number(comp.child_item_id),
              quantity: Number(comp.quantity),
            }),
          ),
          ...(blobId !== undefined ? { blob_attachment_id: blobId } : {}),
          image_url: imgUrl,
        }

        return match(transformed)
          .with({ item_unit_type: "not_set" }, (d) => {
            const { components_blueprint, ...rest } = d as any
            return rest as any
          })
          .with({ item_unit_type: "set" }, (d) => {
            const { conversion_units, ...rest } = d as any
            return rest as any
          })
          .otherwise((d) => d)
      })

      editItemForm.patch(API_ROUTES.UPDATE_ITEM(String(item.id)), {
        preserveScroll: true,
        onSuccess: () => {
          editItemForm.reset()
          closeDialog()
          resolve()
        },
        onError: (errors) => {
          reject(
            new Error(
              (Object.values(errors)[0] as string) || "Failed to edit item",
            ),
          )
        },
      })
    })

    toast.promise(editItemPromise, {
      loading: <span className="animate-pulse">Editing item...</span>,
      success: "Item edited successfully!",
      error: (error) => catchError(error),
    })
  }

  const editItemFields: InertiaFieldConfig<CreateItemPayload>[] = useMemo(
    () => [
      {
        name: "image_url",
        type: "blob-attachment",
        label: "Image URL",
        placeholder: "Enter image URL (optional)",
        disabled: editItemForm.processing,
        accept: "image/png, image/jpeg, image/webp",
      },
      {
        name: "description",
        type: "text",
        label: "Description",
        placeholder: "e.g., Blue T-Shirt, Wire Nails, Screwdriver",
        disabled: editItemForm.processing,
        required: true,
        showRequiredMarker: true,
      },
      {
        name: "brand",
        type: "text",
        label: "Brand",
        placeholder: "e.g., Nike, Adidas, Sony",
        disabled: editItemForm.processing,
      },
      {
        name: "color",
        type: "text",
        label: "Color",
        placeholder: "e.g., Red, Blue, Transparent",
        disabled: editItemForm.processing,
      },
      {
        name: "size",
        type: "text",
        label: "Size",
        placeholder: "e.g., Small, Medium, Large, 32GB",
        disabled: editItemForm.processing,
      },
      {
        name: "min_quantity",
        type: "custom",
        customComponent: () => <StockLevelInputs form={editItemForm} />,
      },
      {
        name: "category_id",
        type: "select",
        label: "Category",
        placeholder: "Select category",
        options: categoryOptions,
        disabled: editItemForm.processing,
        required: true,
        showRequiredMarker: true,
      },
      {
        name: "supplier_id",
        type: "select",
        label: "Supplier",
        placeholder: "Select supplier",
        options: supplierOptions,
        disabled: editItemForm.processing,
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
        disabled: editItemForm.processing,
      },
      {
        name: "conversion_units" as keyof CreateItemPayload,
        type: "custom",
        label: "Conversion Units",
        customComponent: () => (
          <ConversionUnitsField
            form={editItemForm}
            disabled={editItemForm.processing}
            itemUnitType={editItemForm.data.item_unit_type}
            unit_of_measures={unit_of_measures}
            items={items}
          />
        ),
      },
    ],
    [
      editItemForm.processing,
      categoryOptions,
      supplierOptions,
      editItemForm.data.item_unit_type,
      unit_of_measures,
      items,
      editItemForm.data.min_quantity,
      editItemForm.data.max_quantity,
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
        title: "Inventory Details",
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
    <DynamicInertiaForm<CreateItemPayload>
      form={editItemForm}
      onSubmit={handleSubmit}
      fields={editItemFields}
      submitButtonTitle="Update Item"
      onCancel={closeDialog}
      disabled={editItemForm.processing}
      size="sm"
      isMultiStepForm={true}
      steps={formSteps}
      validateStepBeforeNext={true}
      className="max-w-132.5"
      schema={dynamicSchema}
    />
  )
}
