import { Label } from "@/components/ui/common/label"
import { Input } from "@/components/ui/inputs/input"
import InputError from "@/components/ui/inputs/input-error"

export const StockLevelInputs = ({ form }: { form: any }) => {
  const handleQuantityChange = (
    field: "min_quantity" | "max_quantity",
    value: string,
  ) => {
    if (value === "") {
      form.setData(field, "")
      return
    }

    const numValue = parseFloat(value)
    if (!Number.isNaN(numValue) && numValue >= 0) {
      form.setData(field, numValue)
    }
  }

  return (
    <div className="flex w-full gap-4">
      <div className="flex-1 space-y-2">
        <Label className={form.errors.min_quantity ? "text-destructive" : ""}>
          Minimum Stocks <span className="text-destructive">*</span>
        </Label>
        <Input
          type="number"
          min="0"
          placeholder="0"
          value={form.data.min_quantity}
          onChange={(e) => handleQuantityChange("min_quantity", e.target.value)}
          onFocus={(e) => e.target.select()}
          onKeyDown={(e) => {
            if (e.key === "-" || e.key === "e") {
              e.preventDefault()
            }
          }}
          className={form.errors.min_quantity ? "border-destructive" : ""}
          disabled={form.processing}
        />
        <InputError message={form.errors.min_quantity} />
      </div>

      <div className="flex-1 space-y-2">
        <Label className={form.errors.max_quantity ? "text-destructive" : ""}>
          Maximum Stocks <span className="text-destructive">*</span>
        </Label>
        <Input
          type="number"
          min="0"
          placeholder="0"
          value={form.data.max_quantity}
          onChange={(e) => handleQuantityChange("max_quantity", e.target.value)}
          onFocus={(e) => e.target.select()}
          onKeyDown={(e) => {
            if (e.key === "-" || e.key === "e") {
              e.preventDefault()
            }
          }}
          className={form.errors.max_quantity ? "border-destructive" : ""}
          disabled={form.processing}
        />
        <InputError message={form.errors.max_quantity} />
      </div>
    </div>
  )
}
