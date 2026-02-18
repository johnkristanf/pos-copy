import { PopoverTrigger } from "@radix-ui/react-popover"
import { Circle, QrCode } from "lucide-react"
import React from "react"
import { match, P } from "ts-pattern"
import { Checkbox } from "@/components/ui/common/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/common/select"
import { Switch } from "@/components/ui/common/switch"
import { Input } from "@/components/ui/inputs/input"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/inputs/input-otp"
import { cn } from "@/lib/cn"
import { InertiaFieldConfig, InertiaFormConfig } from "@/types"
import { Button } from "../common/button"
import { MultiSelect } from "../common/multi-select"
import { PasswordStrengthMeter } from "../common/password-strength"
import { Popover, PopoverContent } from "../common/pop-over"
import { ToggleGroup, ToggleGroupItem } from "../common/toggle-group"
import { BlobUploadInput } from "../inputs/blob-upload-input"

interface InertiaFormFieldRendererProps<TForm extends Record<string, any>> {
  field: InertiaFieldConfig<TForm>
  form: InertiaFormConfig<TForm>
  disabled?: boolean
  showLabels?: boolean
}

export function InertiaFormFieldRenderer<TForm extends Record<string, any>>({
  field,
  form,
  disabled = false,
  showLabels = true,
}: InertiaFormFieldRendererProps<TForm>) {
  const [popoverSearchQuery, setPopoverSearchQuery] = React.useState("")

  if (field.renderCondition && !field.renderCondition(form.data)) {
    return null
  }

  const isFieldDisabled =
    disabled ||
    field.disabled ||
    (field.enableCondition && !field.enableCondition(form.data))

  const fieldValue = form.data[field.name]
  const fieldError = form.errors[field.name]

  const handleChange = (value: any) => {
    form.setData(field.name, value)
    field.onChange?.(value)
  }

  const handleBlur = (value: any) => {
    field.onBlur?.(value)
  }

  const handleFocus = (value: any) => {
    field.onFocus?.(value)
  }

  const inputElement = match(field.type)
    .with("number", () => (
      <Input
        type="number"
        value={fieldValue === 0 || !fieldValue ? "" : fieldValue}
        onChange={(e) => {
          const val = e.target.value
          const numericVal = val === "" ? 0 : Number(val)
          handleChange(numericVal)
        }}
        onBlur={(e) => handleBlur(Number(e.target.value))}
        onFocus={(e) => handleFocus(Number(e.target.value))}
        placeholder={field.placeholder}
        disabled={isFieldDisabled}
        step={field.step || "any"}
        className={cn(
          field.inputClassName,
          fieldError && "border-destructive focus-visible:ring-destructive",
        )}
      />
    ))
    .with(P.union("text", "email", "phone", "color", "date"), (type) => (
      <Input
        type={type}
        value={fieldValue || ""}
        onChange={(e) => handleChange(e.target.value)}
        onBlur={(e) => handleBlur(e.target.value)}
        onFocus={(e) => handleFocus(e.target.value)}
        placeholder={field.placeholder}
        disabled={isFieldDisabled}
        readOnly={field.readOnly}
        className={cn(
          field.inputClassName,
          field.prefix && "pl-10",
          field.suffix && "pr-10",
          fieldError && "border-destructive focus-visible:ring-destructive",
        )}
      />
    ))
    .with("password", () => (
      <Input
        isPassword
        value={fieldValue || ""}
        onChange={(e) => handleChange(e.target.value)}
        onBlur={(e) => handleBlur(e.target.value)}
        onFocus={(e) => handleFocus(e.target.value)}
        placeholder={field.placeholder}
        disabled={isFieldDisabled}
        readOnly={field.readOnly}
        autoFocus={field.autoFocus}
        autoComplete={field.autoComplete}
        className={cn(
          field.inputClassName,
          field.prefix && "pl-10",
          fieldError && "border-destructive focus-visible:ring-destructive",
        )}
      />
    ))
    .with("password-input", () => (
      <div className="space-y-2">
        <Input
          type="password"
          isPassword
          value={fieldValue || ""}
          onChange={(e) => handleChange(e.target.value)}
          onBlur={(e) => handleBlur(e.target.value)}
          onFocus={(e) => handleFocus(e.target.value)}
          placeholder={field.placeholder}
          disabled={isFieldDisabled}
          readOnly={field.readOnly}
          autoFocus={field.autoFocus}
          autoComplete={field.autoComplete}
          className={cn(
            field.inputClassName,
            field.prefix && "pl-10",
            fieldError && "border-destructive focus-visible:ring-destructive",
          )}
        />
        {field.showStrengthIndicator && (
          <div className="w-full">
            <PasswordStrengthMeter
              password={fieldValue || ""}
              onStrengthChange={(_isStrong) => {
                field.onChange?.(fieldValue)
              }}
            />
          </div>
        )}
      </div>
    ))
    .with("otp", () => (
      <InputOTP
        maxLength={field.otpLength || 6}
        value={fieldValue || ""}
        onChange={(value) => handleChange(value)}
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
    ))
    .with("textarea", () => (
      <textarea
        value={fieldValue || ""}
        onChange={(e) => handleChange(e.target.value)}
        onBlur={(e) => handleBlur(e.target.value)}
        onFocus={(e) => handleFocus(e.target.value)}
        placeholder={field.placeholder}
        disabled={isFieldDisabled}
        readOnly={field.readOnly}
        rows={field.rows || 3}
        className={cn(
          "flex min-h-15 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          field.inputClassName,
          field.prefix && "pl-10",
          field.suffix && "pr-10",
          fieldError && "border-destructive focus-visible:ring-destructive",
        )}
      />
    ))
    .with("select", () => (
      <Select
        value={fieldValue ? String(fieldValue) : undefined}
        onValueChange={(value) => {
          const matchingOption = field.options?.find(
            (opt) => String(opt.value) === value,
          )
          const finalValue = matchingOption ? matchingOption.value : value
          handleChange(finalValue)
        }}
        disabled={isFieldDisabled}
      >
        <SelectTrigger
          className={cn(
            field.inputClassName,
            fieldError && "border-destructive focus:ring-destructive",
          )}
        >
          <SelectValue placeholder={field.placeholder} />
        </SelectTrigger>
        <SelectContent>
          {field.options?.map((option) => (
            <SelectItem
              key={String(option.value)}
              value={String(option.value)}
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
    ))
    .with("multi-select", () => (
      <MultiSelect
        options={field.options || []}
        value={fieldValue || []}
        onChange={handleChange}
        placeholder={field.placeholder}
        disabled={isFieldDisabled}
        className={cn(
          field.inputClassName,
          fieldError && "border-destructive focus:ring-destructive",
        )}
        maxDisplay={field.maxDisplay}
        searchable={field.searchable}
        clearable={field.clearable}
      />
    ))
    .with(P.union("switch", "toggle"), () => (
      <div className="flex items-start gap-4">
        <Switch
          checked={fieldValue}
          onCheckedChange={handleChange}
          disabled={isFieldDisabled}
          className={cn("mt-1", field.inputClassName)}
        />
        <div className="flex-1 space-y-1">
          <div className="text-sm font-medium leading-none cursor-pointer">
            {field.label}
            {field.required && field.showRequiredMarker && (
              <span className="text-destructive ml-1">*</span>
            )}
          </div>
          {field.description && (
            <p className="text-sm text-muted-foreground">{field.description}</p>
          )}
        </div>
      </div>
    ))
    .with("checkbox", () => (
      <div className="flex items-center space-x-2">
        <Checkbox
          id={field.name}
          checked={fieldValue}
          onCheckedChange={handleChange}
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
    ))
    .with("radio", () => (
      <div
        className={cn("flex flex-col gap-2", field.inlineOptions && "flex-row")}
      >
        {field.options?.map((option) => (
          <div key={option.value} className="flex items-center space-x-2">
            <input
              type="radio"
              id={`${field.name}-${option.value}`}
              value={option.value}
              checked={fieldValue === option.value}
              onChange={() => handleChange(option.value)}
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
    ))
    .with("range", () => (
      <Input
        type="range"
        value={fieldValue || ""}
        onChange={(e) => handleChange(e.target.value)}
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
      />
    ))
    .with("blob-attachment", () => (
      <BlobUploadInput
        value={fieldValue}
        itemId={form.data.id}
        onChange={handleChange}
        disabled={isFieldDisabled}
        isUserSignature={field.isUserSignature}
        fieldName={field.name}
      />
    ))
    .with("toggle-group", () => (
      <ToggleGroup
        type="single"
        value={String(fieldValue || "")}
        onValueChange={(value) => {
          if (value) {
            const matchingOption = field.options?.find(
              (opt) => String(opt.value) === value,
            )
            if (matchingOption) {
              handleChange(matchingOption.value)
            }
          }
        }}
        variant="outline"
        size="sm"
        className="flex gap-2"
      >
        {field.options?.map((option) => (
          <ToggleGroupItem
            key={String(option.value)}
            value={String(option.value)}
            aria-label={`Toggle ${option.label}`}
            className="border-l! rounded-md data-[state=on]:bg-transparent data-[state=on]:*:[svg]:fill-neutral-900 data-[state=on]:*:[svg]:stroke-neutral-900"
          >
            <Circle />
            {option.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    ))
    .with("popover", () => {
      const valueAsArray: any[] = Array.isArray(fieldValue) ? fieldValue : []

      const filteredOptions = field.options?.filter((option) => {
        if (!popoverSearchQuery) return true
        const query = popoverSearchQuery.toLowerCase()
        return (
          option.label.toLowerCase().includes(query) ||
          option.sku?.toLowerCase().includes(query) ||
          option.attributes?.toLowerCase().includes(query)
        )
      })

      return (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              disabled={isFieldDisabled}
              className={cn(
                "w-full justify-start text-left font-normal",
                !valueAsArray.length && "text-muted-foreground",
                field.inputClassName,
              )}
            >
              {valueAsArray.length > 0
                ? `${valueAsArray.length} item${valueAsArray.length === 1 ? "" : "s"} selected`
                : field.placeholder || "Select items"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-4" align="start">
            <div className="space-y-3">
              {field.showSearch && (
                <Input
                  placeholder="Search..."
                  className="h-8"
                  value={popoverSearchQuery}
                  onChange={(e) => {
                    setPopoverSearchQuery(e.target.value)
                    field.onSearch?.(e.target.value)
                  }}
                />
              )}
              <div className="space-y-2 max-h-50 overflow-y-auto">
                {filteredOptions?.map((option) => (
                  <div
                    key={String(option.value)}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      id={`${field.name}-${option.value}`}
                      checked={valueAsArray.includes(option.value)}
                      onCheckedChange={(checked) => {
                        const newValue = checked
                          ? [...valueAsArray, option.value]
                          : valueAsArray.filter((v) => v !== option.value)
                        handleChange(newValue)
                      }}
                      disabled={option.disabled}
                    />
                    <label
                      htmlFor={`${field.name}-${option.value}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                    >
                      <div className="flex items-center gap-2">
                        {option.label}
                        <div className="text-neutral-700">
                          {option.attributes}
                        </div>
                      </div>
                      {option.sku != null && (
                        <div className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                          <QrCode className="h-3 w-3" />
                          {option.sku}
                        </div>
                      )}
                    </label>
                  </div>
                ))}
                {filteredOptions?.length === 0 && (
                  <div className="text-sm text-muted-foreground text-center py-4">
                    No items found
                  </div>
                )}
              </div>
              {field.showClearButton && valueAsArray.length > 0 && (
                <div className="pt-2 border-t">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleChange([])}
                    className="w-full"
                  >
                    Clear all
                  </Button>
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>
      )
    })
    .otherwise(() => (
      <Input
        type="text"
        value={fieldValue || ""}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={field.placeholder}
        disabled={isFieldDisabled}
        className={cn(
          field.inputClassName,
          fieldError && "border-destructive focus-visible:ring-destructive",
        )}
      />
    ))

  return (
    <div
      className={cn(
        field.wrapperClassName,
        field.span && `col-span-${field.span}`,
        field.hidden && "hidden",
      )}
    >
      {field.type !== "switch" &&
        field.type !== "toggle" &&
        showLabels &&
        field.label && (
          <label
            htmlFor={field.name}
            className={cn(
              "text-sm font-medium leading-none",
              field.labelClassName,
            )}
          >
            {field.label}
            {field.required && field.showRequiredMarker && (
              <span className="text-destructive ml-1">*</span>
            )}
          </label>
        )}

      <div
        className={cn(
          field.type !== "switch" && field.type !== "toggle" && "mt-2",
        )}
      >
        {field.customComponent ? (
          field.customComponent({ field: fieldValue, fieldConfig: field })
        ) : (
          <div className="relative">
            {field.prefix &&
              field.type !== "switch" &&
              field.type !== "toggle" && (
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {field.prefix}
                </div>
              )}

            {inputElement}

            {field.suffix &&
              field.type !== "switch" &&
              field.type !== "toggle" && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {field.suffix}
                </div>
              )}
          </div>
        )}
      </div>

      {field.type !== "switch" &&
        field.type !== "toggle" &&
        field.description && (
          <p
            className={cn(
              "text-sm text-muted-foreground mt-1",
              field.descriptionClassName,
            )}
          >
            {field.description}
          </p>
        )}

      {field.helperText && (
        <p className="text-xs text-muted-foreground mt-1">{field.helperText}</p>
      )}

      {fieldError && (
        <p
          className={cn(
            "text-sm text-destructive mt-1",
            "animate-in slide-in-from-top-1 fade-in duration-200",
            field.errorClassName,
          )}
        >
          {fieldError}
        </p>
      )}
    </div>
  )
}
