import { useEffect, useRef, useState } from "react"
import { Checkbox } from "@/components/ui/common/checkbox"
import { ScrollArea } from "@/components/ui/common/scroll-area"
import { Skeleton } from "@/components/ui/fallbacks/skeleton"
import { cn } from "@/lib/cn"
import { AppFeature, FeaturePermission } from "@/types"

interface ApiKeyFeatureSelectorProps {
  field: FeaturePermission[]
  onChange?: (value: FeaturePermission[]) => void
  features?: AppFeature[]
  isLoading?: boolean
}

export const ApiKeyFeatureSelector = ({
  field,
  onChange,
  features = [],
  isLoading = false,
}: ApiKeyFeatureSelectorProps) => {
  const [selectedFeatures, setSelectedFeatures] = useState<
    Record<number, string[]>
  >({})

  const prevFieldRef = useRef<string>("")
  const prevSelectedFeaturesRef = useRef<string>("")

  useEffect(() => {
    if (!field || !Array.isArray(field)) {
      setSelectedFeatures({})
      return
    }

    const currentFieldState = JSON.stringify(field)

    if (currentFieldState !== prevFieldRef.current) {
      prevFieldRef.current = currentFieldState

      const initial: Record<number, string[]> = {}
      field.forEach((item) => {
        if (item.permissions && item.permissions.length > 0) {
          initial[item.id] = item.permissions
        }
      })

      setSelectedFeatures(initial)
      prevSelectedFeaturesRef.current = JSON.stringify(initial)
    }
  }, [field])

  useEffect(() => {
    const currentState = JSON.stringify(selectedFeatures)

    if (currentState !== prevSelectedFeaturesRef.current) {
      prevSelectedFeaturesRef.current = currentState

      const featuresArray = Object.entries(selectedFeatures)
        .filter(([_, permissions]) => permissions.length > 0)
        .map(([id, permissions]) => ({
          id: parseInt(id, 10),
          permissions,
        }))

      const timeoutId = setTimeout(() => {
        onChange?.(featuresArray)
      }, 0)

      return () => clearTimeout(timeoutId)
    }
  }, [selectedFeatures, onChange])

  const handlePermissionChange = (
    featureId: number,
    permission: string,
    checked: boolean,
  ) => {
    setSelectedFeatures((prev) => {
      const current = prev[featureId] || []

      const isAlreadyIncluded = current.includes(permission)
      if (checked && isAlreadyIncluded) return prev
      if (!checked && !isAlreadyIncluded) return prev

      const updated = checked
        ? [...current, permission]
        : current.filter((p) => p !== permission)

      if (updated.length === 0) {
        const { [featureId]: _, ...rest } = prev
        return rest
      }

      return { ...prev, [featureId]: updated }
    })
  }

  const handleSelectAll = (
    featureId: number,
    permissions: string[],
    checked: boolean,
  ) => {
    setSelectedFeatures((prev) => {
      const current = prev[featureId] || []

      if (checked && current.length === permissions.length) return prev
      if (!checked && current.length === 0) return prev

      if (!checked) {
        const { [featureId]: _, ...rest } = prev
        return rest
      }
      return {
        ...prev,
        [featureId]: permissions,
      }
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border rounded-lg p-4 space-y-2">
            <Skeleton className="h-5 w-1/3" />
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-20" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!features || features.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No features available
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <ScrollArea className="h-auto pr-4">
        <div className="space-y-3">
          {features.map((feature) => {
            const selectedPermissions = selectedFeatures[feature.id] || []
            const isAllSelected =
              selectedPermissions.length === feature.permissions.length &&
              feature.permissions.length > 0

            return (
              <div
                key={feature.id}
                className={cn(
                  "border rounded-lg p-4 transition-colors",
                  selectedPermissions.length > 0
                    ? "border-primary/50 bg-primary/5"
                    : "border-border",
                )}
              >
                <div className="flex items-center space-x-2 mb-3">
                  <Checkbox
                    id={`select-all-${feature.id}`}
                    checked={isAllSelected}
                    onCheckedChange={(checked) =>
                      handleSelectAll(
                        feature.id,
                        feature.permissions,
                        checked as boolean,
                      )
                    }
                  />
                  <label
                    htmlFor={`select-all-${feature.id}`}
                    className="text-sm font-semibold leading-none cursor-pointer"
                  >
                    {feature.name}
                  </label>
                  {selectedPermissions.length > 0 && (
                    <span className="text-xs text-muted-foreground ml-auto">
                      {selectedPermissions.length} selected
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 ml-6">
                  {feature.permissions.map((perm) => {
                    const isChecked = selectedPermissions.includes(perm)
                    return (
                      <div
                        key={perm}
                        className={cn(
                          "flex items-center space-x-2 px-3 py-2 rounded-md border transition-colors",
                          isChecked
                            ? "bg-primary/10 border-primary/30"
                            : "bg-muted/50 border-border hover:bg-muted",
                        )}
                      >
                        <Checkbox
                          id={`${feature.id}-${perm}`}
                          checked={isChecked}
                          onCheckedChange={(checked) =>
                            handlePermissionChange(
                              feature.id,
                              perm,
                              checked as boolean,
                            )
                          }
                        />
                        <label
                          htmlFor={`${feature.id}-${perm}`}
                          className="text-sm font-medium leading-none cursor-pointer capitalize"
                        >
                          {perm.replace(/_/g, " ")}
                        </label>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}
