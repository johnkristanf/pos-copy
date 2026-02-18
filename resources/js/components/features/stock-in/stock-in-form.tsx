import { useForm } from "@inertiajs/react"
import { Package, Tag } from "lucide-react"
import { FormEvent, useEffect, useMemo, useState } from "react"
import toast from "react-hot-toast"
import { match } from "ts-pattern"
import z from "zod"
import { ConversionUnitsField } from "@/components/ui/common/item-conversion-unit-field"
import { Label } from "@/components/ui/common/label"
import { DynamicInertiaForm } from "@/components/ui/forms/dynamic-inertia-form"
import { StockLevelInputs } from "@/components/ui/inputs/min-max-stock-level-input"
import { API_ROUTES } from "@/config/api-routes"
import { useDynamicDialog } from "@/hooks/ui/use-dynamic-dialog"
import { catchError } from "@/lib/catch-error"
import { validateForm } from "@/lib/validate-field"
import {
  ComponentBlueprint,
  ConversionUnit,
  FormStep,
  InertiaFieldConfig,
  Item,
  StockIn,
  StockItemWithLocationId,
} from "@/types"
import {
  baseStockPayloadSchema,
  CreateStockPayload,
  notSetStockPayloadSchema,
  setStockPayloadSchema,
} from "@/types/items.validation"
import { ItemSelector } from "./stock-in-item-selector"
import { StockInLocation } from "./stock-in-location"
import { useStockInStore } from "./use-stock-in-store"

interface StockInProps {
  initialData: Partial<StockIn>
}

type StockInFormState = Omit<
  CreateStockPayload,
  "min_quantity" | "max_quantity"
> & {
  min_quantity: number
  max_quantity: number
  stock_in_uom_id?: number | null
}

