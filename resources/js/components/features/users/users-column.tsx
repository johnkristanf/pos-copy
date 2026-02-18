import {
  Briefcase,
  Building,
  Building2,
  Calendar,
  CreditCard,
  FileText,
  Mail,
  Package,
  PhilippinePeso,
  Settings,
  Shield,
  ShoppingCart,
  StoreIcon,
  TrendingUp,
  User,
  Users,
  Users as UsersIcon,
  WarehouseIcon,
} from "lucide-react"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/common/avatar"
import { Badge } from "@/components/ui/common/badge"
import { DataTableColumn } from "@/components/ui/data-table"
import { formatDate } from "@/lib/format"
import {
  Permission,
  Role,
  SpecificUserFeature,
  StockLocation,
  User as UserType,
} from "@/types"
import { UsersActions } from "./users-actions"

const getFeatureIcon = (featureTag: string) => {
  const iconMap: { [key: string]: React.ReactNode } = {
    sales_t: <TrendingUp className="h-3 w-3" />,
    cash: <PhilippinePeso className="h-3 w-3" />,
    user_m: <UsersIcon className="h-3 w-3" />,
    customer_m: <User className="h-3 w-3" />,
    company: <Building className="h-3 w-3" />,
    transaction: <FileText className="h-3 w-3" />,
    pricing: <CreditCard className="h-3 w-3" />,
    warehouse_m: <Package className="h-3 w-3" />,
  }
  return iconMap[featureTag] || <Settings className="h-3 w-3" />
}

const getRoleIcon = (roleName: string) => {
  const iconMap: { [key: string]: React.ReactNode } = {
    "Sales Officer": <TrendingUp className="h-3 w-3" />,
    Cashier: <CreditCard className="h-3 w-3" />,
    "Inventory Officer": <Package className="h-3 w-3" />,
    "Inventory Manager": <Settings className="h-3 w-3" />,
    "Purchasing & Sales Head": <Briefcase className="h-3 w-3" />,
    Merchandiser: <ShoppingCart className="h-3 w-3" />,
    "Executive Vice President": <Building className="h-3 w-3" />,
  }
  return iconMap[roleName] || <Shield className="h-3 w-3" />
}

const getUserInitials = (user: UserType) => {
  const firstInitial = user.first_name?.[0]?.toUpperCase() || ""
  const lastInitial = user.last_name?.[0]?.toUpperCase() || ""
  return `${firstInitial}${lastInitial}` || "U"
}

export const getUsersColumns = (
  roles: Role[] = [],
  features: SpecificUserFeature[] = [],
  permissions: Permission[] = [],
  assigned_stock_locations: StockLocation[] = [],
  onActionStart?: (id: number | null) => void,
): DataTableColumn<UserType>[] => [
  {
    key: "name",
    header: (
      <div className="ml-5 flex items-center gap-2">
        <Users className="size-3" />
        <span>Name</span>
      </div>
    ),
    mobileLabel: "Name",
    sortable: true,
    cell: (user) => (
      <div className="ml-5">
        <div className="font-medium flex items-center gap-3">
          <Avatar className="size-10 ring-1 ring-primary/5">
            <AvatarImage src={user.user_image ?? user.name} alt={user.name} />
            <AvatarFallback className="text-black">
              {getUserInitials(user)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <div className="font-medium">
              {user.first_name} {user.middle_name ? `${user.middle_name} ` : ""}
              {user.last_name}
            </div>
            <div className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
              <Mail className="size-3" />
              {user.email}
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    key: "locations",
    header: (
      <div className="flex items-center gap-2">
        <Building2 className="size-3" />
        <span>Locations</span>
      </div>
    ),
    mobileLabel: "Locations",
    cell: (user) => (
      <div className="flex flex-wrap gap-1">
        {user.assigned_stock_locations &&
        user.assigned_stock_locations.length > 0 ? (
          user.assigned_stock_locations.map((loc) => (
            <Badge
              key={loc.id}
              variant="outline"
              className="gap-1.5 font-normal"
            >
              {loc.name === "store" ? (
                <StoreIcon className="size-3" />
              ) : loc.name === "warehouse" ? (
                <WarehouseIcon className="size-3" />
              ) : null}
              <span className="capitalize">{loc.name}</span>
            </Badge>
          ))
        ) : (
          <span className="text-muted-foreground text-sm">—</span>
        )}
      </div>
    ),
  },
  {
    key: "roles",
    header: (
      <div className="flex items-center gap-2">
        <Shield className="size-3" />
        <span>Roles</span>
      </div>
    ),
    mobileLabel: "Roles",
    cell: (user) => (
      <div className="flex flex-wrap gap-1.5">
        {user.roles && user.roles.length > 0 ? (
          <>
            {user.roles.slice(0, 2).map((role) => (
              <Badge
                key={role.id}
                variant="secondary"
                className="gap-1.5 font-normal"
              >
                {getRoleIcon(role.name)}
                {role.name}
              </Badge>
            ))}
            {user.roles.length > 2 && (
              <Badge variant="secondary" className="text-xs font-normal">
                +{user.roles.length - 2}
              </Badge>
            )}
          </>
        ) : (
          <span className="text-muted-foreground text-sm">—</span>
        )}
      </div>
    ),
  },
  {
    key: "features",
    header: (
      <div className="flex items-center gap-2">
        <Settings className="size-3" />
        <span>Features</span>
      </div>
    ),
    mobileLabel: "Features",
    className: "hidden xl:table-cell",
    showInMobileCard: true,
    cell: (user) => (
      <div className="flex flex-wrap gap-1.5">
        {user.user_features && user.user_features.length > 0 ? (
          <>
            {user.user_features.slice(0, 2).map((feature) => (
              <Badge
                key={feature.id}
                variant="outline"
                className="text-xs gap-1.5 font-normal"
              >
                {getFeatureIcon(feature.tag)}
                {feature.name}
              </Badge>
            ))}
            {user.user_features.length > 2 && (
              <Badge variant="secondary" className="text-xs font-normal">
                +{user.user_features.length - 2}
              </Badge>
            )}
          </>
        ) : (
          <span className="text-muted-foreground text-sm">—</span>
        )}
      </div>
    ),
  },
  {
    key: "created_at",
    header: (
      <div className="flex items-center gap-2">
        <Calendar className="size-3" />
        <span>Created</span>
      </div>
    ),
    mobileLabel: "Created",
    className: "hidden lg:table-cell",
    showInMobileCard: false,
    sortable: true,
    cell: (user) => (
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Calendar className="size-3" />
        <span>{formatDate(user.created_at) || "—"}</span>
      </div>
    ),
  },
  {
    key: "actions",
    header: (
      <div className="flex items-center gap-2">
        <Settings className="size-3" />
        <span>Actions</span>
      </div>
    ),
    className: "w-[100px] text-center",
    showInMobileCard: false,
    cell: (user) => (
      <div className="flex justify-center">
        <UsersActions
          user={user}
          roles={roles}
          features={features}
          permissions={permissions}
          assigned_stock_locations={assigned_stock_locations}
          onActionStart={onActionStart}
        />
      </div>
    ),
  },
]
