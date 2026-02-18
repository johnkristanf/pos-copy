import { Box } from "lucide-react"
import { OrderableItem, UnitOfMeasure } from "@/types"
import { RecursiveUomNode } from "./recursive-uom-node"

export const UomTreeCell = ({
  item,
  unitOfMeasures,
}: {
  item: OrderableItem
  unitOfMeasures: UnitOfMeasure[]
}) => {
  const conversions = item.conversion_units || []

  if (conversions.length === 0) {
    return (
      <span className="text-xs italic text-muted-foreground">Default Unit</span>
    )
  }

  const purchaseIds = new Set(conversions.map((c) => c.purchase_uom_id))
  const baseIds = new Set(conversions.map((c) => c.base_uom_id))

  let rootId = [...baseIds].find((id) => !purchaseIds.has(id))

  if (!rootId) rootId = conversions[0]?.base_uom_id

  if (!rootId) return null

  const rootUom = unitOfMeasures.find((u) => u.id === rootId)
  const rootName = rootUom?.code ?? rootUom?.name ?? "Base Unit"

  return (
    <div className="flex flex-col items-start justify-center py-1">
      <div className="mb-1 flex items-center gap-1.5 text-xs font-bold">
        <Box className="size-3" />
        {rootName}{" "}
        <span className="text-[10px] font-normal text-muted-foreground">
          (Base)
        </span>
      </div>

      <RecursiveUomNode
        baseUomId={rootId}
        conversions={conversions}
        unitOfMeasures={unitOfMeasures}
        visitedIds={new Set([rootId])}
      />
    </div>
  )
}
