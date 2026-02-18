import { CheckCircle, CheckCircle2, Clock, HelpCircle, X } from "lucide-react"

export enum ReturnStatus {
  ForChecking = "for_checking",
  ForApproval = "for_approval",
  Rejected = "rejected",
  Approved = "approved",
}

export enum ReturnType {
  Replacement = "replacement",
  Refund = "refund",
}

export const statusConfigMap = {
  [ReturnStatus.ForApproval]: {
    variant: "default" as const,
    icon: CheckCircle2,
    className: "bg-green-600 hover:bg-green-700 text-white border-transparent",
    label: "For Approval",
  },
  [ReturnStatus.ForChecking]: {
    variant: "secondary" as const,
    icon: Clock,
    className:
      "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-200",
    label: "For Checking",
  },
  [ReturnStatus.Rejected]: {
    variant: "secondary" as const,
    icon: X,
    className: "bg-red-100 text-red-800 hover:bg-red-200 border-red-200",
    label: "Rejected",
  },
  [ReturnStatus.Approved]: {
    variant: "outline" as const,
    icon: CheckCircle,
    className:
      "bg-green-100 text-green-800 hover:bg-green-200 border-green-200",
    label: "Approved",
  },
  default: {
    variant: "outline" as const,
    icon: HelpCircle,
    className: "text-muted-foreground",
    label: "Unknown",
  },
}

export const typeConfigMap = {
  [ReturnType.Replacement]: {
    variant: "secondary" as const,
    className: "bg-blue-100 text-blue-800 border-blue-200",
    label: "Replacement",
  },
  [ReturnType.Refund]: {
    variant: "secondary" as const,
    className: "bg-purple-100 text-purple-800 border-purple-200",
    label: "Refund",
  },
}
