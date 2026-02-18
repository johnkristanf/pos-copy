import { Store } from "lucide-react"
import { useState } from "react"
import { Badge } from "@/components/ui/common/badge"
import { InventoryItem } from "@/types"

export const LocationCell = ({ item }: { item: InventoryItem }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const locations = item.stocks?.map((s) => s.location) || []

  if (locations.length === 0) {
    return <span className="text-sm text-muted-foreground">—</span>
  }

  if (locations.length === 1) {
    return (
      <Badge variant="secondary" className="gap-1.5 font-normal">
        <Store className="h-3 w-3" />
        <span>{locations[0].name}</span>
      </Badge>
    )
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      <Badge variant="secondary" className="gap-1.5 font-normal">
        <Store className="h-3 w-3" />
        <span>{locations[0].name}</span>
      </Badge>

      {!isExpanded && (
        <Badge
          variant="outline"
          className="gap-1.5 font-normal cursor-pointer hover:bg-accent"
          onClick={() => setIsExpanded(true)}
        >
          <span>+{locations.length - 1} more</span>
        </Badge>
      )}

      {isExpanded &&
        locations.slice(1).map((location) => (
          <Badge
            key={location.id}
            variant="secondary"
            className="gap-1.5 font-normal"
          >
            <Store className="h-3 w-3" />
            <span>{location.name}</span>
          </Badge>
        ))}
    </div>
  )
}
