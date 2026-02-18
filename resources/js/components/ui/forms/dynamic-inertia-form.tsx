import { Loader2 } from "lucide-react"
import { useMemo } from "react"
import { match, P } from "ts-pattern"
import { Button } from "@/components/ui/common/button"
import { cn } from "@/lib/cn"
import {
  DynamicInertiaFormProps,
  InertiaFieldConfig,
  InertiaFormSection,
} from "@/types"
import { FormDebugger } from "./form-debugger"
import { InertiaFormSectionComponent } from "./inertia-form-section"
import { MultiStepForm } from "./multi-step-form"

export function DynamicInertiaForm<TForm extends Record<string, any>>({
  form,
  onSubmit,
  fields,
  sections = [],
  submitButtonTitle,
  resetButtonTitle,
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
  showLabels = true,
  size = "md",
  isMultiStepForm = false,
  steps = [],
  onStepChange,
  validateStepBeforeNext = true,
  schema,
  debug = false,
}: DynamicInertiaFormProps<TForm> & { debug?: boolean }) {
  const groupedFields = useMemo(() => {
    return match(sections)
      .with([], () => [{ section: null, fields }])
      .otherwise((currentSections) => {
        const sectionMap = new Map<string, InertiaFieldConfig<TForm>[]>()
        const unsectionedFields: InertiaFieldConfig<TForm>[] = []

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
          section: InertiaFormSection | null
          fields: InertiaFieldConfig<TForm>[]
        }[] = []

        if (unsectionedFields.length > 0) {
          result.push({ section: null, fields: unsectionedFields })
        }

        currentSections.forEach((section) => {
          const sectionFields = sectionMap.get(section.id) || []
          if (sectionFields.length > 0) {
            result.push({ section, fields: sectionFields })
          }
        })

        return result
      })
  }, [fields, sections])

  const sizeClasses = match(size)
    .with("sm", () => "h-8 px-3 text-xs")
    .with("lg", () => "h-11 px-8")
    .otherwise(() => "")

  return match({ isMultiStepForm, hasSteps: steps.length > 0 })
    .with({ isMultiStepForm: true, hasSteps: true }, () => (
      <div className={className}>
        {debug && <FormDebugger form={form} />}
        <MultiStepForm
          form={form}
          fields={fields}
          steps={steps}
          onSubmit={onSubmit}
          onCancel={onCancel}
          disabled={disabled}
          showLabels={showLabels}
          size={size}
          submitButtonTitle={submitButtonTitle}
          submitButtonClassname={submitButtonClassname}
          submitButtonTitleClassname={submitButtonTitleClassname}
          onStepChange={onStepChange}
          validateStepBeforeNext={validateStepBeforeNext}
          schema={schema}
        />
      </div>
    ))
    .otherwise(() => (
      <div className={className}>
        <form onSubmit={onSubmit} className="space-y-6">
          {debug && <FormDebugger form={form} />}
          {groupedFields.map(
            ({ section, fields: sectionFields }, groupIndex) => (
              <InertiaFormSectionComponent
                key={section?.id || "unsectioned"}
                section={section}
                fields={sectionFields}
                form={form}
                disabled={disabled}
                showLabels={showLabels}
                showSectionDividers={showSectionDividers}
                groupIndex={groupIndex}
                twoColumnLayout={twoColumnLayout}
                gridColumns={gridColumns}
              />
            ),
          )}

          <div className="flex gap-3 pt-4">
            {resetButtonTitle && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  form.reset()
                  onReset?.()
                }}
                disabled={disabled || form.processing}
                className={cn(sizeClasses)}
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
                disabled={disabled || form.processing}
                className={cn(sizeClasses)}
              >
                Cancel
              </Button>
            )}

            <Button
              type="submit"
              variant={"bridge_digital"}
              disabled={disabled || form.processing}
              className={cn("flex-1", sizeClasses, submitButtonClassname)}
            >
              <span className={submitButtonTitleClassname}>
                {match({ processing: form.processing, disabled })
                  .with(
                    P.union({ processing: true }, { disabled: true }),
                    () => <Loader2 className="animate-spin size-5" />,
                  )
                  .otherwise(() => submitButtonTitle)}
              </span>
            </Button>
          </div>
        </form>
      </div>
    ))
}
