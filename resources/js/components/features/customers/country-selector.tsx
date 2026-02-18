import { Check, ChevronsUpDown, Globe, Pencil } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/common/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/common/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/common/pop-over"
import { Input } from "@/components/ui/inputs/input"
import { useCountries, useCountryStore } from "@/hooks/api/country"
import { cn } from "@/lib/cn"
import { Country } from "@/types"

interface CountrySelectorProps {
  value?: Country | string | null
  onChange?: (country: Country | string | null) => void
  className?: string
  disabled?: boolean
}

export function CountrySelector({
  value,
  onChange,
  className,
  disabled,
}: CountrySelectorProps) {
  const [open, setOpen] = useState(false)
  const [isManual, setIsManual] = useState(false)
  const { data: countries, isLoading, isError } = useCountries()
  const { selectedCountry: storeCountry, setSelectedCountry } =
    useCountryStore()

  const currentSelection = useMemo(() => {
    if (!countries) return null
    if (value !== undefined) {
      if (typeof value === "string") {
        return countries.find((c) => c.name.common === value) || null
      }
      return value
    }
    return storeCountry
  }, [countries, value, storeCountry])

  const sortedCountries = useMemo(() => {
    if (!countries) return []
    return [...countries].sort((a, b) =>
      a.name.common.localeCompare(b.name.common),
    )
  }, [countries])

  useEffect(() => {
    if (countries && !currentSelection && !value) {
      const defaultCountry = countries.find(
        (c) => c.name.common === "Philippines",
      )
      if (defaultCountry) {
        if (onChange) onChange(defaultCountry)
        else setSelectedCountry(defaultCountry)
      }
    }
  }, [countries, currentSelection, value, onChange, setSelectedCountry])

  const handleSelect = (countryName: string) => {
    const country =
      sortedCountries.find((c) => c.name.common === countryName) || null
    if (onChange) onChange(country)
    else setSelectedCountry(country)
    setOpen(false)
  }

  return (
    <div className={cn("flex items-end gap-2", className)}>
      <div className="flex-1">
        {isManual ? (
          <Input
            value={
              typeof value === "string"
                ? value
                : currentSelection?.name.common || ""
            }
            onChange={(e) => onChange?.(e.target.value)}
            placeholder="Enter country name manually"
            disabled={disabled}
          />
        ) : (
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className={cn(
                  "w-full justify-between",
                  !currentSelection && "text-muted-foreground",
                )}
                disabled={disabled || isLoading || isError}
              >
                <div className="flex items-center gap-2 truncate">
                  {currentSelection?.flags?.png ? (
                    <img
                      src={currentSelection.flags.png}
                      alt={currentSelection.name.common}
                      className="h-4 w-6 rounded-sm object-cover"
                    />
                  ) : (
                    <Globe className="h-4 w-4 shrink-0 opacity-50" />
                  )}
                  <span>
                    {isLoading
                      ? "Loading..."
                      : currentSelection?.name.common || "Select country..."}
                  </span>
                </div>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-75 p-0" align="start">
              <Command>
                <CommandInput placeholder="Search country..." />
                <CommandList>
                  <CommandEmpty>
                    {isError ? "Failed to load." : "No country found."}
                  </CommandEmpty>
                  <CommandGroup>
                    {sortedCountries.map((country) => (
                      <CommandItem
                        key={country.name.common}
                        value={country.name.common}
                        onSelect={handleSelect}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            currentSelection?.name.common ===
                              country.name.common
                              ? "opacity-100"
                              : "opacity-0",
                          )}
                        />
                        <div className="flex items-center gap-2">
                          {country.flags?.png && (
                            <img
                              src={country.flags.png}
                              alt=""
                              className="h-4 w-6 rounded-sm object-cover border"
                            />
                          )}
                          <span>{country.name.common}</span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        )}
      </div>
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={() => setIsManual(!isManual)}
        title={isManual ? "Switch to list" : "Type manually"}
      >
        {isManual ? (
          <Globe className="h-4 w-4" />
        ) : (
          <Pencil className="h-4 w-4" />
        )}
      </Button>
    </div>
  )
}
