import z from "zod"

export const discount_type = z.enum(["percentage", "amount"])
export const voucher_type = z.enum([
  "percentage",
  "amount",
  "to_cash_price",
  "complimentary",
])
export const item_category_type = z.enum([
  "select_category",
  "select_item",
  "select_supplier",
  "all_item",
])
export const stock_adjustment_action = z.enum(["increase", "deduct"])

export const DiscountSchema = z
  .object({
    name: z.string().min(1, "Discount name is required"),
    description: z.string().optional(),
    discount_type: discount_type,
    amount: z.coerce.number().min(1, "Amount must be at least 1"),
    min_purchase_qty: z.coerce.number().optional(),
    min_spend: z.coerce.number().optional(),
    capped_amount: z.coerce.number().optional(),
    start_date: z.string().optional(),
    start_time: z.string().optional(),
    end_date: z.string().optional(),
    end_time: z.string().optional(),
    item_category_type: item_category_type,
    category_ids: z.array(z.number()).optional(),
    item_ids: z.array(z.number()).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.discount_type === "percentage" && data.amount > 100) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Percentage discount cannot be more than 100%",
        path: ["amount"],
      })
    }

    if (data.item_category_type === "select_category") {
      if (!data.category_ids || data.category_ids.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Category is required",
          path: ["category_ids"],
        })
      }
    }

    if (data.item_category_type === "select_item") {
      if (!data.item_ids || data.item_ids.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "At least one item is required",
          path: ["item_ids"],
        })
      }
    }
  })

export const VoucherSchema = z.object({
  code: z.string().min(1, "Voucher code is required"),
  description: z.string().optional(),
  type: voucher_type,
  amount: z.coerce.number().min(1, "Amount must be at least 1"),
  min_spend: z.coerce.number().optional(),
  capped_amount: z.coerce.number().optional(),
})

export const StockLocationsSchema = z.object({
  name: z.string().min(1, "Stock location name is required"),
})

export const voidReasonPayloadSchema = z.object({
  void_reason: z
    .string()
    .min(1, "Void reason is required")
    .max(255, "Void reason must not exceed 255 characters"),
  require_password: z.boolean(),
  roles_require_credentials: z.array(z.number()),
})

export const StockAdjustmentSchema = z.object({
  adjust_details: z.array(
    z.object({
      item_id: z.number().min(1, "Item ID is required"),
      quantity: z.number().min(1, "Quantity must be at least 1"),
      action: stock_adjustment_action,
      location_id: z.number().min(1, "Location ID is required"),
    }),
  ),
})

export type DiscountPayload = z.infer<typeof DiscountSchema>
export type VoucherPayload = z.infer<typeof VoucherSchema>
export type StockLocationsPayload = z.infer<typeof StockLocationsSchema>
export type VoidReasonPayload = z.infer<typeof voidReasonPayloadSchema>
export type StockAdjustmentPayload = z.infer<typeof StockAdjustmentSchema>
