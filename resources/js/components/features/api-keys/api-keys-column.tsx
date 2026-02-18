import {
  Activity,
  AlertCircle,
  Calendar,
  Check,
  CheckCircle2,
  Copy,
  History,
  Key,
  Settings,
  Shield,
  Tag,
  Timer,
  XCircle,
} from "lucide-react"
import { useState } from "react"
import toast from "react-hot-toast"
import { Badge } from "@/components/ui/common/badge"
import { Button } from "@/components/ui/common/button"
import { DataTableColumn } from "@/components/ui/data-table"
import { formatDate } from "@/lib/format"
import { ApiKey, App, AppFeature, KeyExpirationOption } from "@/types"
import { ApiKeyActions } from "./api-key-actions"

export const getStatusColor = (status: string | boolean) => {
  const statusStr =
    typeof status === "boolean"
      ? status
        ? "active"
        : "inactive"
      : String(status).toLowerCase()

  switch (statusStr) {
    case "active":
    case "1":
    case "true":
      return "bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800"
    case "expired":
      return "bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800"
    case "revoked":
    case "inactive":
    case "0":
    case "false":
      return "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-800"
    default:
      return "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800"
  }
}

export const getStatusIcon = (status: string | boolean) => {
  const statusStr =
    typeof status === "boolean"
      ? status
        ? "active"
        : "inactive"
      : String(status).toLowerCase()

  switch (statusStr) {
    case "active":
    case "1":
    case "true":
      return CheckCircle2
    case "expired":
      return AlertCircle
    case "revoked":
    case "inactive":
    case "0":
    case "false":
      return XCircle
    default:
      return Activity
  }
}

export const formatStatus = (status: string | boolean): string => {
  if (typeof status === "boolean") {
    return status ? "Active" : "Inactive"
  }

  if (status === "1") return "Active"
  if (status === "0") return "Inactive"

  return (
    String(status).charAt(0).toUpperCase() +
    String(status).slice(1).toLowerCase()
  )
}

const ApiKeyCopyCell = ({ apiKey }: { apiKey: string }) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation()

    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(apiKey)
        setCopied(true)
        toast.success("API Key copied to clipboard")
        setTimeout(() => setCopied(false), 2000)
      } catch (err) {
        console.error("Failed to copy using Clipboard API:", err)
        fallbackCopyTextToClipboard(apiKey)
      }
    } else {
      fallbackCopyTextToClipboard(apiKey)
    }
  }

  const fallbackCopyTextToClipboard = (text: string) => {
    const textArea = document.createElement("textarea")
    textArea.value = text

    textArea.style.top = "0"
    textArea.style.left = "0"
    textArea.style.position = "fixed"

    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()

    try {
      const successful = document.execCommand("copy")
      if (successful) {
        setCopied(true)
        toast.success("API Key copied to clipboard")
        setTimeout(() => setCopied(false), 2000)
      } else {
        toast.error("Failed to copy API Key")
      }
    } catch (err) {
      console.error("Fallback: Oops, unable to copy", err)
      toast.error("Failed to copy API Key")
    }

    document.body.removeChild(textArea)
  }

  return (
    <div className="flex items-center gap-2">
      <code className="text-sm bg-muted rounded px-1.5 py-0.5 font-mono text-muted-foreground border">
        {apiKey}
      </code>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 shrink-0 hover:bg-muted"
        onClick={handleCopy}
      >
        {copied ? (
          <Check className="size-3 text-emerald-500" />
        ) : (
          <Copy className="size-3 text-muted-foreground" />
        )}
        <span className="sr-only">Copy API Key</span>
      </Button>
    </div>
  )
}

export const getApiKeysColumns = (
  app: App,
  features: AppFeature[],
  KeyExpirationOptions: KeyExpirationOption[],
): DataTableColumn<ApiKey>[] => [
  {
    key: "label",
    header: (
      <div className="ml-5 flex items-center gap-2">
        <Tag className="size-3" />
        <span>Label</span>
      </div>
    ),
    mobileLabel: "Label",
    cell: (apiKey) => (
      <div>
        <div className="ml-5 font-medium flex items-center gap-2">
          <Key className="size-3 text-muted-foreground/70" />
          {apiKey.label}
        </div>
      </div>
    ),
  },
  {
    key: "api_key",
    header: (
      <div className="flex items-center gap-2">
        <Shield className="size-3" />
        <span>API Key</span>
      </div>
    ),
    mobileLabel: "API Key",
    cell: (apiKey) => <ApiKeyCopyCell apiKey={apiKey.api_key} />,
  },
  {
    key: "status",
    header: (
      <div className="flex items-center gap-2">
        <Activity className="size-3" />
        <span>Status</span>
      </div>
    ),
    mobileLabel: "Status",
    cell: (apiKey) => {
      const Icon = getStatusIcon(apiKey.status)
      return (
        <Badge
          variant="secondary"
          className={`gap-1.5 pr-2.5 ${getStatusColor(apiKey.status)}`}
        >
          <Icon className="size-3" />
          <span>{formatStatus(apiKey.status)}</span>
        </Badge>
      )
    },
  },
  {
    key: "expiration_label",
    header: (
      <div className="flex items-center gap-2">
        <Timer className="size-3" />
        <span>Expiration</span>
      </div>
    ),
    mobileLabel: "Expiration",
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
    cell: (apiKey) => <>{formatDate(apiKey.created_at) || "N/A"}</>,
  },
  {
    key: "last_used_at",
    header: (
      <div className="flex items-center gap-2">
        <History className="size-3" />
        <span>Last Used</span>
      </div>
    ),
    mobileLabel: "Last Used",
    className: "hidden xl:table-cell",
    showInMobileCard: true,
    cell: (apiKey) => <>{formatDate(apiKey.last_used_at) || "N/A"}</>,
  },
  {
    key: "actions",
    header: (
      <div className="mr-5 flex items-center justify-end gap-2">
        <Settings className="size-3" />
        <span>Actions</span>
      </div>
    ),
    className: "w-[50px]",
    showInMobileCard: false,
    cell: (apiKey) => (
      <ApiKeyActions
        apiKey={apiKey}
        app={app}
        features={features}
        keyExpirationOptions={KeyExpirationOptions}
      />
    ),
  },
]
