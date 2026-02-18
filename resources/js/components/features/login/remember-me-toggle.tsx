import { Checkbox } from "@/components/ui/common/checkbox"
import { Label } from "@/components/ui/common/label"
import { cn } from "@/lib/cn"
import { InertiaFieldConfig } from "@/types"

interface RememberMeToggleProps {
  field: boolean
  fieldConfig: InertiaFieldConfig<any> & {
    onChange?: (value: boolean) => void
  }
}

export const RememberMeToggle = ({
  field,
  fieldConfig,
}: RememberMeToggleProps) => {
  const isDisabled = fieldConfig.disabled || false

  return (
    <div className="flex items-center space-x-2">
      <Checkbox
        id="remember-me"
        checked={field || false}
        onCheckedChange={(checked) => {
          fieldConfig?.onChange?.(checked as boolean)
        }}
        disabled={isDisabled}
      />
      <Label
        htmlFor="remember-me"
        className={cn(
          "text-sm font-medium leading-none cursor-pointer",
          isDisabled && "cursor-not-allowed opacity-70",
        )}
      >
        Remember me
      </Label>
    </div>
  )
}
