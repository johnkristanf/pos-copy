import z from "zod"

// create project
export const createAppPayloadSchema = z.object({
  name: z.string().min(1, "App name is required"),
  slug: z.string().min(1, "App description is required"),
  isactive: z.boolean().or(z.number()).or(z.string()).nullable().optional(),
})

export const createAppResponseSchema = z.object({
  status: z.literal("success"),
  message: z.string(),
  data: z
    .object({
      id: z.number(),
      tag: z.string(),
      name: z.string(),
      description: z.string(),
      isactive: z.boolean().or(z.number()).or(z.string()).nullable().optional(),
      created_at: z.string(),
      updated_at: z.string(),
    })
    .optional(),
})

export type CreateAppPayload = z.infer<typeof createAppPayloadSchema>
export type CreateAppResponse = z.infer<typeof createAppResponseSchema>

// update project
export const updateAppPayloadSchema = z.object({
  name: z.string().min(1, "App name is required").optional(),
  slug: z.string().min(1, "App description is required").optional(),
  isactive: z.boolean().or(z.number()).or(z.string()).nullable().optional(),
})

export const updateAppResponseSchema = z.object({
  status: z.literal("success"),
  message: z.string(),
  data: z
    .object({
      id: z.number(),
      name: z.string(),
      slug: z.string(),
      isactive: z.any(),
      created_at: z.string(),
      updated_at: z.string(),
    })
    .optional(),
})

export type UpdateAppPayload = z.infer<typeof updateAppPayloadSchema>
export type UpdateAppResponse = z.infer<typeof updateAppResponseSchema>

// delete project
export const deleteAppResponseSchema = z.object({
  status: z.literal("success"),
  message: z.string(),
  data: z.null().optional(),
})

export type DeleteAppResponse = z.infer<typeof deleteAppResponseSchema>
