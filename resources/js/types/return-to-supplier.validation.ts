import { z } from "zod"

export const returnToSupplierItemPayloadSchema = z.object({
  item_id: z.number().min(1, "Item is required"),
  quantity: z.number().min(1, "Qty must be at least 1"),
  deduction_source_type: z.enum(["stock", "purchase"]),
  deduction_source_id: z.number().min(1, "Source ID is required"),
})

export const returnToSupplierPayloadSchema = z.object({
  supplier_id: z.number().min(1, "Supplier is required"),
  type: z.enum(["replacement", "offset"]),
  remarks: z.string().optional().nullable(),
  items_to_return: z
    .array(returnToSupplierItemPayloadSchema)
    .min(1, "You must add at least one item."),
})

export type ReturnToSupplierItemPayload = z.infer<
  typeof returnToSupplierItemPayloadSchema
>
export type ReturnToSupplierPayload = z.infer<
  typeof returnToSupplierPayloadSchema
>
