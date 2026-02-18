import { Badge } from "@/components/ui/common/badge"

interface IntegrationStatusBadgeProps {
  status: string
}

export const IntegrationStatusBadge = ({
  status,
}: IntegrationStatusBadgeProps) => {
  switch (status) {
    case "active":
      return (
        <Badge
          variant="default"
          className="bg-green-100 text-green-800 hover:bg-green-100 text-xs"
        >
          Active
        </Badge>
      )
    case "inactive":
      return (
        <Badge
          variant="secondary"
          className="bg-gray-100 text-gray-700 hover:bg-gray-100 text-xs"
        >
          Inactive
        </Badge>
      )
  }
}
