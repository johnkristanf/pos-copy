import { FieldValues } from "react-hook-form"
import { Checkbox } from "@/components/ui/common/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/common/select"
import { Switch } from "@/components/ui/common/switch"
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/forms/form"
import { Input } from "@/components/ui/inputs/input"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/inputs/input-otp"
import { cn } from "@/lib/cn"
import { FieldConfig } from "@/types"
import { PasswordStrengthMeter } from "../common/password-strength"

interface FormFieldRendererProps<TFieldValues extends FieldValues> {
  field: FieldConfig<TFieldValues>
  form: any
  watchedValues: TFieldValues
  disabled?: boolean
  showLabels?: boolean
}

export function FormFieldRenderer<TFieldValues extends FieldValues>({
  field,
  form,
  watchedValues,
  disabled = false,
  showLabels = true,
}: FormFieldRendererProps<TFieldValues>) {
  if (field.renderCondition && !field.renderCondition(watchedValues)) {
    return null
  }

  const isFieldDisabled =
    disabled ||
    field.disabled ||
    (field.enableCondition && !field.enableCondition(watchedValues))

  const renderFieldInput = (formField: any) => {
    switch (field.type) {
      case "text":
      case "email":
      case "number":
      case "phone":
      case "color":
        return (
          <Input
            {...formField}
            type={field.type}
            placeholder={field.placeholder}
            disabled={isFieldDisabled}
            readOnly={field.readOnly}
            autoFocus={field.autoFocus}
            autoComplete={field.autoComplete}
            className={cn(
              field.inputClassName,
              field.prefix && "pl-10",
              field.suffix && "pr-10",
            )}
            step={field.step}
            onChange={(e) => {
              formField.onChange(e)
              field.onChange?.(e.target.value)
            }}
            onBlur={(e) => {
              formField.onBlur()
              field.onBlur?.(e.target.value)
            }}
            onFocus={(e) => field.onFocus?.(e.target.value)}
          />
        )

      case "password":
        return (
          <Input
            {...formField}
            isPassword
            placeholder={field.placeholder}
            disabled={isFieldDisabled}
            readOnly={field.readOnly}
            autoFocus={field.autoFocus}
            autoComplete={field.autoComplete}
            className={cn(field.inputClassName, field.prefix && "pl-10")}
            onChange={(e) => {
              formField.onChange(e)
              field.onChange?.(e.target.value)
            }}
            onBlur={(e) => {
              formField.onBlur()
              field.onBlur?.(e.target.value)
            }}
            onFocus={(e) => field.onFocus?.(e.target.value)}
          />
        )

      case "password-input":
        return (
          <div className="space-y-2">
            <Input
              {...formField}
              type="password"
              isPassword
              placeholder={field.placeholder}
              disabled={isFieldDisabled}
              readOnly={field.readOnly}
              autoFocus={field.autoFocus}
              autoComplete={field.autoComplete}
              className={cn(field.inputClassName, field.prefix && "pl-10")}
              onChange={(e) => {
                formField.onChange(e)
                field.onChange?.(e.target.value)
              }}
              onBlur={(e) => {
                formField.onBlur()
                field.onBlur?.(e.target.value)
              }}
              onFocus={(e) => field.onFocus?.(e.target.value)}
            />
            {field.showStrengthIndicator && (
              <div className="w-full">
                <PasswordStrengthMeter
                  password={formField.value || ""}
                  onStrengthChange={(_isStrong) => {
                    field.onChange?.(formField.value)
                  }}
                />
              </div>
            )}
          </div>
        )

      case "otp":
        return (
          <InputOTP
            maxLength={field.otpLength || 6}
            value={formField.value || ""}
            onChange={(value) => {
              formField.onChange(value)
              field.onChange?.(value)
            }}
            onComplete={(value) => {
              field.onComplete?.(value)
            }}
            disabled={isFieldDisabled}
            className={field.inputClassName}
            containerClassName={field.containerClassName}
          >
            <InputOTPGroup>
              {Array.from({ length: field.otpLength || 6 }).map((_, index) => (
                <InputOTPSlot key={index} index={index} />
              ))}
            </InputOTPGroup>
          </InputOTP>
        )

      case "textarea":
        return (
          <textarea
            {...formField}
            placeholder={field.placeholder}
            disabled={isFieldDisabled}
            readOnly={field.readOnly}
            rows={field.rows || 3}
            className={cn(
              "flex min-h-15 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
              field.inputClassName,
              field.prefix && "pl-10",
              field.suffix && "pr-10",
            )}
            onChange={(e) => {
              formField.onChange(e)
              field.onChange?.(e.target.value)
            }}
            onBlur={(e) => {
              formField.onBlur()
              field.onBlur?.(e.target.value)
            }}
            onFocus={(e) => field.onFocus?.(e.target.value)}
          />
        )

      case "select":
        return (
          <Select
            value={formField.value}
            onValueChange={(value) => {
              formField.onChange(value)
              field.onChange?.(value)
            }}
            disabled={isFieldDisabled}
          >
            <SelectTrigger className={field.inputClassName}>
              <SelectValue placeholder={field.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                  className={field.optionClassName}
                >
                  <div className="flex items-center gap-2">
                    {option.icon}
                    {option.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case "switch":
      case "toggle":
        return (
          <Switch
            checked={formField.value}
            onCheckedChange={(checked) => {
              formField.onChange(checked)
              field.onChange?.(checked)
            }}
            disabled={isFieldDisabled}
            className={field.inputClassName}
          />
        )

      case "checkbox":
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={field.name}
              checked={formField.value}
              onCheckedChange={(checked) => {
                formField.onChange(checked)
                field.onChange?.(checked)
              }}
              disabled={isFieldDisabled}
              className={field.inputClassName}
            />
            <label
              htmlFor={field.name}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {field.placeholder}
            </label>
          </div>
        )

      case "radio":
        return (
          <div
            className={cn(
              "flex flex-col gap-2",
              field.inlineOptions && "flex-row",
            )}
          >
            {field.options?.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <input
                  type="radio"
                  id={`${field.name}-${option.value}`}
                  value={option.value}
                  checked={formField.value === option.value}
                  onChange={() => {
                    formField.onChange(option.value)
                    field.onChange?.(option.value)
                  }}
                  disabled={isFieldDisabled || option.disabled}
                  className="size-4"
                />
                <label
                  htmlFor={`${field.name}-${option.value}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  <div className="flex items-center gap-2">
                    {option.icon}
                    {option.label}
                  </div>
                </label>
              </div>
            ))}
          </div>
        )

      case "range":
        return (
          <Input
            {...formField}
            type="range"
            disabled={isFieldDisabled}
            className={cn("w-full", field.inputClassName)}
            min={
              field.min ||
              (typeof field.validation?.min === "object"
                ? field.validation.min.value
                : field.validation?.min)
            }
            max={
              field.max ||
              (typeof field.validation?.max === "object"
                ? field.validation.max.value
                : field.validation?.max)
            }
            step={field.step}
            onChange={(e) => {
              formField.onChange(e.target.value)
              field.onChange?.(e.target.value)
            }}
          />
        )

      default:
        return (
          <Input
            {...formField}
            type="text"
            placeholder={field.placeholder}
            disabled={isFieldDisabled}
            className={field.inputClassName}
          />
        )
    }
  }

  return (
    <FormField
      key={field.name}
      control={form.control}
      name={field.name}
      render={({ field: formField }) => (
        <FormItem
          className={cn(
            field.wrapperClassName,
            field.span && `col-span-${field.span}`,
            field.hidden && "hidden",
          )}
        >
          {showLabels && field.label && (
            <FormLabel className={field.labelClassName}>
              {field.label}
              {field.required && field.showRequiredMarker && (
                <span className="text-destructive ml-1">*</span>
              )}
            </FormLabel>
          )}

          <FormControl>
            {field.customComponent ? (
              <field.customComponent field={formField} fieldConfig={field} />
            ) : (
              <div className="relative">
                {field.prefix && (
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {field.prefix}
                  </div>
                )}

                {renderFieldInput(formField)}

                {field.suffix && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {field.suffix}
                  </div>
                )}
              </div>
            )}
          </FormControl>

          {field.description && (
            <FormDescription className={field.descriptionClassName}>
              {field.description}
            </FormDescription>
          )}

          {field.helperText && (
            <p className="text-xs text-muted-foreground">{field.helperText}</p>
          )}

          <FormMessage className={field.errorClassName} />
        </FormItem>
      )}
    />
  )
}
