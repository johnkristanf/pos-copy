import { AlertCircle, Check, ChevronLeft, ChevronRight } from "lucide-react"
import { Fragment, useEffect, useState } from "react"
import { match, P } from "ts-pattern"
import { z } from "zod"
import { Button } from "@/components/ui/common/button"
import { cn } from "@/lib/cn"
import { FormStep, InertiaFieldConfig, InertiaFormConfig } from "@/types"
import { InertiaFormFieldRenderer } from "./inertia-form-field"

interface MultiStepFormProps<TForm extends Record<string, any>> {
  form: InertiaFormConfig<TForm>
  fields: InertiaFieldConfig<TForm>[]
  steps: FormStep[]
  onSubmit: (e: React.FormEvent) => void
  onCancel?: () => void
  disabled?: boolean
  showLabels?: boolean
  size?: "sm" | "md" | "lg"
  submitButtonTitle?: string
  submitButtonClassname?: string
  submitButtonTitleClassname?: string
  onStepChange?: (step: number) => void
  validateStepBeforeNext?: boolean
  schema?: z.ZodType<any>
}

export function MultiStepForm<TForm extends Record<string, any>>({
  form,
  fields,
  steps,
  onSubmit,
  onCancel,
  disabled = false,
  showLabels = true,
  size = "md",
  submitButtonTitle = "Submit",
  submitButtonClassname,
  submitButtonTitleClassname,
  onStepChange,
  validateStepBeforeNext = true,
  schema,
}: MultiStepFormProps<TForm>) {
  const [currentStep, setCurrentStep] = useState(0)

  const currentStepData = steps[currentStep]
  const isFirstStep = currentStep === 0
  const isLastStep = currentStep === steps.length - 1

  const currentStepFields = fields.filter((field) =>
    currentStepData.fields.includes(field.name as string),
  )

  const sizeClasses = match(size)
    .with("sm", () => "h-8 px-3 text-xs")
    .with("lg", () => "h-11 px-8")
    .otherwise(() => "")

  useEffect(() => {
    if (form.processing) return

    const errorKeys = Object.keys(form.errors)
    if (errorKeys.length > 0) {
      const stepIndexWithError = steps.findIndex((step) =>
        step.fields.some((fieldName) =>
          errorKeys.some(
            (errorKey) =>
              errorKey === fieldName || errorKey.startsWith(`${fieldName}.`),
          ),
        ),
      )

      if (stepIndexWithError !== -1 && stepIndexWithError !== currentStep) {
        setCurrentStep(stepIndexWithError)
        onStepChange?.(stepIndexWithError)
      }
    }
  }, [form.errors, form.processing, steps, currentStep, onStepChange])

  useEffect(() => {
    const stepFieldNames = steps[currentStep].fields
    stepFieldNames.forEach((fieldName) => {
      const hasError = Object.keys(form.errors).some(
        (key) => key === fieldName || key.startsWith(`${fieldName}.`),
      )

      const value = form.data[fieldName as keyof TForm]

      if (hasError && value !== "" && value !== null && value !== undefined) {
        form.clearErrors(fieldName as keyof TForm)
      }
    })
  }, [form.data, currentStep])

  const validateCurrentStep = () => {
    if (!validateStepBeforeNext) return true

    if (schema) {
      const stepFieldNames = currentStepData.fields
      const result = schema.safeParse(form.data)

      if (!result.success) {
        let hasStepError = false

        result.error.issues.forEach((issue) => {
          const fieldPath = issue.path.join(".")

          const belongsToStep = stepFieldNames.some(
            (stepField) =>
              fieldPath === stepField || fieldPath.startsWith(`${stepField}.`),
          )

          if (belongsToStep) {
            form.setError(fieldPath, issue.message)
            hasStepError = true
          }
        })

        stepFieldNames.forEach((fieldName) => {
          const isInvalid = result.error.issues.some((issue) => {
            const path = issue.path.join(".")
            return path === fieldName || path.startsWith(`${fieldName}.`)
          })

          if (!isInvalid) {
            form.clearErrors(fieldName as keyof TForm)
          }
        })

        if (hasStepError) return false
      } else {
        form.clearErrors(...(stepFieldNames as (keyof TForm)[]))
      }

      return true
    }

    const stepFieldNames = currentStepData.fields
    const hasErrors = stepFieldNames.some((fieldName) => {
      const fieldValue = form.data[fieldName as keyof TForm]
      const field = fields.find((f) => f.name === fieldName)

      if (field?.required && !fieldValue) {
        form.setError(
          fieldName as keyof TForm,
          `${field.label || fieldName} is required`,
        )
        return true
      }
      return false
    })

    return !hasErrors
  }

  const handleNext = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    if (disabled || form.processing) return

    if (validateCurrentStep()) {
      const nextStep = currentStep + 1
      setCurrentStep(nextStep)
      onStepChange?.(nextStep)
    }
  }

  const handleBack = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    if (disabled || form.processing) return

    const prevStep = currentStep - 1
    setCurrentStep(prevStep)
    onStepChange?.(prevStep)
    // Optional: Clear errors when going back? usually better to keep them or clear them.
    // form.clearErrors(...(currentStepData.fields as (keyof TForm)[]))
  }

  const handleStepClick = (stepIndex: number) => {
    if (disabled || form.processing) return

    if (stepIndex < currentStep) {
      setCurrentStep(stepIndex)
      onStepChange?.(stepIndex)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (disabled || form.processing) return

    if (isLastStep && validateCurrentStep()) {
      onSubmit(e)
    }
  }

  const stepHasErrors = (stepFields: string[]) => {
    return stepFields.some((field) =>
      Object.keys(form.errors).some(
        (errorKey) => errorKey === field || errorKey.startsWith(`${field}.`),
      ),
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 mx-auto w-full">
      <div className="w-full">
        <div className="flex items-center justify-between w-full">
          {steps.map((step, index) => {
            const isCompleted = index < currentStep
            const isCurrent = index === currentStep
            const isClickable = index < currentStep
            const isFormDisabled = disabled || form.processing
            const hasError = stepHasErrors(step.fields)

            return (
              <Fragment key={step.id}>
                <div className="flex flex-col items-center shrink-0 relative z-10">
                  <button
                    type="button"
                    onClick={() => isClickable && handleStepClick(index)}
                    disabled={!isClickable || isFormDisabled}
                    className={cn(
                      "w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-200 border-2",
                      match({ isCompleted, isCurrent, hasError })
                        .with(
                          { hasError: true },
                          () =>
                            "bg-destructive/10 border-destructive text-destructive hover:bg-destructive/20",
                        )
                        .with(
                          { isCompleted: true },
                          () =>
                            "bg-primary border-primary text-primary-foreground hover:bg-primary/90",
                        )
                        .with(
                          { isCurrent: true },
                          () =>
                            "bg-background border-primary text-primary ring-4 ring-primary/20",
                        )
                        .otherwise(
                          () =>
                            "bg-muted border-transparent text-muted-foreground",
                        ),
                      match({
                        isClickable,
                        isFormDisabled,
                      })
                        .with(
                          { isFormDisabled: true },
                          () => "opacity-50 cursor-not-allowed",
                        )
                        .with({ isClickable: true }, () => "cursor-pointer")
                        .otherwise(() => ""),
                    )}
                  >
                    {match({ isCompleted, hasError, icon: step.icon })
                      .with({ hasError: true }, () => (
                        <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                      ))
                      .with({ isCompleted: true }, () => (
                        <Check className="h-4 w-4 sm:h-5 sm:w-5" />
                      ))
                      .with({ icon: P.not(undefined) }, ({ icon }) => icon)
                      .otherwise(() => (
                        <span className="text-xs sm:text-sm font-medium">
                          {index + 1}
                        </span>
                      ))}
                  </button>
                  <div className="mt-2 text-center max-w-25 sm:max-w-none">
                    <p
                      className={cn(
                        "text-xs transition-colors font-medium",
                        match({ isCurrent, isCompleted, hasError })
                          .with({ hasError: true }, () => "text-destructive")
                          .with(
                            P.union({ isCurrent: true }, { isCompleted: true }),
                            () => "text-primary",
                          )
                          .otherwise(() => "text-muted-foreground"),
                      )}
                    >
                      {step.title}
                    </p>
                    {step.description && (
                      <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 hidden sm:block">
                        {step.description}
                      </p>
                    )}
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      "h-0.5 flex-1 mx-2 sm:mx-4 transition-colors duration-200 -mt-6 sm:-mt-7",
                      match({
                        isCompleted,
                        hasNextError: stepHasErrors(steps[index + 1].fields),
                      })
                        .with({ isCompleted: true }, () => "bg-primary")
                        .otherwise(() => "bg-muted"),
                    )}
                  />
                )}
              </Fragment>
            )
          })}
        </div>
      </div>

      <div className="size-auto">
        <div className="space-y-4">
          <div className="border-b pb-4">
            <h3 className="text-base sm:text-lg font-semibold">
              {currentStepData.title}
            </h3>
            {currentStepData.description && (
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                {currentStepData.description}
              </p>
            )}
          </div>

          <div className="space-y-4">
            {currentStepFields.map((field) => (
              <InertiaFormFieldRenderer
                key={field.name as string}
                field={field}
                form={form}
                disabled={disabled}
                showLabels={showLabels}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 pt-4 border-t">
        <div className="flex gap-3">
          {match({ isFirstStep, hasOnCancel: !!onCancel })
            .with({ isFirstStep: false }, () => (
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={disabled || form.processing}
                className={cn(sizeClasses)}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
            ))
            .with({ isFirstStep: true, hasOnCancel: true }, () => (
              <Button
                type="button"
                variant="ghost"
                onClick={onCancel}
                disabled={disabled || form.processing}
                className={cn(sizeClasses)}
              >
                Cancel
              </Button>
            ))
            .otherwise(() => null)}
        </div>

        <div className="flex-1 text-center">
          <span className="text-xs sm:text-sm text-muted-foreground">
            Step {currentStep + 1} of {steps.length}
          </span>
        </div>

        <div>
          {match(isLastStep)
            .with(false, () => (
              <Button
                type="button"
                variant="bridge_digital"
                onClick={handleNext}
                disabled={disabled || form.processing}
                className={cn(sizeClasses)}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ))
            .with(true, () => (
              <Button
                type="submit"
                variant="bridge_digital"
                disabled={disabled || form.processing}
                className={cn(sizeClasses, submitButtonClassname)}
              >
                <span className={submitButtonTitleClassname}>
                  {submitButtonTitle}
                </span>
              </Button>
            ))
            .exhaustive()}
        </div>
      </div>
    </form>
  )
}
