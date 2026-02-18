import { router } from "@inertiajs/react"
import toast from "react-hot-toast"
import { Badge } from "@/components/ui/common/badge"
import { Card, CardContent, CardTitle } from "@/components/ui/common/card"
import ImageComponent from "@/components/ui/media/image"
import { API_ROUTES } from "@/config/api-routes"
import { APP_ASSETS } from "@/config/assets"
import { PAGE_ROUTES } from "@/config/page-routes"
import { useDynamicDialog } from "@/hooks/ui/use-dynamic-dialog"
import { catchError } from "@/lib/catch-error"
import { App } from "@/types"
import { EditAppForm } from "./edit-app-form"
import { IntegrationActionButton } from "./integration-action-button"
import { IntegrationStatusBadge } from "./integration-status-badge"

interface IntegrationCardProps {
  integration: App
}

export const IntegrationCard = ({ integration }: IntegrationCardProps) => {
  const { openDialog, openConfirmation } = useDynamicDialog()
  const status = integration.isactive === 1 ? "active" : "inactive"

  const handleEdit = () => {
    openDialog({
      title: `Edit ${integration.name}`,
      description: `Update the configuration for ${integration.name}`,
      children: <EditAppForm app={integration} />,
    })
  }

  const handleKeys = () => {
    const slug = integration.slug || integration.id.toString()
    router.visit(
      PAGE_ROUTES.INTEGRATION_API_KEYS_PAGE(slug, String(integration.id)),
    )
  }

  const handleConnect = (integration: App) => {
    openConfirmation({
      title: `Connect to ${integration.name}?`,
      description: `Are you sure you want to connect to ${integration.name}?`,
      type: "warning",
      onConfirm: handleSubmitConnect,
      confirmText: "Confirm",
      cancelText: "Cancel",
    })
  }

  const handleSubmitConnect = async () => {
    const connectAppPayload = {
      id: integration.id,
      slug: integration.slug || "",
      name: integration.name,
      isactive: 1,
    }

    const connectAppPromise = new Promise<void>((resolve, reject) => {
      router.put(
        API_ROUTES.UPDATE_APP(integration.id.toString()),
        connectAppPayload,
        {
          preserveScroll: true,
          onSuccess: () => {
            resolve()
          },
          onError: (errors) => {
            reject(
              new Error(
                (Object.values(errors)[0] as string) || "Failed to connect app",
              ),
            )
          },
        },
      )
    })

    toast.promise(connectAppPromise, {
      loading: <span className="animate-pulse">Connecting App...</span>,
      success: "App Connected Successfully",
      error: (error) => catchError(error),
    })
  }

  const onDelete = () => {
    openConfirmation({
      title: `Delete ${integration.name}?`,
      description: `Are you sure you want to delete ${integration.name}? It cannot be undone.`,
      type: "warning",
      onConfirm: handleSubmitDelete,
      confirmText: "Confirm",
      cancelText: "Cancel",
    })
  }

  const handleSubmitDelete = async () => {
    const deleteAppPromise = new Promise<void>((resolve, reject) => {
      router.delete(API_ROUTES.DELETE_APP(integration.id.toString()), {
        preserveScroll: true,
        onSuccess: () => {
          resolve()
        },
        onError: (errors) => {
          reject(
            new Error(
              (Object.values(errors)[0] as string) || "Failed to delete app",
            ),
          )
        },
      })
    })

    toast.promise(deleteAppPromise, {
      loading: <span className="animate-pulse">Deleting App...</span>,
      success: "App deleted successfully!",
      error: (error) => catchError(error),
    })
  }

  const isActive = status === "active"

  return (
    <Card className="transition-colors hover:bg-accent/50">
      <CardContent className="p-3 sm:p-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div
                className={`p-1 rounded shrink-0 ${
                  isActive ? "bg-primary/10" : "bg-muted"
                }`}
              >
                <ImageComponent
                  src={APP_ASSETS.FAVICON_APPLE_TOUCHED}
                  alt={`${integration.name} icon`}
                  width={16}
                  height={16}
                  className={`w-4 h-4 ${!isActive ? "opacity-60" : ""}`}
                />
              </div>
              <div className="min-w-0 flex-1">
                <CardTitle className="text-sm truncate">
                  {integration.name}
                </CardTitle>
              </div>
            </div>
            <IntegrationStatusBadge status={status} />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                API
              </Badge>
              <Badge variant="secondary" className="text-xs font-mono">
                {integration.slug}
              </Badge>
            </div>
          </div>
          <IntegrationActionButton
            status={status}
            onEdit={handleEdit}
            onKeys={handleKeys}
            onConnect={() => handleConnect(integration)}
            onDelete={onDelete}
          />
        </div>
      </CardContent>
    </Card>
  )
}
