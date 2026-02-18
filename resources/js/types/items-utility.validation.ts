import z from "zod"

export const categoryPayloadSchema = z.object({
  code: z.string().min(1, "Category code is required"),
  name: z.string().min(1, "Category name is required"),
})

export const unitOfMeasurePayloadSchema = z.object({
  code: z.string().min(1, "Unit of Measure code is required"),
  name: z.string().min(1, "Unit of Measure name is required"),
})

export const locationPayloadSchema = z.object({
  country: z.string().min(1, "Country is required"),
  region: z.string(),
  province: z.string(),
  municipality: z.string(),
  barangay: z.string(),
})

export const supplierPayloadSchema = z.object({
  name: z.string().min(1, "Supplier name is required"),
  email: z.string().optional(),
  contact_person: z.string().optional(),
  contact_no: z.string().optional(),
  telefax: z.string().optional(),
  address: z.string().optional(),
  shipping: z.string().optional(),
  terms: z.string().optional(),
  location: locationPayloadSchema,
})

export const itemPricePayloadSchema = z
  .object({
    unit_price: z.number().nonnegative().optional(),
    wholesale_price: z.number().nonnegative().optional(),
    credit_price: z.number().nonnegative().optional(),
    item_id: z.number().min(1, "Item ID is required"),
  })
  .superRefine(({ unit_price, wholesale_price, credit_price }, ctx) => {
    if (
      credit_price != null &&
      unit_price != null &&
      credit_price <= unit_price
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Credit price must be greater than unit price",
        path: ["credit_price"],
      })
    }

    if (
      unit_price != null &&
      wholesale_price != null &&
      unit_price <= wholesale_price
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Unit price must be greater than wholesale price",
        path: ["unit_price"],
      })
    }
  })

export const stockTransferPayloadSchema = z.object({
  selected_items_to_transfer: z
    .array(
      z.object({
        item_id: z.number().min(1, "Item id is required"),
        quantity_to_transfer: z
          .number()
          .min(1, "Quantity to transfer is required"),
        source_stock_location_id: z
          .number()
          .min(1, "Source stock location id is required"),
        destination_stock_location_id: z
          .number()
          .min(1, "Destination stock location id is required"),
      }),
    )
    .min(1, "At least one item must be selected to transfer"),
})

export type CategoryPayload = z.infer<typeof categoryPayloadSchema>
export type UnitOfMeasurePayload = z.infer<typeof unitOfMeasurePayloadSchema>
export type LocationPayload = z.infer<typeof locationPayloadSchema>
export type SupplierPayload = z.infer<typeof supplierPayloadSchema>
export type ItemPricePayload = z.infer<typeof itemPricePayloadSchema>
export type StockTransferPayload = z.infer<typeof stockTransferPayloadSchema>
