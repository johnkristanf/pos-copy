import { Badge } from "@/components/ui/common/badge"
import { Card, CardContent } from "@/components/ui/common/card"
import { ApiKey, App, AppFeature, KeyExpirationOption } from "@/types"
import { ApiKeyActions } from "./api-key-actions"
import { formatStatus, getStatusColor } from "./api-keys-column"

interface MobileApiKeyCardProps {
  apiKey: ApiKey
  app: App
  features: AppFeature[]
  keyExpirationOptions: KeyExpirationOption[]
}

export const MobileApiKeyCard = ({
  apiKey,
  app,
  features,
  keyExpirationOptions,
}: MobileApiKeyCardProps) => {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-medium text-sm">{apiKey.label}</h3>
            </div>
            <ApiKeyActions
              apiKey={apiKey}
              app={app}
              features={features}
              keyExpirationOptions={keyExpirationOptions}
            />
          </div>

          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">API Key</p>
            <div className="flex items-center gap-2">
              <code className="text-xs bg-muted px-2 py-1 rounded flex-1 truncate">
                {apiKey.api_key}
              </code>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Status</p>
              <Badge
                variant="secondary"
                className={getStatusColor(apiKey.status)}
              >
                {formatStatus(apiKey.status)}
              </Badge>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Expiration</p>
              <p className="text-sm">{apiKey.expiration_label}</p>
            </div>
          </div>

          {apiKey.last_used_at && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Last Used</p>
              <p className="text-sm">{apiKey.last_used_at}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
