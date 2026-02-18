import z from "zod"

export const componentBlueprintPayloadSchema = z.object({
  child_item_id: z.number().int().min(1, "Child Item ID is required"),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
})

export type ComponentBlueprintPayload = z.infer<
  typeof componentBlueprintPayloadSchema
>

export const conversionUnitPayloadSchema = z.object({
  purchase_uom_id: z.number().int().min(1, "Purchase UOM ID is required"),
  base_uom_id: z.number().int().min(1, "Base UOM ID is required"),
  conversion_factor: z.coerce
    .number()
    .positive("Conversion factor must be positive"),
})

export type ConversionUnitPayload = z.infer<typeof conversionUnitPayloadSchema>

export const itemUnitTypesPayload = z.enum(["set", "not_set"])
export type ItemUnitTypePayload = z.infer<typeof itemUnitTypesPayload>

export const baseItemPayloadSchema = z.object({
  image_url: z.any().optional().nullable(),
  description: z.string().min(1, "Description is required"),
  brand: z.string().optional(),
  color: z.string().optional(),
  size: z.string().optional(),
  min_quantity: z.coerce.number().optional(),
  max_quantity: z.coerce.number().optional(),
  category_id: z.coerce.number().min(1, "Category is required"),
  supplier_id: z.coerce.number().min(1, "Supplier is required"),
  item_unit_type: itemUnitTypesPayload,
  unit_price: z.coerce.number().optional(),
})

export const stockLocationPayloadSchema = z.object({
  id: z.number().optional(),
  quantity: z.number().optional(),
})

export const baseStockPayloadSchema = z.object({
  purchase_order_item_id: z.string().optional(),
  item_id: z.coerce.number().optional(),
  description: z.string().min(1, "Description is required"),
  image_url: z.any().optional().nullable(),
  brand: z.string().optional(),
  color: z.string().optional(),
  size: z.string().optional(),
  min_quantity: z.coerce.number().optional(),
  max_quantity: z.coerce.number().optional(),
  category_id: z.coerce.number().min(1, "Category is required"),
  supplier_id: z.coerce.number().min(1, "Supplier is required"),
  item_unit_type: itemUnitTypesPayload,
  stock_in_uom_id: z.coerce.number().optional().nullable(),
  stock_locations_qty: stockLocationPayloadSchema.array(),
  unit_price: z.coerce.number().optional(),
})

export const setItemPayloadSchema = baseItemPayloadSchema.extend({
  item_unit_type: z.literal("set"),
  components_blueprint: z
    .array(componentBlueprintPayloadSchema)
    .min(1, "Component blueprints are required for 'set' items."),
  conversion_units: z.array(conversionUnitPayloadSchema).optional(),
})

export const notSetItemPayloadSchema = baseItemPayloadSchema.extend({
  item_unit_type: z.literal("not_set"),
  conversion_units: z
    .array(conversionUnitPayloadSchema)
    .min(1, "Conversion units are required for 'not_set' items."),
  components_blueprint: z.array(componentBlueprintPayloadSchema).optional(),
})

export const setStockPayloadSchema = baseStockPayloadSchema.extend({
  item_unit_type: z.literal("set"),
  components_blueprint: z
    .array(componentBlueprintPayloadSchema)
    .min(1, "Component blueprints are required for 'set' items."),
  conversion_units: z.array(conversionUnitPayloadSchema).optional(),
})

export const notSetStockPayloadSchema = baseStockPayloadSchema.extend({
  item_unit_type: z.literal("not_set"),
  conversion_units: z
    .array(conversionUnitPayloadSchema)
    .min(1, "Conversion units are required for 'not_set' items."),
  components_blueprint: z.array(componentBlueprintPayloadSchema).optional(),
})

export const createItemPayloadSchema = z.discriminatedUnion("item_unit_type", [
  setItemPayloadSchema,
  notSetItemPayloadSchema,
])

export const createStockPayloadSchema = z.discriminatedUnion("item_unit_type", [
  setStockPayloadSchema,
  notSetStockPayloadSchema,
])

export type CreateItemPayload = z.infer<typeof createItemPayloadSchema>
export type CreateStockPayload = z.infer<typeof createStockPayloadSchema>
