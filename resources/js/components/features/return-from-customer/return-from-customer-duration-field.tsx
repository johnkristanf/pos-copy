import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/common/button"
import { Calendar } from "@/components/ui/common/calendar"
import { Label } from "@/components/ui/common/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/common/pop-over"
import { cn } from "@/lib/cn"
import { InertiaFormProps } from "@inertiajs/react"
import { ReturnFromCustomerPayload } from "@/types/return-from-customer.validation"

interface InvoiceDateSelectionProps {
  form: InertiaFormProps<ReturnFromCustomerPayload>
  disabled?: boolean
}

export const InvoiceDateSelection = ({
  form,
  disabled,
}: InvoiceDateSelectionProps) => {
  return (
    <div className="flex flex-col gap-2 w-full">
      <Label
        className={cn(form.errors.invoice_issued_date && "text-destructive")}
      >
        Invoice Date
      </Label>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal h-9",
              !form.data.invoice_issued_date && "text-muted-foreground",
              form.errors.invoice_issued_date && "border-destructive",
            )}
            disabled={disabled || form.processing}
          >
            <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
            {form.data.invoice_issued_date ? (
              format(new Date(form.data.invoice_issued_date), "PPP")
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={
              form.data.invoice_issued_date
                ? new Date(form.data.invoice_issued_date)
                : undefined
            }
            onSelect={(date) =>
              form.setData(
                "invoice_issued_date",
                date ? format(date, "yyyy-MM-dd") : "",
              )
            }
            disabled={(date) =>
              date > new Date() || date < new Date("1900-01-01")
            }
            initialFocus
          />
        </PopoverContent>
      </Popover>

      {form.errors.invoice_issued_date && (
        <p className="text-[0.8rem] font-medium text-destructive">
          {form.errors.invoice_issued_date}
        </p>
      )}
    </div>
  )
}
