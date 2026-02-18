import { Mail, MapPin, Phone } from "lucide-react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/common/card"
import { Separator } from "@/components/ui/common/separator"
import { DetailedCustomer } from "@/types"

interface ContactInfoProps {
  customer: DetailedCustomer
}

export function ContactInfo({ customer }: ContactInfoProps) {
  const address = customer.locations
    ? [
        customer.locations.barangay,
        customer.locations.municipality,
        customer.locations.province,
        customer.locations.region,
        customer.locations.country,
      ]
        .filter(Boolean)
        .join(", ")
    : "No address provided"

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contact Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-3 text-sm">
          <div className="p-2 bg-primary/10 rounded-md">
            <Mail className="h-4 w-4 text-primary" />
          </div>
          <div className="grid gap-0.5">
            <p className="font-medium">Email</p>
            <p className="text-muted-foreground break-all">
              {customer.email || "—"}
            </p>
          </div>
        </div>
        <Separator />
        <div className="flex items-start gap-3 text-sm">
          <div className="p-2 bg-primary/10 rounded-md">
            <Phone className="h-4 w-4 text-primary" />
          </div>
          <div className="grid gap-0.5">
            <p className="font-medium">Phone</p>
            <p className="text-muted-foreground">
              {customer.contact_no || "—"}
            </p>
          </div>
        </div>
        <Separator />
        <div className="flex items-start gap-3 text-sm">
          <div className="p-2 bg-primary/10 rounded-md">
            <MapPin className="h-4 w-4 text-primary" />
          </div>
          <div className="grid gap-0.5">
            <p className="font-medium">Address</p>
            <p className="text-muted-foreground">{address}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
