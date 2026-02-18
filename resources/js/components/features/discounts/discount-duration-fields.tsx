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
import { InertiaFormConfig } from "@/types"
import { DiscountPayload } from "@/types/operation-utility.validation"

interface DiscountDurationFieldsProps {
  form: InertiaFormConfig<DiscountPayload>
}

export const DiscountDurationFields = ({
  form,
}: DiscountDurationFieldsProps) => {
  return (
    <div className="grid w-full grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label>Start Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left font-normal",
                !form.data.start_date && "text-muted-foreground",
              )}
              disabled={form.processing}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {form.data.start_date ? (
                format(new Date(form.data.start_date), "PPP")
              ) : (
                <span>Pick a date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={
                form.data.start_date
                  ? new Date(form.data.start_date)
                  : undefined
              }
              onSelect={(date) =>
                form.setData(
                  "start_date",
                  date ? format(date, "yyyy-MM-dd") : "",
                )
              }
              autoFocus
            />
          </PopoverContent>
        </Popover>
        {form.errors.start_date && (
          <p className="text-sm text-destructive">{form.errors.start_date}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>End Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left font-normal",
                !form.data.end_date && "text-muted-foreground",
              )}
              disabled={form.processing}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {form.data.end_date ? (
                format(new Date(form.data.end_date), "PPP")
              ) : (
                <span>Pick a date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={
                form.data.end_date ? new Date(form.data.end_date) : undefined
              }
              onSelect={(date) =>
                form.setData("end_date", date ? format(date, "yyyy-MM-dd") : "")
              }
              autoFocus
            />
          </PopoverContent>
        </Popover>
        {form.errors.end_date && (
          <p className="text-sm text-destructive">{form.errors.end_date}</p>
        )}
      </div>
    </div>
  )
}
