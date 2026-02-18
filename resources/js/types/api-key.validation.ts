import { z } from "zod"

export const featurePermissionSchema = z.object({
  id: z.number(),
  permissions: z.array(z.string()),
})

export type FeaturePermission = z.infer<typeof featurePermissionSchema>

export const createApiKeyPayloadSchema = z.object({
  type: z.enum(["inbound", "outbound"]).default("inbound"),
  label: z.string().min(1, "Label is required"),
  key: z.string().optional(),
  key_expiration_id: z.string().min(1, "Expiration period is required"),
  features: z.array(featurePermissionSchema).optional().default([]),
})

export type CreateApiKeyPayload = z.infer<typeof createApiKeyPayloadSchema>

export const updateApiKeyPayloadSchema = z.object({
  label: z.string().min(1, "Label is required").optional(),
  key_expiration_id: z.string().optional(),
  scopes: z.array(z.string()).optional(),
  features: z.array(featurePermissionSchema).optional(),
  status: z.enum(["active", "expired", "revoked"]).optional(),
})

export type UpdateApiKeyPayload = z.infer<typeof updateApiKeyPayloadSchema>
