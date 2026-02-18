import { InertiaFormProps } from "@inertiajs/react"
import DOMPurify from "dompurify"
import { z } from "zod"

export function createFieldValidator<TData extends Record<string, any>>(
  schema: z.ZodType<any>,
  form: InertiaFormProps<TData>,
) {
  return (field: keyof TData, value: unknown) => {
    try {
      if (schema instanceof z.ZodObject) {
        const fieldSchema = schema.shape[field as string]
        if (fieldSchema) {
          fieldSchema.parse(value)
          form.clearErrors(field as any)
        }
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const sanitizedMessage = DOMPurify.sanitize(error.issues[0].message, {
          ALLOWED_TAGS: [],
          ALLOWED_ATTR: [],
        })
        form.setError(field as any, sanitizedMessage)
      }
    }
  }
}

export function validateForm<TData extends Record<string, any>>(
  schema: z.ZodType<any>,
  data: TData,
  form: InertiaFormProps<TData>,
): boolean {
  const validation = schema.safeParse(data)

  if (!validation.success) {
    validation.error.issues.forEach((issue) => {
      const fieldPath = issue.path.join(".")
      const sanitizedMessage = DOMPurify.sanitize(issue.message, {
        ALLOWED_TAGS: [],
        ALLOWED_ATTR: [],
      })
      //@ts-expect-error
      form.setError(fieldPath, sanitizedMessage)
    })

    return false
  }

  return true
}
