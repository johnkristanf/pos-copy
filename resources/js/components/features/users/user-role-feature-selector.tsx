import { ChevronDown, Info, Shield, X } from "lucide-react"
import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/common/badge"
import { Button } from "@/components/ui/common/button"
import { Card, CardContent } from "@/components/ui/common/card"
import { Checkbox } from "@/components/ui/common/checkbox"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/common/pop-over"
import { ScrollArea } from "@/components/ui/common/scroll-area"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/common/tooltip"
import { Permission, Role, SpecificUserFeature } from "@/types"

interface UserRoleFeatureSelectorProps {
  field?: any
  onChange?: (roleIds: number[]) => void
  roles: Role[]
  features: SpecificUserFeature[]
  permissions: Permission[]
  isLoading?: boolean
  viewMode?: boolean
  value?: number[]
}

export function UserRoleFeatureSelector({
  field,
  onChange,
  roles,
  isLoading = false,
  viewMode = false,
  value,
}: UserRoleFeatureSelectorProps) {
  const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>(
    value || field?.value || [],
  )
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!viewMode && onChange) {
      onChange(selectedRoleIds)
    }
  }, [selectedRoleIds])

  const handleRoleToggle = (roleId: number) => {
    if (viewMode) return

    if (selectedRoleIds.includes(roleId)) {
      setSelectedRoleIds(selectedRoleIds.filter((id) => id !== roleId))
    } else {
      setSelectedRoleIds([...selectedRoleIds, roleId])
    }
  }

  const handleRemoveRole = (roleId: number) => {
    if (viewMode) return
    setSelectedRoleIds(selectedRoleIds.filter((id) => id !== roleId))
  }

  const getRoleName = (roleId: number) =>
    roles.find((r) => r.id === roleId)?.name || ""

  const getRolePermissions = (roleId: number) => {
    const role = roles.find((r) => r.id === roleId)
    if (!role || !role.app_features) return []

    const featuresMap = new Map<
      number,
      { feature: SpecificUserFeature; permissions: Permission[] }
    >()

    role.app_features?.forEach((feature: any) => {
      if (!featuresMap.has(feature.id)) {
        featuresMap.set(feature.id, { feature, permissions: [] })
      }

      if (feature.pivot?.permission_id) {
      }
    })

    const grouped = [] as { feature: any; permissions: any[] }[]

    const uniqueFeatures = Array.from(
      new Set(role.app_features?.map((f: any) => f.id)),
    )

    uniqueFeatures.forEach((fId) => {
      const featureObj = role.app_features?.find((f: any) => f.id === fId)

      const featurePerms = role.app_permissions?.filter(
        (p: any) => p.pivot.feature_id === fId,
      )

      if (featureObj && featurePerms && featurePerms.length > 0) {
        grouped.push({
          feature: featureObj,
          permissions: featurePerms,
        })
      }
    })

    return grouped
  }

  return (
    <div className="space-y-4">
      {!viewMode && (
        <div className="flex items-center gap-2">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                disabled={isLoading}
                className="w-full justify-between bg-background hover:bg-accent/50 border-input transition-colors"
              >
                {selectedRoleIds.length === 0 ? (
                  <span className="text-muted-foreground">
                    Select roles to assign...
                  </span>
                ) : (
                  <div className="flex flex-wrap gap-1.5 py-0.5 overflow-hidden">
                    {selectedRoleIds.map((id) => (
                      <Badge
                        key={id}
                        variant="secondary"
                        className="rounded-md px-1.5 py-0.5 text-[10px] font-medium border-transparent bg-secondary/50 text-secondary-foreground hover:bg-secondary/70"
                      >
                        {getRoleName(id)}
                        <div
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRemoveRole(id)
                          }}
                          className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer"
                        >
                          <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                        </div>
                      </Badge>
                    ))}
                  </div>
                )}
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-(--radix-popover-trigger-width) p-0"
              align="start"
            >
              <ScrollArea className="h-auto">
                <div className="p-1">
                  {roles.map((role) => {
                    const isSelected = selectedRoleIds.includes(role.id)
                    return (
                      <div
                        key={role.id}
                        className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors"
                        onClick={() => handleRoleToggle(role.id)}
                      >
                        <Checkbox
                          checked={isSelected}
                          className="pointer-events-none"
                          tabIndex={-1}
                        />
                        <span className="font-medium">{role.name}</span>
                      </div>
                    )
                  })}
                </div>
              </ScrollArea>
            </PopoverContent>
          </Popover>
        </div>
      )}

      {selectedRoleIds.length === 0 ? (
        <Card className="border-dashed shadow-none bg-muted/30">
          <CardContent className="flex flex-col items-center justify-center p-6 text-center">
            <div className="rounded-full bg-muted p-3 mb-3">
              <Shield className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">
              No roles assigned
            </p>
            <p className="text-xs text-muted-foreground mt-1 max-w-60">
              Assign a role to grant this user specific features and
              permissions.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {selectedRoleIds.map((roleId) => {
            const roleName = getRoleName(roleId)
            const permissions = getRolePermissions(roleId)

            return (
              <Card key={roleId} className="overflow-hidden border shadow-sm">
                <div className="bg-muted/40 px-4 py-3 border-b flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary" />
                    <span className="font-semibold text-sm">{roleName}</span>
                  </div>
                  {!viewMode && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-destructive transition-colors"
                      onClick={() => handleRemoveRole(roleId)}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
                <CardContent className="p-0">
                  {permissions.length === 0 ? (
                    <div className="p-4 text-xs text-muted-foreground text-center italic">
                      No specific features configured for this role.
                    </div>
                  ) : (
                    <div className="divide-y">
                      {permissions.map((group, idx) => (
                        <div
                          key={idx}
                          className="flex flex-col sm:flex-row sm:items-start p-3 sm:px-4 gap-2 sm:gap-4 hover:bg-muted/10 transition-colors"
                        >
                          <div className="min-w-35 pt-0.5">
                            <span className="text-xs font-medium text-foreground flex items-center gap-1.5">
                              {group.feature.name}
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <Info className="h-3 w-3 text-muted-foreground/70" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="text-xs">
                                      Feature Tag: {group.feature.tag}
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </span>
                          </div>
                          <div className="flex-1 flex flex-wrap gap-1.5">
                            {group.permissions.map((p: Permission) => (
                              <Badge
                                key={p.id}
                                variant="outline"
                                className="text-[10px] px-1.5 py-0 h-5 font-normal bg-background text-muted-foreground border-border"
                              >
                                {p.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
