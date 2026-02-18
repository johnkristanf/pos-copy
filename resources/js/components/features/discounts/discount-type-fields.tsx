import { Label } from "@/components/ui/common/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/common/select"
import { Input } from "@/components/ui/inputs/input"
import { cn } from "@/lib/cn"
import { InertiaFormConfig } from "@/types"
import { DiscountPayload } from "@/types/operation-utility.validation"

interface DiscountTypeFieldsProps {
  form: InertiaFormConfig<DiscountPayload>
  discountOptions: { value: string; label: string }[]
}

export const DiscountTypeFields = ({
  form,
  discountOptions,
}: DiscountTypeFieldsProps) => {
  return (
    <div className="grid w-full grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label className={cn(form.errors.discount_type && "text-destructive")}>
          Discount Type <span className="text-destructive">*</span>
        </Label>
        <Select
          value={form.data.discount_type}
          onValueChange={(value) => form.setData("discount_type", value as any)}
          disabled={form.processing}
        >
          <SelectTrigger
            className={cn(
              form.errors.discount_type &&
                "border-destructive focus:ring-destructive",
            )}
          >
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            {discountOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {form.errors.discount_type && (
          <p className="text-sm text-destructive">
            {form.errors.discount_type}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label className={cn(form.errors.amount && "text-destructive")}>
          Specific <span className="text-destructive">*</span>
        </Label>
        <Input
          type="number"
          value={form.data.amount === 0 ? "" : form.data.amount}
          onChange={(e) => {
            const val = e.target.value
            form.setData("amount", val === "" ? 0 : Number(val))
          }}
          disabled={form.processing}
          placeholder="Enter amount"
          className={cn(
            form.errors.amount &&
              "border-destructive focus-visible:ring-destructive",
          )}
        />
        {form.errors.amount && (
          <p className="text-sm text-destructive">{form.errors.amount}</p>
        )}
      </div>
    </div>
  )
}
