import { CornerDownRight } from "lucide-react"
import { UnitOfMeasure } from "@/types"

const MAX_DEPTH = 10

export const RecursiveUomNode = ({
  baseUomId,
  conversions,
  unitOfMeasures,
  depth = 0,
  visitedIds = new Set<number>(),
}: {
  baseUomId: number
  conversions: any[]
  unitOfMeasures: UnitOfMeasure[]
  depth?: number
  visitedIds?: Set<number>
}) => {
  if (depth > MAX_DEPTH) return null

  const children = conversions.filter((c) => c.base_uom_id === baseUomId)

  if (children.length === 0) return null

  const currentVisited = new Set(visitedIds)
  currentVisited.add(baseUomId)

  return (
    <div className="flex flex-col gap-1">
      {children.map((child) => {
        if (currentVisited.has(child.purchase_uom_id)) {
          return null
        }

        const uom = unitOfMeasures.find((u) => u.id === child.purchase_uom_id)
        const uomName = uom?.code ?? uom?.name ?? "Unknown"
        const factor = Number(child.conversion_factor)

        const baseUom = unitOfMeasures.find((u) => u.id === baseUomId)
        const baseName = baseUom?.code ?? baseUom?.name ?? "Unit"

        return (
          <div key={child.id} className="flex flex-col">
            <div
              className="flex items-center gap-1.5 text-xs text-muted-foreground"
              style={{ paddingLeft: `${depth * 12}px` }}
            >
              <CornerDownRight className="size-3 opacity-50" />
              <span className="whitespace-nowrap">
                <span className="text-foreground font-medium">1 {uomName}</span>
                <span className="mx-1 opacity-70">=</span>
                {factor} {baseName}
              </span>
            </div>

            <RecursiveUomNode
              baseUomId={child.purchase_uom_id}
              conversions={conversions}
              unitOfMeasures={unitOfMeasures}
              depth={depth + 1}
              visitedIds={currentVisited}
            />
          </div>
        )
      })}
    </div>
  )
}
