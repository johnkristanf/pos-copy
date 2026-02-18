import { MapPin, Phone } from "lucide-react"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/common/avatar"
import { useInitials } from "@/hooks/ui/use-initials"
import { Customer } from "@/types"

interface CustomerDetailCellProps {
  customer: Customer
  returnColumn?: boolean
}

export const CustomerDetailsCell = ({
  customer,
  returnColumn,
}: CustomerDetailCellProps) => {
  const getInitials = useInitials()

  const loc = customer.locations
  const addressParts = [loc?.barangay, loc?.municipality, loc?.province]
    .filter(Boolean)
    .join(", ")

  return (
    <div className="flex items-center gap-3 py-1">
      <Avatar className="h-9 w-9 border border-border bg-secondary/20">
        <AvatarImage
          src={customer.customer_img || undefined}
          alt={customer.name}
          className="object-cover"
        />
        <AvatarFallback className="font-medium text-muted-foreground">
          {getInitials(customer.name)}
        </AvatarFallback>
      </Avatar>

      <div className="flex flex-col">
        <span className="font-semibold text-sm">{customer.name}</span>

        {!returnColumn && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="truncate" title={addressParts || "No address"}>
              {addressParts || "—"}
            </span>
          </div>
        )}

        {customer.contact_no && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Phone className="h-3 w-3 shrink-0" />
            <span>{customer.contact_no}</span>
          </div>
        )}
      </div>
    </div>
  )
}
