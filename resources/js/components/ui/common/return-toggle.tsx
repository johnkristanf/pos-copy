import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/common/toggle-group"

export function ReturnToggleGroup() {
  return (
    <ToggleGroup
      type="single"
      variant="outline"
      defaultValue="Offset"
      className="pt-6"
    >
      <ToggleGroupItem
        value="Offset"
        aria-label="Toggle Offset"
        className="font-bold text-stone-700 data-[state=on]:bg-stone-950 data-[state=on]:text-stone-50"
      >
        Offset
      </ToggleGroupItem>
      <ToggleGroupItem
        value="Replacement"
        aria-label="Toggle Replacement"
        className="font-bold text-stone-700 data-[state=on]:bg-stone-950 data-[state=on]:text-stone-50"
      >
        Replacement
      </ToggleGroupItem>
    </ToggleGroup>
  )
}
