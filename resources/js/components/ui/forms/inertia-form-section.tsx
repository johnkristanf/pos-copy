import { JSX, useMemo } from "react"
import { match, P } from "ts-pattern"
import { cn } from "@/lib/cn"
import {
  InertiaFieldConfig,
  InertiaFormConfig,
  InertiaFormSection,
} from "@/types"
import { InertiaFormFieldRenderer } from "./inertia-form-field"

interface InertiaFormSectionProps<TForm extends Record<string, any>> {
  section: InertiaFormSection | null
  fields: InertiaFieldConfig<TForm>[]
  form: InertiaFormConfig<TForm>
  disabled?: boolean
  showLabels?: boolean
  showSectionDividers?: boolean
  groupIndex: number
  twoColumnLayout?: boolean
  gridColumns?: 1 | 2 | 3 | 4
}

export function InertiaFormSectionComponent<TForm extends Record<string, any>>({
  section,
  fields,
  form,
  disabled = false,
  showLabels = true,
  showSectionDividers = false,
  groupIndex,
  twoColumnLayout = false,
  gridColumns = 1,
}: InertiaFormSectionProps<TForm>) {
  const fieldElements = useMemo(() => {
    const sortedFields = fields.sort((a, b) => (a.order || 0) - (b.order || 0))
    const elements: JSX.Element[] = []
    const processedFieldNames = new Set<string>()

    sortedFields.forEach((field) => {
      if (processedFieldNames.has(field.name as string)) return
      match(field as InertiaFieldConfig<TForm> & { groupId?: string })
        .with({ groupId: P.string.select() }, (groupId) => {
          const groupFields = sortedFields.filter(
            (f) => (f as any).groupId === groupId,
          )
          groupFields.forEach((f) => processedFieldNames.add(f.name as string))

          elements.push(
            <div
              key={`group-${groupId}`}
              className={cn(
                "grid grid-cols-1 gap-4 md:grid-cols-2",
                twoColumnLayout && "md:col-span-2",
              )}
            >
              {groupFields.map((groupField) => (
                <InertiaFormFieldRenderer
                  key={groupField.name as string}
                  field={groupField}
                  form={form}
                  disabled={disabled}
                  showLabels={showLabels}
                />
              ))}
            </div>,
          )
        })
        .otherwise((singleField) => {
          elements.push(
            <InertiaFormFieldRenderer
              key={singleField.name as string}
              field={singleField}
              form={form}
              disabled={disabled}
              showLabels={showLabels}
            />,
          )
          processedFieldNames.add(singleField.name as string)
        })
    })

    return elements
  }, [fields, form, disabled, showLabels, twoColumnLayout])

  const gridClasses = match({ twoColumnLayout, gridColumns })
    .with({ twoColumnLayout: true }, () => "grid-cols-1 md:grid-cols-2")
    .with({ gridColumns: 2 }, () => "grid-cols-1 md:grid-cols-2")
    .with({ gridColumns: 3 }, () => "grid-cols-1 md:grid-cols-2 lg:grid-cols-3")
    .with({ gridColumns: 4 }, () => "grid-cols-1 md:grid-cols-2 lg:grid-cols-4")
    .otherwise(() => "grid-cols-1")

  return (
    <div key={section?.id || "unsectioned"}>
      {match(section)
        .with(P.not(null), (s) => (
          <>
            <div className={cn("space-y-2", s.className)}>
              <h3 className={cn("text-lg font-semibold", s.titleClassName)}>
                {s.title}
              </h3>
              {s.description && (
                <p className="text-sm text-muted-foreground">{s.description}</p>
              )}
            </div>

            {match({ showSectionDividers, groupIndex })
              .with(
                { showSectionDividers: true, groupIndex: P.number.gt(0) },
                () => <hr className="my-6 border-border" />,
              )
              .otherwise(() => null)}
          </>
        ))
        .otherwise(() => null)}

      <div className={cn("grid gap-4", gridClasses, section?.contentClassName)}>
        {fieldElements}
      </div>
    </div>
  )
}
