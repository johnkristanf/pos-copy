import { Link } from "@inertiajs/react"
import { XCircle } from "lucide-react"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/common/avatar"
import { Badge } from "@/components/ui/common/badge"
import { Button } from "@/components/ui/common/button"
import ImageComponent from "@/components/ui/media/image"
import { APP_ASSETS } from "@/config/assets"
import { PAGE_ROUTES } from "@/config/page-routes"
import { useInitials } from "@/hooks/ui/use-initials"
import { DetailedCustomer } from "@/types"

interface CustomerHeaderProps {
  customer: DetailedCustomer
}

export function CustomerHeader({ customer }: CustomerHeaderProps) {
  const getInitials = useInitials()

  return (
    <div className="flex flex-col md:flex-row gap-6 items-start justify-between">
      <div className="flex items-center gap-6">
        <Avatar className="h-24 w-24 border-4 border-background shadow-xl ring-1 ring-border/50">
          <AvatarImage
            src={customer.customer_img || undefined}
            className="object-cover"
          />
          <AvatarFallback className="text-2xl bg-primary/10 text-primary font-bold">
            {getInitials(customer.name)}
          </AvatarFallback>
        </Avatar>
        <div className="space-y-1.5">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl font-bold tracking-tight text-foreground/90">
              {customer.name}
            </h1>

            {customer.affiliated ? (
              <Badge
                variant="bridge_digital"
                className="gap-1.5 pl-1.5 pr-2.5 py-0.5"
              >
                <div className="bg-white rounded-full p-0.75 h-5 w-5 flex items-center justify-center shadow-inner">
                  <ImageComponent
                    src={APP_ASSETS.HEXAT_LOGO}
                    alt="Hexat"
                    className="h-full w-full object-contain"
                  />
                </div>
                <span className="font-medium text-[10px] uppercase tracking-wider">
                  Hexat Group Affiliated
                </span>
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="border-dashed text-muted-foreground bg-muted/30 gap-1.5 pl-1.5 pr-2.5 py-0.5"
              >
                <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50" />
                <span className="text-[10px] uppercase tracking-wider font-medium">
                  Not Affiliated
                </span>
              </Badge>
            )}

            {!customer.isactive && (
              <Badge
                variant="destructive"
                className="shadow-sm gap-1.5 pl-1.5 pr-2.5"
              >
                <XCircle className="h-3 w-3 fill-current text-white/90" />
                Inactive
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2 text-muted-foreground font-mono text-sm">
            <div className="flex items-center gap-1.5 bg-muted/50 px-2 py-0.5 rounded-md border border-border/50">
              <span className="w-1.5 h-1.5 rounded-full bg-primary/50"></span>
              <span className="text-xs font-medium text-foreground/80">
                {customer.customer_code}
              </span>
            </div>
            <span className="text-muted-foreground/40">•</span>
            <span className="text-xs">
              Joined {new Date(customer.created_at || "").toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Link href={PAGE_ROUTES.CUSTOMERS_PAGE}>
          <Button variant="outline" className="shadow-sm">
            Back to List
          </Button>
        </Link>
      </div>
    </div>
  )
}
