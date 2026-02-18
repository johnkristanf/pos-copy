import { z } from "zod"

export const loginAccountSchema = z.object({
  email: z
    .email("Invalid email address")
    .min(1, "Email is required")
    .max(255, "Email is too long"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters"),
  remember: z.boolean(),
})

export const loginAccountResponseSchema = z.object({
  message: z.string().optional(),
  redirect: z.string().optional(),
  user: z
    .object({
      id: z.number(),
      name: z.string(),
      email: z.email(),
    })
    .optional(),
})

export type LoginAccountPayload = z.infer<typeof loginAccountSchema>
export type LoginAccountResponse = z.infer<typeof loginAccountResponseSchema>

export const registerAccountSchema = z
  .object({
    first_name: z
      .string()
      .min(1, "First name is required")
      .max(255, "First name is too long"),
    middle_name: z
      .string()
      .min(1, "Middle name is required")
      .max(255, "Middle name is too long"),
    last_name: z
      .string()
      .min(1, "Last name is required")
      .max(255, "last name is too long"),
    email: z
      .email("Invalid email address")
      .min(1, "Email is required")
      .max(255, "Email is too long"),
    password: z
      .string()
      .min(1, "Password is required")
      .min(8, "Password must be at least 8 characters")
      .max(255, "Password is too long"),
    password_confirmation: z
      .string()
      .min(1, "Password confirmation is required")
      .max(255, "Password is too long"),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Passwords don't match",
    path: ["password_confirmation"],
  })

export const registerAccountResponseSchema = z.object({
  message: z.string().optional(),
  redirect: z.string().optional(),
  user: z
    .object({
      id: z.number(),
      name: z.string(),
      email: z.email("Invalid email address"),
    })
    .optional(),
})

export type RegisterAccountPayload = z.infer<typeof registerAccountSchema>
export type RegisterAccountResponse = z.infer<
  typeof registerAccountResponseSchema
>

export const resetAccountPasswordSchema = z
  .object({
    token: z.string().min(1, "Token is required"),
    email: z
      .email("Invalid email address")
      .min(1, "Email is required")
      .max(255, "Email is too long"),
    password: z
      .string()
      .min(1, "Password is required")
      .min(8, "Password must be at least 8 characters"),
    password_confirmation: z
      .string()
      .min(1, "Password confirmation is required"),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Passwords don't match",
    path: ["password_confirmation"],
  })

export const resetAccountPasswordResponseSchema = z.object({
  message: z.string().optional(),
  status: z.string().optional(),
  redirect: z.string().optional(),
})

export type ResetAccountPasswordPayload = z.infer<
  typeof resetAccountPasswordSchema
>
export type ResetAccountPasswordResponse = z.infer<
  typeof resetAccountPasswordResponseSchema
>

export const twoFactorChallengeSchema = z
  .object({
    code: z.string().max(6, "Code must be 6 digits").optional(),
    recovery_code: z.string().optional(),
  })
  .refine((data) => data.code || data.recovery_code, {
    message: "Either code or recovery code is required",
    path: ["code"],
  })

export const twoFactorChallengeResponseSchema = z.object({
  message: z.string().optional(),
  redirect: z.string().optional(),
})

export type TwoFactorChallengePayload = z.infer<typeof twoFactorChallengeSchema>
export type TwoFactorChallengeResponse = z.infer<
  typeof twoFactorChallengeResponseSchema
>

export const changeAccountPasswordSchema = z
  .object({
    current_password: z.string().min(1, "Current password is required"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    password_confirmation: z
      .string()
      .min(1, "Password confirmation is required"),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Passwords do not match",
    path: ["password_confirmation"],
  })

export const changeAccountPasswordResponseSchema = z.object({
  message: z.string().optional(),
})

export type ChangeAccountPasswordPayload = z.infer<
  typeof changeAccountPasswordSchema
>
export type ChangeAccountPasswordResponse = z.infer<
  typeof changeAccountPasswordResponseSchema
>

export const twoFactorSetupSchema = z.object({
  svg: z.string(),
  url: z.url(),
})

export type TwoFactorSetupData = z.infer<typeof twoFactorSetupSchema>

export const twoFactorSetupResponseSchema = z.object({
  message: z.string().optional(),
})

export const twoFactorSecretKey = z.object({
  secretKey: z.string(),
})

export type TwoFactorSetupResponse = z.infer<
  typeof twoFactorSetupResponseSchema
>
export type TwoFactorSecretKey = z.infer<typeof twoFactorSecretKey>

export const verifyEmailSchema = z.object({
  // This schema is empty since we don't need any form data for resending verification
  // but we keep it for consistency with other forms
})

export const verifyEmailResponseSchema = z.object({
  message: z.string().optional(),
  status: z.string().optional(),
})

export type VerifyEmailPayload = z.infer<typeof verifyEmailSchema>
export type VerifyEmailResponse = z.infer<typeof verifyEmailResponseSchema>

export const twoFactorVerificationSchema = z.object({
  code: z.string().min(6).max(6).optional(),
})

export const twoFactorVerificationResponseSchema = z.object({
  message: z.string().optional(),
  redirect: z.string().optional(),
  user: z
    .object({
      id: z.number(),
      name: z.string(),
      email: z.email(),
    })
    .optional(),
})

export type TwoFactorVerificationPayload = z.infer<
  typeof twoFactorVerificationSchema
>
export type TwoFactorVerificationResponse = z.infer<
  typeof twoFactorVerificationResponseSchema
>

export const confirmAccountPasswordSchema = z.object({
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters"),
})

export const confirmAccountPasswordResponseSchema = z.object({
  message: z.string().optional(),
  redirect: z.string().optional(),
  user: z
    .object({
      id: z.number(),
      name: z.string(),
      email: z.email(),
    })
    .optional(),
})

export type ConfirmAccountPasswordPayload = z.infer<
  typeof confirmAccountPasswordSchema
>
export type ConfirmAccountPasswordResponse = z.infer<
  typeof confirmAccountPasswordResponseSchema
>

export const forgotAccountPasswordSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
})

export const forgotAccountPasswordResponseSchema = z.object({
  message: z.string().optional(),
  status: z.string().optional(),
})

export type ForgotAccountPasswordPayload = z.infer<
  typeof forgotAccountPasswordSchema
>
export type ForgotAccountPasswordResponse = z.infer<
  typeof forgotAccountPasswordResponseSchema
>
