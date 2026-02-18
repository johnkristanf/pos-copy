import { Loader2 } from "lucide-react"
import { useEffect, useMemo } from "react"
import { FieldValues } from "react-hook-form"
import { Button } from "@/components/ui/common/button"
import { Form } from "@/components/ui/forms/form"
import { cn } from "@/lib/cn"
import { DynamicFormProps, FieldConfig, FormSection } from "@/types"
import { FormSectionComponent } from "./form-section"

export function DynamicForm<TFieldValues extends FieldValues>({
  form,
  onSubmit,
  fields,
  sections = [],
  submitButtonTitle,
  resetButtonTitle,
  mutation,
  className,
  disabled,
  submitButtonClassname,
  submitButtonTitleClassname,
  onReset,
  onCancel,
  addCancelButton = false,
  twoColumnLayout = false,
  gridColumns = 1,
  showSectionDividers = false,
  autoSave = false,
  autoSaveDelay = 1000,
  showLabels = true,
  size = "md",
}: DynamicFormProps<TFieldValues>) {
  const { handleSubmit, reset, watch } = form
  const watchedValues = watch()

  useEffect(() => {
    if (!autoSave) return

    const timeoutId = setTimeout(async () => {
      handleSubmit(onSubmit)()
    }, autoSaveDelay)

    return () => clearTimeout(timeoutId)
  }, [watchedValues, autoSave, autoSaveDelay, handleSubmit, onSubmit])

  const groupedFields = useMemo(() => {
    if (sections.length === 0) {
      return [{ section: null, fields }]
    }

    const sectionMap = new Map<string, FieldConfig<TFieldValues>[]>()
    const unsectionedFields: FieldConfig<TFieldValues>[] = []

    fields.forEach((field) => {
      if (field.section) {
        if (!sectionMap.has(field.section)) {
          sectionMap.set(field.section, [])
        }
        sectionMap.get(field.section)!.push(field)
      } else {
        unsectionedFields.push(field)
      }
    })

    const result: {
      section: FormSection | null
      fields: FieldConfig<TFieldValues>[]
    }[] = []

    if (unsectionedFields.length > 0) {
      result.push({ section: null, fields: unsectionedFields })
    }

    sections.forEach((section) => {
      const sectionFields = sectionMap.get(section.id) || []
      if (sectionFields.length > 0) {
        result.push({ section, fields: sectionFields })
      }
    })

    return result
  }, [fields, sections])

  return (
    <Form {...form}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className={cn("space-y-6", className)}
      >
        {groupedFields.map(({ section, fields: sectionFields }, groupIndex) => (
          <FormSectionComponent
            key={section?.id || "unsectioned"}
            section={section}
            fields={sectionFields}
            form={form}
            watchedValues={watchedValues}
            disabled={disabled}
            showLabels={showLabels}
            showSectionDividers={showSectionDividers}
            groupIndex={groupIndex}
            twoColumnLayout={twoColumnLayout}
            gridColumns={gridColumns}
          />
        ))}

        <div className="flex gap-3 pt-4">
          {resetButtonTitle && (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset()
                onReset?.()
              }}
              disabled={disabled || mutation?.isPending}
              className={cn(
                size === "sm" && "h-8 px-3 text-xs",
                size === "lg" && "h-11 px-8",
              )}
            >
              {resetButtonTitle}
            </Button>
          )}

          {addCancelButton && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                onCancel?.()
              }}
              disabled={disabled || mutation?.isPending}
              className={cn(
                size === "sm" && "h-8 px-3 text-xs",
                size === "lg" && "h-11 px-8",
              )}
            >
              Cancel
            </Button>
          )}

          <Button
            type="submit"
            variant={"bridge_digital"}
            disabled={disabled || mutation?.isPending}
            className={cn(
              "flex-1",
              size === "sm" && "h-8 px-3 text-xs",
              size === "lg" && "h-11 px-8",
              submitButtonClassname,
            )}
          >
            <span className={submitButtonTitleClassname}>
              {mutation?.isPending || disabled ? (
                <Loader2 className="animate-spin size-5" />
              ) : (
                submitButtonTitle
              )}
            </span>
          </Button>
        </div>
      </form>
    </Form>
  )
}
