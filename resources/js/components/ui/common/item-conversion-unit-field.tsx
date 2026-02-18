import { InertiaFormProps } from "@inertiajs/react"
import { AnimatePresence, motion, Variants } from "framer-motion"
import { Check, ChevronsUpDown, Minus, Plus, X } from "lucide-react"
import { useEffect, useState } from "react"

import { useConversionStore } from "@/components/features/stock-in/use-conversion-store"
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/common/select"
import { Input } from "@/components/ui/inputs/input"
import { cn } from "@/lib/cn"
import { Item, UnitOfMeasure } from "@/types"

interface ConversionUnitsFieldProps {
  form: InertiaFormProps<any>
  disabled?: boolean
  itemUnitType: "not_set" | "set"
  unit_of_measures: UnitOfMeasure[]
  items: Item[]
}

const variants: Variants = {
  initial: { opacity: 0, height: 0, scale: 0.98, marginBottom: 0 },
  animate: {
    opacity: 1,
    height: "auto",
    scale: 1,
    marginBottom: 0,
    transition: { type: "spring", stiffness: 350, damping: 25, mass: 1 },
  },
  exit: {
    opacity: 0,
    height: 0,
    scale: 0.95,
    marginBottom: 0,
    transition: { duration: 0.2, ease: "easeInOut" },
  },
}