export const StockInForm = ({ initialData }: StockInProps) => {
  const { closeDialog } = useDynamicDialog()

  const {
    categories: category,
    suppliers: supplier,
    items,
    unitOfMeasures: unit_of_measures,
    stockLocations: stockLocation,
  } = useStockInStore()

  const [manualStockIn, setManualStockIn] = useState<boolean>(false)

  const [stockDetails, setStockDetails] = useState<{
    store: number
    warehouse: number
    total: number
  } | null>(null)
  const [locationStocks, setLocationStocks] = useState<Record<number, number>>(
    {},
  )

  const isLoadingItems = items === undefined
  const isLoadingDependencies =
    !category || category.length === 0 || !supplier || supplier.length === 0

  useEffect(() => {
    const hasInitialData =
      !initialData || Object.keys(initialData).length === 0 || !initialData.item
    setManualStockIn(hasInitialData)
  }, [initialData])

  const defaultValues: StockInFormState = {
    purchase_order_item_id: initialData.purchase_order_item_id ?? "",
    item_id: initialData.item?.id,
    description: initialData.item?.description ?? "",
    image_url: initialData.item?.image_url ?? "",
    brand: initialData.item?.brand ?? "",
    color: initialData.item?.color ?? "",
    size: initialData.item?.size ?? "",
    min_quantity: initialData.item?.min_quantity ?? 0,
    max_quantity: initialData.item?.max_quantity ?? 0,
    category_id:
      initialData.item?.category?.id ??
      initialData.item?.category_id ??
      category?.[0]?.id ??
      0,
    supplier_id:
      initialData.item?.supplier?.id ??
      initialData.item?.supplier_id ??
      supplier?.[0]?.id ??
      0,
    item_unit_type: initialData.item?.item_unit_type ?? "not_set",
    stock_locations_qty: [
      {
        id: 0,
        quantity: initialData.purchased_quantity ?? 0,
      },
    ],
    components_blueprint:
      initialData.item?.components_blueprint?.map(
        (comp: ComponentBlueprint) => ({
          ...comp,
          child_item_id: Number(comp.child_item_id),
          quantity: Number(comp.quantity),
        }),
      ) || [],
    conversion_units:
      initialData.item?.conversion_units?.map((unit: ConversionUnit) => ({
        ...unit,
        purchase_uom_id: Number(unit.purchase_uom_id),
        base_uom_id: Number(unit.base_uom_id),
        conversion_factor: Number(unit.conversion_factor),
      })) || [],
    stock_in_uom_id: null,
  }

  const createStockForm = useForm<StockInFormState>(defaultValues)

  useEffect(() => {
    if (category?.length > 0 && createStockForm.data.category_id === 0) {
      createStockForm.setData("category_id", category[0].id)
    }
  }, [category])

  useEffect(() => {
    if (supplier?.length > 0 && createStockForm.data.supplier_id === 0) {
      createStockForm.setData("supplier_id", supplier[0].id)
    }
  }, [supplier])

  const dynamicSchema = useMemo(() => {
    switch (createStockForm.data.item_unit_type) {
      case "set":
        return setStockPayloadSchema
      case "not_set":
        return notSetStockPayloadSchema.extend({
          stock_in_uom_id: z.number().optional().nullable(),
        })
      default:
        return baseStockPayloadSchema.extend({
          item_unit_type: z.enum(["set", "not_set"]),
          stock_in_uom_id: z.number().optional().nullable(),
        })
    }
  }, [createStockForm.data.item_unit_type])

  const handleSelectExistingItem = (item: Item) => {
    const getLocationId = (s: StockItemWithLocationId) =>
      s.location_id ?? s.location?.id

    const stocksMap: Record<number, number> = {}
    item.stocks?.forEach((s) => {
      const locId = getLocationId(s as StockItemWithLocationId)
      if (locId) {
        stocksMap[locId] =
          (stocksMap[locId] || 0) + (Number(s.available_quantity) || 0)
      }
    })
    setLocationStocks(stocksMap)

    const storeStock =
      item.stocks?.reduce((acc, s) => {
        if (getLocationId(s as StockItemWithLocationId) === 1) {
          return acc + (Number(s.available_quantity) || 0)
        }
        return acc
      }, 0) ?? 0

    const warehouseStock =
      item.stocks?.reduce((acc, s) => {
        if (getLocationId(s as StockItemWithLocationId) === 2) {
          return acc + (Number(s.available_quantity) || 0)
        }
        return acc
      }, 0) ?? 0

    const totalStock = storeStock + warehouseStock

    setStockDetails({
      store: storeStock,
      warehouse: warehouseStock,
      total: totalStock,
    })

    createStockForm.setData({
      ...createStockForm.data,
      item_id: item.id,
      description: item.description,
      image_url: item.image_url ?? "",
      brand: item.brand ?? "",
      color: item.color ?? "",
      size: item.size ?? "",
      min_quantity: item.min_quantity ?? 0,
      max_quantity: item.max_quantity ?? 0,
      category_id: item.category_id,
      supplier_id: item.supplier_id,
      item_unit_type: (item.item_unit_type as "set" | "not_set") ?? "not_set",
      conversion_units:
        (item.conversion_units as unknown as ConversionUnit[])?.map((unit) => ({
          ...unit,
          purchase_uom_id: Number(unit.purchase_uom_id),
          base_uom_id: Number(unit.base_uom_id),
          conversion_factor: Number(unit.conversion_factor),
        })) || [],
      components_blueprint:
        (item.components_blueprint as unknown as ComponentBlueprint[])?.map(
          (comp) => ({
            ...comp,
            child_item_id: Number(comp.child_item_id),
            quantity: Number(comp.quantity),
          }),
        ) || [],
    })
    createStockForm.clearErrors()
  }

  const categoryOptions = useMemo(
    () =>
      category?.map((cat) => ({
        value: cat.id,
        label: cat.name.charAt(0).toUpperCase() + cat.name.slice(1),
      })) || [],
    [category],
  )

  const supplierOptions = useMemo(
    () =>
      supplier?.map((sup) => ({
        value: sup.id,
        label: sup.name.charAt(0).toUpperCase() + sup.name.slice(1),
      })) || [],
    [supplier],
  )

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()

    const transformedData = {
      ...createStockForm.data,
      category_id: Number(createStockForm.data.category_id),
      supplier_id: Number(createStockForm.data.supplier_id),
      min_quantity: Number(createStockForm.data.min_quantity),
      max_quantity: Number(createStockForm.data.max_quantity),
    }

    const { schema, data: dataToValidate } = match(transformedData)
      .with({ item_unit_type: "set" }, (data) => {
        const { conversion_units, ...rest } = data
        return {
          schema: setStockPayloadSchema,
          data: rest,
        }
      })
      .with({ item_unit_type: "not_set" }, (data) => {
        const { components_blueprint, ...rest } = data
        return {
          schema: notSetStockPayloadSchema.extend({
            stock_in_uom_id: z.number().optional().nullable(),
          }),
          data: rest,
        }
      })
      .otherwise((data) => ({
        schema: baseStockPayloadSchema.extend({
          item_unit_type: z.enum(["set", "not_set"]),
          stock_in_uom_id: z.number().optional().nullable(),
        }),
        data: data,
      }))

    if (!validateForm(schema, dataToValidate, createStockForm)) {
      return
    }

    const createItemPromise = new Promise<void>((resolve, reject) => {
      createStockForm.transform((data) => {
        const imgData = data.image_url as any
        let imgUrl = null
        let blobId = null

        if (imgData && typeof imgData === "object") {
          if (imgData.file_url) {
            imgUrl = imgData.file_url
          }
          if (imgData.file_id || imgData.id) {
            blobId = Number(imgData.file_id || imgData.id)
          }
        } else if (typeof imgData === "string") {
          imgUrl = imgData
        }

        const transformed = {
          ...data,
          category_id: Number(data.category_id),
          supplier_id: Number(data.supplier_id),
          min_quantity: Number(data.min_quantity),
          max_quantity: Number(data.max_quantity),
          image_url: imgUrl,
          ...(blobId ? { blob_attachment_id: blobId } : {}),
          unit_price: initialData.unit_price,
        }

        return match(transformed)
          .with({ item_unit_type: "not_set" }, (d) => {
            const { components_blueprint, ...rest } = d
            return rest as any
          })
          .with({ item_unit_type: "set" }, (d) => {
            const { conversion_units, ...rest } = d
            return rest as any
          })
          .otherwise((d) => d)
      })

      createStockForm.post(API_ROUTES.CREATE_STOCK_IN, {
        preserveScroll: true,
        onSuccess: () => {
          createStockForm.reset()
          closeDialog()
          resolve()
        },
        onError: (errors) => {
          reject(
            new Error(
              (Object.values(errors)[0] as string) || "Failed to stock in",
            ),
          )
        },
      })
    })

    toast.promise(createItemPromise, {
      loading: <span className="animate-pulse">Creating item...</span>,
      success: "Stock in was successful!",
      error: (error) => catchError(error),
    })
  }

  const conversionUnitsHash = useMemo(() => {
    const units = createStockForm.data.conversion_units || []
    return units
      .map(
        (u) => `${u.purchase_uom_id}-${u.base_uom_id}-${u.conversion_factor}`,
      )
      .join("|")
  }, [createStockForm.data.conversion_units])

  const uomOptions = useMemo(() => {
    if (createStockForm.data.item_unit_type !== "not_set") return []

    const units = createStockForm.data.conversion_units || []
    if (units.length === 0) return []

    const options = new Map<number, { label: string }>()

    const getName = (id: number) =>
      unit_of_measures?.find((u) => u.id === id)?.name || `Unit ${id}`

    units.forEach((u) => {
      options.set(Number(u.purchase_uom_id), {
        label: getName(Number(u.purchase_uom_id)),
      })

      if (!options.has(Number(u.base_uom_id))) {
        options.set(Number(u.base_uom_id), {
          label: getName(Number(u.base_uom_id)),
        })
      }
    })

    return Array.from(options.entries()).map(([id, { label }]) => ({
      value: id,
      label: label,
    }))
  }, [
    createStockForm.data.item_unit_type,
    conversionUnitsHash,
    unit_of_measures,
  ])

  const selectedUomFactor = useMemo(() => {
    const selectedId = createStockForm.data.stock_in_uom_id
    if (!selectedId) return 1

    const units = createStockForm.data.conversion_units || []
    let factor = 1
    let currentId = Number(selectedId)
    let found = true

    const visited = new Set<number>()

    while (found) {
      if (visited.has(currentId)) {
        console.warn(
          "Circular dependency detected in conversion units for UOM ID:",
          currentId,
        )
        break
      }
      visited.add(currentId)

      const unit = units.find((u) => Number(u.purchase_uom_id) === currentId)
      if (unit) {
        factor *= Number(unit.conversion_factor)
        currentId = Number(unit.base_uom_id)
      } else {
        found = false
      }
    }
    return factor
  }, [createStockForm.data.stock_in_uom_id, conversionUnitsHash])

  const selectedUomName = useMemo(() => {
    const id = createStockForm.data.stock_in_uom_id
    if (!id) return undefined
    return unit_of_measures?.find((u) => u.id === Number(id))?.name || "Units"
  }, [createStockForm.data.stock_in_uom_id, unit_of_measures])

  const shouldShowUomField =
    createStockForm.data.item_unit_type === "not_set" &&
    (createStockForm.data.conversion_units?.length ?? 0) > 0

  const createStockField = useMemo<InertiaFieldConfig<StockInFormState>[]>(
    () => [
      {
        name: "image_url",
        type: "blob-attachment",
        label: "Image URL",
        placeholder: "Enter image URL (optional)",
        disabled: createStockForm.processing,
      },
      {
        name: "description",
        type: "text",
        label: "Item Name",
        placeholder: "e.g., Blue T-Shirt, Wire Nails, Screwdriver",
        disabled: createStockForm.processing,
        required: true,
        showRequiredMarker: true,
      },
      {
        name: "brand",
        type: "text",
        label: "Brand",
        placeholder: "e.g., Nike, Adidas, Sony",
        disabled: createStockForm.processing,
      },
      {
        name: "color",
        type: "text",
        label: "Color",
        placeholder: "e.g., Red, Blue, Transparent",
        disabled: createStockForm.processing,
      },
      {
        name: "size",
        type: "text",
        label: "Size",
        placeholder: "e.g., Small, Medium, Large, 32GB",
        disabled: createStockForm.processing,
      },
      {
        name: "min_quantity",
        type: "custom",
        customComponent: () => <StockLevelInputs form={createStockForm} />,
      },
      {
        name: "category_id",
        type: "select",
        label: "Category",
        placeholder: isLoadingDependencies
          ? "Loading categories..."
          : "Select category",
        options: categoryOptions,
        disabled: createStockForm.processing || isLoadingDependencies,
        required: true,
        showRequiredMarker: true,
      },
      {
        name: "supplier_id",
        type: "select",
        label: "Supplier",
        placeholder: isLoadingDependencies
          ? "Loading suppliers..."
          : "Select supplier",
        options: supplierOptions,
        disabled: createStockForm.processing || isLoadingDependencies,
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
        disabled: createStockForm.processing,
      },
      {
        name: "conversion_units" as keyof StockInFormState,
        type: "custom",
        label: "Conversion Units",
        customComponent: () => (
          <ConversionUnitsField
            form={createStockForm as any}
            disabled={createStockForm.processing || isLoadingItems}
            itemUnitType={createStockForm.data.item_unit_type}
            unit_of_measures={unit_of_measures || []}
            items={items || []}
          />
        ),
      },
      {
        name: "stock_locations_qty" as keyof StockInFormState,
        type: "custom",
        label: "Stock Locations Quantity",
        customComponent: () => (
          <StockInLocation
            form={createStockForm}
            manualStockIn={manualStockIn}
            stockLocation={stockLocation || []}
            itemsToBeStockedIn={initialData.purchased_quantity ?? 0}
            existingLocationStocks={locationStocks}
            selectedUomName={selectedUomName}
            conversionFactor={selectedUomFactor}
          />
        ),
      },
    ],
    [
      createStockForm.processing,
      isLoadingDependencies,
      categoryOptions,
      supplierOptions,
      isLoadingItems,
      createStockForm.data.item_unit_type,
      unit_of_measures,
      items,
      shouldShowUomField,
      uomOptions,
      createStockForm.data.stock_in_uom_id,
      manualStockIn,
      stockLocation,
      initialData.purchased_quantity,
      locationStocks,
      selectedUomName,
      selectedUomFactor,
      createStockForm.data.min_quantity,
      createStockForm.data.max_quantity,
    ],
  )

  const formSteps: FormStep[] = [
    {
      id: "item-details",
      title: "Item Details",
      icon: <Package className="h-4 w-4" />,
      fields: ["sku", "description", "brand", "color", "size", "image_url"],
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
      icon: <Tag className="h-4 w-4" />,
      fields: ["item_unit_type", "conversion_units"],
    },
    {
      id: "stock-in",
      title: "Stock In Location",
      icon: <Tag className="h-4 w-4" />,
      fields: [
        ...(shouldShowUomField ? ["stock_in_uom_id"] : []),
        "stock_locations_qty",
      ],
    },
  ]

  return (
    <div className="space-y-4">
      {manualStockIn && (
        <div className="space-y-3 px-1">
          <Label className="whitespace-nowrap">Select Existing Item</Label>
          <ItemSelector
            items={items}
            onSelect={handleSelectExistingItem}
            isLoading={isLoadingItems}
            stockDetails={stockDetails}
          />

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or enter details manually
              </span>
            </div>
          </div>
        </div>
      )}
      <DynamicInertiaForm<StockInFormState>
        form={createStockForm}
        onSubmit={handleSubmit}
        fields={createStockField}
        submitButtonTitle="Stock In"
        onCancel={closeDialog}
        disabled={createStockForm.processing}
        size="sm"
        isMultiStepForm={true}
        steps={formSteps}
        validateStepBeforeNext={true}
        schema={dynamicSchema}
      />
    </div>
  )
}
