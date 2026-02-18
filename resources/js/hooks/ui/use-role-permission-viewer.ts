import { create } from "zustand"
import { immer } from "zustand/middleware/immer"
import { PermissionType } from "@/config/roles-features-permissions-template"
import { User } from "@/types"

interface RolePermissionFeatureViewerState {
  user: User | null
  setUser: (user: User) => void
  permissionWrapper: (featureTag: string, permission: string) => boolean
  viewWrapper: (
    allowedRoles?: string[],
    allowedFeatures?: string[],
    allowedLocations?: string[],
    allowedPermissions?: readonly string[] | PermissionType[],
    userContext?: User | null,
  ) => boolean
}

export const useRolePermissionFeatureViewer =
  create<RolePermissionFeatureViewerState>()(
    immer((set, get) => ({
      user: null,

      setUser: (user) =>
        set((state) => {
          state.user = user
        }),

      permissionWrapper: (featureTag, permission) => {
        const user = get().user
        if (!user) return false

        const feature = user.user_features.find((f) => f.tag === featureTag)
        if (!feature) return false

        return feature.permissions.includes(permission)
      },

      viewWrapper: (
        allowedRoles = [],
        allowedFeatures = [],
        allowedLocations = [],
        allowedPermissions = [],
        userContext = null,
      ) => {
        const user = userContext || get().user
        if (!user) return false

        if (
          allowedRoles.length === 0 &&
          allowedFeatures.length === 0 &&
          allowedLocations.length === 0
        ) {
          return true
        }

        if (allowedLocations.length > 0) {
          const hasLocation = user.assigned_stock_locations?.some((loc) =>
            allowedLocations.includes(loc.name),
          )
          if (!hasLocation) return false
        }

        if (allowedRoles.length > 0) {
          const hasRole = user.roles.some((role) =>
            allowedRoles.includes(role.name),
          )
          if (!hasRole) return false
        }

        if (allowedFeatures.length > 0) {
          const matchingFeatures = user.user_features.filter((feature) =>
            allowedFeatures.includes(feature.tag),
          )

          if (matchingFeatures.length === 0) {
            return false
          }

          if (allowedPermissions.length > 0) {
            const hasPermission = matchingFeatures.some((f) =>
              f.permissions.some((p) =>
                (allowedPermissions as readonly string[]).includes(p),
              ),
            )
            if (!hasPermission) return false
          }
        }

        return true
      },
    })),
  )
