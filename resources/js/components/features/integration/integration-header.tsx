"use client"

import { format } from "date-fns"
import { CalendarIcon, Plus, Search } from "lucide-react"
import { parseAsString, parseAsStringEnum, useQueryState } from "nuqs"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/common/button"
import { Calendar } from "@/components/ui/common/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/common/pop-over"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/common/select"
import { Input } from "@/components/ui/inputs/input"
import { useDebounce } from "@/hooks/ui/use-debounce"
import { useDynamicDialog } from "@/hooks/ui/use-dynamic-dialog"
import { cn } from "@/lib/cn"
import { CreateAppForm } from "./create-app-form"

export const IntegrationHeader = () => {
  const { openDialog } = useDynamicDialog()

  const [search, setSearch] = useQueryState(
    "search",
    parseAsString.withDefault(""),
  )
  const [searchBy, setSearchBy] = useQueryState(
    "search_by",
    parseAsStringEnum(["name", "tag"]).withDefault("name"),
  )
  const [dateFromQuery, setDateFromQuery] = useQueryState(
    "date_from",
    parseAsString.withDefault(""),
  )
  const [dateToQuery, setDateToQuery] = useQueryState(
    "date_to",
    parseAsString.withDefault(""),
  )

  const [localDateFrom, setLocalDateFrom] = useState<string>(dateFromQuery)
  const [localDateTo, setLocalDateTo] = useState<string>(dateToQuery)

  const debouncedDateFrom = useDebounce(localDateFrom, 500)
  const debouncedDateTo = useDebounce(localDateTo, 500)

  useEffect(() => {
    setLocalDateFrom(dateFromQuery)
  }, [dateFromQuery])

  useEffect(() => {
    setLocalDateTo(dateToQuery)
  }, [dateToQuery])

  useEffect(() => {
    if (
      (debouncedDateFrom && debouncedDateTo) ||
      (!debouncedDateFrom && !debouncedDateTo)
    ) {
      setDateFromQuery(debouncedDateFrom || null)
      setDateToQuery(debouncedDateTo || null)
    }
  }, [debouncedDateFrom, debouncedDateTo, setDateFromQuery, setDateToQuery])

  const handleCreate = () => {
    openDialog({
      title: "Create App",
      description:
        "Create the details for the app that needed to be integrated.",
      children: <CreateAppForm />,
    })
  }

  const handleSearchChange = (value: string) => {
    setSearch(value || null)
  }

  const handleSearchByChange = (value: "name" | "tag") => {
    setSearchBy(value)
  }

  const handleDateFromChange = (date: Date | undefined) => {
    const dateString = date ? format(date, "yyyy-MM-dd") : ""
    setLocalDateFrom(dateString)
  }

  const handleDateToChange = (date: Date | undefined) => {
    const dateString = date ? format(date, "yyyy-MM-dd") : ""
    setLocalDateTo(dateString)
  }

  const clearDateFilters = () => {
    setLocalDateFrom("")
    setLocalDateTo("")
    setDateFromQuery(null)
    setDateToQuery(null)
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1">
          <h2 className="text-lg sm:text-xl font-semibold">Integrations</h2>
          <p className="text-muted-foreground text-xs sm:text-sm">
            Connect USI BridgePOS with other Bridge applications
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end sm:gap-3">
          <div className="flex items-center gap-0">
            <Select value={searchBy} onValueChange={handleSearchByChange}>
              <SelectTrigger className="w-20 rounded-r-none border-r-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="tag">Tag</SelectItem>
              </SelectContent>
            </Select>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={`Search apps by ${searchBy}...`}
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-9 rounded-l-none w-full sm:w-64"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full sm:w-40 justify-start text-left font-normal",
                    !localDateFrom && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {localDateFrom
                    ? format(new Date(localDateFrom), "MMM dd, yyyy")
                    : "From"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={localDateFrom ? new Date(localDateFrom) : undefined}
                  onSelect={handleDateFromChange}
                  autoFocus
                />
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full sm:w-40 justify-start text-left font-normal",
                    !localDateTo && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {localDateTo
                    ? format(new Date(localDateTo), "MMM dd, yyyy")
                    : "To"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={localDateTo ? new Date(localDateTo) : undefined}
                  onSelect={handleDateToChange}
                  initialFocus
                  disabled={(date) =>
                    localDateFrom ? date < new Date(localDateFrom) : false
                  }
                />
              </PopoverContent>
            </Popover>

            {(localDateFrom || localDateTo) && (
              <Button variant="ghost" size="sm" onClick={clearDateFilters}>
                Clear
              </Button>
            )}
          </div>

          <Button
            variant="bridge_digital"
            onClick={handleCreate}
            className="w-full sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create App
          </Button>
        </div>
      </div>
    </div>
  )
}
