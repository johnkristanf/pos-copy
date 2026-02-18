import z from "zod"

export const createUserPayloadSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  middle_name: z.string().optional(),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email({ message: "Invalid email address" }),
  stock_location_ids: z
    .array(z.string())
    .min(1, "At least one stock location is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  roles: z.array(z.number()).min(1, "At least one role must be selected"),
  user_signature: z.any().optional().nullable(),
  user_image: z.any().optional().nullable(),
})

export type CreateUserPayload = z.infer<typeof createUserPayloadSchema>

export const updateUserPayloadSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  middle_name: z.string().optional(),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email({ message: "Invalid email address" }),
  stock_location_ids: z
    .array(z.string())
    .min(1, "At least one stock location is required"),
  password: z.string().optional(),
  roles: z.array(z.number()).min(1, "At least one role must be selected"),
  user_signature: z.any().optional().nullable(),
  user_image: z.any().optional().nullable(),
})

export type UpdateUserPayload = z.infer<typeof updateUserPayloadSchema>