export const ConversionUnitsField = ({
  form,
  disabled,
  itemUnitType,
  unit_of_measures,
  items,
}: ConversionUnitsFieldProps) => {
  const { units, initializeUnits, addUnit, removeUnit, updateUnit, reset } =
    useConversionStore()

  const fieldName =
    itemUnitType === "set" ? "components_blueprint" : "conversion_units"

  useEffect(() => {
    const currentData = form.data[fieldName] || []
    initializeUnits(currentData, itemUnitType)

    return () => {
      reset()
    }
  }, [itemUnitType, fieldName])

  const syncToForm = () => {
    const freshUnits = useConversionStore.getState().units
    form.setData(fieldName, freshUnits)
  }

  const handleAdd = () => {
    addUnit("not_set")

    const currentUnits = useConversionStore.getState().units

    if (currentUnits.length >= 2) {
      const previousUnit = currentUnits[currentUnits.length - 2]
      if (previousUnit?.base_uom_id) {
        updateUnit(
          currentUnits.length - 1,
          "purchase_uom_id",
          previousUnit.base_uom_id,
        )
      }
    }

    syncToForm()
  }

  const handleRemove = (index: number) => {
    removeUnit(index)
    syncToForm()
  }

  const handleUpdate = (index: number, field: any, value: any) => {
    updateUnit(index, field, value)
    syncToForm()
  }

  const [openCombobox, setOpenCombobox] = useState<number | null>(null)

  if (itemUnitType === "not_set") {
    return (
      <div className="flex w-full flex-col gap-3">
        <AnimatePresence initial={false} mode="popLayout">
          {units.map((unit, index) => (
            <motion.div
              key={`uom-${index}`}
              layout="position"
              variants={variants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="relative grid grid-cols-1 gap-3 rounded-lg border border-gray-200 bg-white p-3 shadow-sm transition-all md:grid-cols-[1fr_auto_1fr_auto_1fr_auto] md:items-end md:gap-4"
            >
              <div className="w-full">
                <Label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                  Purchase Unit
                </Label>
                <Select
                  value={
                    unit.purchase_uom_id ? String(unit.purchase_uom_id) : ""
                  }
                  onValueChange={(val) =>
                    handleUpdate(index, "purchase_uom_id", Number(val))
                  }
                  disabled={disabled}
                >
                  <SelectTrigger className="h-9 border-gray-200 bg-gray-50/50 shadow-none focus:bg-white focus:ring-1 focus:ring-gray-950">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {unit_of_measures.map((uom) => (
                        <SelectItem key={uom.id} value={String(uom.id)}>
                          {uom.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div className="hidden h-9 items-center justify-center font-medium text-gray-400 md:flex">
                =
              </div>
              <div className="text-xs font-medium text-gray-400 md:hidden">
                Equals
              </div>

              <div className="w-full">
                <Label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                  Factor
                </Label>
                <Input
                  type="number"
                  className="h-9 border-gray-200 bg-gray-50/50 shadow-none focus:bg-white focus:ring-1 focus:ring-gray-950"
                  placeholder="1"
                  min={0}
                  value={unit.conversion_factor || ""}
                  onChange={(e) =>
                    handleUpdate(
                      index,
                      "conversion_factor",
                      Number(e.target.value),
                    )
                  }
                  disabled={disabled}
                />
              </div>

              <div className="hidden h-9 items-center justify-center font-medium text-gray-400 md:flex">
                ×
              </div>
              <div className="text-xs font-medium text-gray-400 md:hidden">
                Multiplied by
              </div>

              <div className="w-full">
                <Label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                  Base Unit
                </Label>
                <Select
                  value={unit.base_uom_id ? String(unit.base_uom_id) : ""}
                  onValueChange={(val) =>
                    handleUpdate(index, "base_uom_id", Number(val))
                  }
                  disabled={disabled}
                >
                  <SelectTrigger className="h-9 border-gray-200 bg-gray-50/50 shadow-none focus:bg-white focus:ring-1 focus:ring-gray-950">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {unit_of_measures.map((uom) => (
                        <SelectItem key={uom.id} value={String(uom.id)}>
                          {uom.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end md:block">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-gray-400 hover:bg-red-50 hover:text-red-600"
                  disabled={disabled || units.length === 1}
                  onClick={() => handleRemove(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        <motion.div layout="position">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAdd}
            disabled={disabled}
            className="w-full border-dashed border-gray-300 bg-transparent text-gray-500 hover:border-gray-400 hover:bg-gray-50 hover:text-gray-900"
          >
            <Plus className="mr-2 h-3.5 w-3.5" />
            Add Conversion Step
          </Button>
        </motion.div>
      </div>
    )
  }

  if (itemUnitType === "set") {
    return (
      <div className="flex w-full flex-col gap-3">
        <AnimatePresence initial={false} mode="popLayout">
          {units.map((unit, index) => (
            <motion.div
              key={`set-${index}`}
              layout="position"
              variants={variants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-3 shadow-sm transition-all sm:flex-row sm:items-center"
            >
              <div className="flex-1">
                <Popover
                  open={openCombobox === index}
                  onOpenChange={(open) => setOpenCombobox(open ? index : null)}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      disabled={disabled}
                      className={cn(
                        "w-full justify-between border-gray-200 bg-gray-50/50 font-normal shadow-none focus:bg-white focus:ring-1 focus:ring-gray-950",
                        !unit.child_item_id && "text-muted-foreground",
                      )}
                    >
                      {unit.child_item_id
                        ? items.find((i) => i.id === unit.child_item_id)
                            ?.description
                        : "Select component..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-75 p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search items..." />
                      <CommandList>
                        <CommandEmpty>No item found.</CommandEmpty>
                        <CommandGroup>
                          {items.map((item) => (
                            <CommandItem
                              key={item.id}
                              value={item.description}
                              onSelect={() => {
                                handleUpdate(index, "child_item_id", item.id)
                                setOpenCombobox(null)
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  unit.child_item_id === item.id
                                    ? "opacity-100"
                                    : "opacity-0",
                                )}
                              />
                              {item.description}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-9 items-center rounded-md border border-gray-200 bg-white shadow-sm">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-full w-8 rounded-none rounded-l-md px-2 text-gray-500 hover:bg-gray-50"
                    disabled={disabled}
                    onClick={() =>
                      handleUpdate(
                        index,
                        "quantity",
                        Math.max(1, (unit.quantity || 1) - 1),
                      )
                    }
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <div className="flex w-10 select-none items-center justify-center text-sm font-medium text-gray-900">
                    {unit.quantity || 1}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-full w-8 rounded-none rounded-r-md px-2 text-gray-500 hover:bg-gray-50"
                    disabled={disabled}
                    onClick={() =>
                      handleUpdate(index, "quantity", (unit.quantity || 1) + 1)
                    }
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-gray-400 hover:bg-red-50 hover:text-red-600"
                  disabled={disabled || units.length === 1}
                  onClick={() => handleRemove(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        <motion.div layout="position">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAdd}
            disabled={disabled}
            className="w-full border-dashed border-gray-300 bg-transparent text-gray-500 hover:border-gray-400 hover:bg-gray-50 hover:text-gray-900"
          >
            <Plus className="mr-2 h-3.5 w-3.5" />
            Add Component
          </Button>
        </motion.div>
      </div>
    )
  }

  return null
}
