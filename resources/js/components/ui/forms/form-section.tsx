import { FieldValues } from "react-hook-form"
import { cn } from "@/lib/cn"
import { FieldConfig, FormSection as FormSectionType } from "@/types"
import { FormFieldRenderer } from "./form-field"

interface FormSectionProps<TFieldValues extends FieldValues> {
  section: FormSectionType | null
  fields: FieldConfig<TFieldValues>[]
  form: any
  watchedValues: TFieldValues
  disabled?: boolean
  showLabels?: boolean
  showSectionDividers?: boolean
  groupIndex: number
  twoColumnLayout?: boolean
  gridColumns?: 1 | 2 | 3 | 4
}

export function FormSectionComponent<TFieldValues extends FieldValues>({
  section,
  fields,
  form,
  watchedValues,
  disabled = false,
  showLabels = true,
  showSectionDividers = false,
  groupIndex,
  twoColumnLayout = false,
  gridColumns = 1,
}: FormSectionProps<TFieldValues>) {
  return (
    <div key={section?.id || "unsectioned"}>
      {section && (
        <>
          <div className={cn("space-y-2", section.className)}>
            <h3 className={cn("text-lg font-semibold", section.titleClassName)}>
              {section.title}
            </h3>
            {section.description && (
              <p className="text-sm text-muted-foreground">
                {section.description}
              </p>
            )}
          </div>

          {showSectionDividers && groupIndex > 0 && (
            <hr className="my-6 border-border" />
          )}
        </>
      )}

      <div
        className={cn(
          "grid gap-4",
          twoColumnLayout && "grid-cols-1 md:grid-cols-2",
          gridColumns === 2 && "grid-cols-1 md:grid-cols-2",
          gridColumns === 3 && "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
          gridColumns === 4 && "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
          section?.contentClassName,
        )}
      >
        {fields
          .sort((a, b) => (a.order || 0) - (b.order || 0))
          .map((field) => (
            <FormFieldRenderer
              key={field.name}
              field={field}
              form={form}
              watchedValues={watchedValues}
              disabled={disabled}
              showLabels={showLabels}
            />
          ))}
      </div>
    </div>
  )
}
