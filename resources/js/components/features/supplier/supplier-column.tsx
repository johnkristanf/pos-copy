import {
  Building2,
  FileText,
  Mail,
  MapPin,
  Phone,
  Settings,
  Truck,
  User as UserIcon,
} from "lucide-react"
import { Badge } from "@/components/ui/common/badge"
import { DataTableColumn } from "@/components/ui/data-table"
import { Supplier, User } from "@/types"
import { SupplierAction } from "./supplier-action"

export const getSupplierColumn = (
  onActionStart?: (id: number | null) => void,
  user?: User,
  hasActionPermission: boolean = true,
): DataTableColumn<Supplier>[] => {
  const columns: DataTableColumn<Supplier>[] = [
    {
      key: "name",
      header: (
        <div className="ml-5 flex items-center gap-2">
          <Building2 className="size-3" />
          <span>Supplier</span>
        </div>
      ),
      mobileLabel: "Supplier",
      sortable: true,
      cell: (supplier) => (
        <div className="ml-5">
          <div className="font-medium flex items-center gap-3">
            <div className="flex flex-col">
              <div className="font-medium">{supplier.name}</div>
              {supplier.address && (
                <div className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                  <MapPin className="size-3" />
                  {supplier.address}
                </div>
              )}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "contact",
      header: (
        <div className="flex items-center gap-2">
          <Phone className="size-3" />
          <span>Contact</span>
        </div>
      ),
      mobileLabel: "Contact",
      cell: (supplier) => (
        <div className="flex flex-col gap-1">
          {supplier.email && (
            <div className="text-sm flex items-center gap-1.5">
              <Mail className="size-3 text-muted-foreground" />
              <span>{supplier.email}</span>
            </div>
          )}
          {supplier.telefax && (
            <div className="text-sm text-muted-foreground flex items-center gap-1.5">
              <Phone className="size-3" />
              <span>{supplier.telefax}</span>
            </div>
          )}
          {!supplier.email && !supplier.telefax && (
            <span className="text-muted-foreground text-sm">—</span>
          )}
        </div>
      ),
    },
    {
      key: "contact_person",
      header: (
        <div className="flex items-center gap-2">
          <UserIcon className="size-3" />
          <span>Contact Person</span>
        </div>
      ),
      mobileLabel: "Contact Person",
      className: "hidden lg:table-cell",
      showInMobileCard: true,
      cell: (supplier) => (
        <div>
          {supplier.contact_person ? (
            <div className="text-sm flex items-center gap-1.5">
              <UserIcon className="size-3 text-muted-foreground" />
              <span>{supplier.contact_person}</span>
            </div>
          ) : (
            <span className="text-muted-foreground text-sm">—</span>
          )}
        </div>
      ),
    },
    {
      key: "shipping",
      header: (
        <div className="flex items-center gap-2">
          <Truck className="size-3" />
          <span>Shipping</span>
        </div>
      ),
      mobileLabel: "Shipping",
      className: "hidden xl:table-cell",
      showInMobileCard: true,
      cell: (supplier) => (
        <div>
          {supplier.shipping ? (
            <Badge variant="outline" className="gap-1.5 font-normal">
              <Truck className="size-3" />
              {supplier.shipping}
            </Badge>
          ) : (
            <span className="text-muted-foreground text-sm">—</span>
          )}
        </div>
      ),
    },
    {
      key: "terms",
      header: (
        <div className="flex items-center gap-2">
          <FileText className="size-3" />
          <span>Terms</span>
        </div>
      ),
      mobileLabel: "Terms",
      className: "hidden xl:table-cell",
      showInMobileCard: true,
      cell: (supplier) => (
        <div>
          {supplier.terms ? (
            <Badge variant="secondary" className="gap-1.5 font-normal">
              <FileText className="h-3 w-3" />
              {supplier.terms}
            </Badge>
          ) : (
            <span className="text-muted-foreground text-sm">—</span>
          )}
        </div>
      ),
    },
  ]

  if (hasActionPermission) {
    columns.push({
      key: "actions",
      header: (
        <div className="flex items-center justify-center mr-5 gap-2">
          <Settings className="size-3" />
          <span>Actions</span>
        </div>
      ),
      className: "w-[100px] text-center",
      showInMobileCard: false,
      cell: (supplier) => (
        <div className="flex justify-center mr-5">
          <SupplierAction
            supplier={supplier}
            onActionStart={onActionStart}
            user={user}
          />
        </div>
      ),
    })
  }

  return columns
}
