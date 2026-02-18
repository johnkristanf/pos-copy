import { z } from "zod"

export const returnFromCustomerItemsPayloadSchema = z.object({
  item_id: z.number("Must be a number").min(1, "Item id is required"),
  quantity: z.number("Must be a number").min(1, "Qty must be at least 1"),
  stock_location_id: z
    .number("Must be a number")
    .min(1, "Stock location id is required"),
})

export const returnFromCustomerPayloadSchema = z.object({
  customer_id: z.number("Must be a number").min(1, "Customer id is required"),
  invoice_number: z.string().min(1, "Invoice number is required"),
  invoice_issued_date: z.string().min(1, "Invoice issued date is required"),
  reason: z.string().min(1, "Reason is required"),
  returned_items: z
    .array(returnFromCustomerItemsPayloadSchema)
    .min(1, "You must add at least one item."),
})

export type ReturnFromCustomerItemsPayload = z.infer<
  typeof returnFromCustomerItemsPayloadSchema
>
export type ReturnFromCustomerPayload = z.infer<
  typeof returnFromCustomerPayloadSchema
>
