import { Hash, Mail, MapPin } from "lucide-react"
import { Badge } from "@/components/ui/common/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/common/card"
import { Customer } from "@/types"
import { CustomersActions } from "./customers-actions"

interface MobileCustomersCardProps {
  customer: Customer
}

export function MobileCustomersCard({ customer }: MobileCustomersCardProps) {
  return (
    <Card className="mb-4">
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <div className="flex flex-col">
          <h3 className="font-semibold text-lg">{customer.name}</h3>
          <div className="flex items-center text-xs text-muted-foreground gap-1">
            <Hash className="h-3 w-3" />
            {customer.customer_code}
          </div>
        </div>
        <CustomersActions customer={customer} />
      </CardHeader>
      <CardContent className="grid gap-2 text-sm">
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <span>{customer.email}</span>
        </div>
        {customer.locations && (
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <Badge variant="outline" className="font-normal">
              {customer.locations.name}
            </Badge>
          </div>
        )}
        <div className="flex items-center justify-between mt-2">
          <Badge variant={customer.isactive ? "default" : "secondary"}>
            {customer.isactive ? "Active" : "Inactive"}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}
