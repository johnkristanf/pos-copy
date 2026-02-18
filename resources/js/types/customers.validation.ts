import z from "zod"

export const createCustomerSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  customer_img: z.any().optional().nullable(),
  email: z
    .string()
    .email("Invalid email address")
    .max(255)
    .optional()
    .nullable()
    .or(z.literal("")),
  contact_no: z.string().max(20).optional().nullable(),
  credit_limit: z.coerce.number().optional().nullable(),
  credit_term: z.coerce.number().int().optional().nullable(),
  country: z.string().min(1, "Country is required").max(255),
  region: z.string().max(255).optional().nullable(),
  province: z.string().max(255).optional().nullable(),
  municipality: z.string().max(255).optional().nullable(),
  barangay: z.string().max(255).optional().nullable(),
})

export type CreateCustomerPayload = z.infer<typeof createCustomerSchema>

export const updateCustomerSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  customer_img: z.any().optional().nullable(),
  email: z
    .string()
    .email("Invalid email address")
    .max(255)
    .optional()
    .nullable()
    .or(z.literal("")),
  contact_no: z.string().max(20).optional().nullable(),
  credit_limit: z.coerce.number().optional().nullable(),
  credit_term: z.coerce.number().int().optional().nullable(),
  country: z.string().min(1, "Country is required").max(255),
  region: z.string().max(255).optional().nullable(),
  province: z.string().max(255).optional().nullable(),
  municipality: z.string().max(255).optional().nullable(),
  barangay: z.string().max(255).optional().nullable(),
})

export type UpdateCustomerPayload = z.infer<typeof updateCustomerSchema>

export const payOrderSchema = z.object({
  amount: z.coerce.number().positive("Amount must be greater than 0"),
})

export type PayOrderPayload = z.infer<typeof payOrderSchema>
