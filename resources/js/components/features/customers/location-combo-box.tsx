import { Check, ChevronsUpDown } from "lucide-react"
import { useMemo, useState } from "react"
import { Button } from "@/components/ui/common/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/common/command"
import { Label } from "@/components/ui/common/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/common/pop-over"
import { cn } from "@/lib/cn"

interface ComboboxProps {
  label: string
  value?: string
  options: { label: string; value: string }[]
  onChange: (value: string) => void
  disabled?: boolean
  placeholder?: string
  searchPlaceholder?: string
  error?: string
  isLoading?: boolean
}

export const LocationCombobox = ({
  label,
  value,
  options,
  onChange,
  disabled,
  placeholder = "Select option",
  searchPlaceholder = "Search...",
  error,
  isLoading,
}: ComboboxProps) => {
  const [open, setOpen] = useState(false)

  const selectedLabel = useMemo(
    () => options.find((opt) => opt.value === value)?.label,
    [options, value],
  )

  return (
    <div className="space-y-2">
      <Label className={error ? "text-destructive" : ""}>
        {label} {error && <span className="text-destructive">*</span>}
      </Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between",
              !value && "text-muted-foreground",
              error && "border-destructive",
            )}
            disabled={disabled}
          >
            {isLoading ? "Loading..." : selectedLabel || placeholder}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput placeholder={searchPlaceholder} />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.label}
                    onSelect={() => {
                      onChange(option.value)
                      setOpen(false)
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === option.value ? "opacity-100" : "opacity-0",
                      )}
                    />
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
