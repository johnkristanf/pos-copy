import { router } from "@inertiajs/react"
import { MoreVertical, Pencil, Trash2 } from "lucide-react"
import toast from "react-hot-toast"
import { Button } from "@/components/ui/common/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/common/dropdown-menu"
import { API_ROUTES } from "@/config/api-routes"
import { useDynamicDialog } from "@/hooks/ui/use-dynamic-dialog"
import { catchError } from "@/lib/catch-error"
import { ApiKey, App, AppFeature, KeyExpirationOption } from "@/types"
import { EditApiKeyForm } from "./edit-api-key-form"

interface ApiKeyActionsProps {
  apiKey: ApiKey
  app: App
  features: AppFeature[]
  keyExpirationOptions: KeyExpirationOption[]
}

export const ApiKeyActions = ({
  apiKey,
  app,
  features,
  keyExpirationOptions,
}: ApiKeyActionsProps) => {
  const { openDialog, openConfirmation } = useDynamicDialog()

  const handleEditApiKey = () => {
    openDialog({
      title: `Edit API Key for ${app.name}`,
      description: "Edit existing API key to authenticate requests",
      children: (
        <EditApiKeyForm
          apiKey={apiKey}
          app={app}
          features={features}
          keyExpirationOptions={keyExpirationOptions}
        />
      ),
    })
  }

  const handleDeleteApiKey = async () => {
    await toast.promise(
      new Promise((resolve, reject) => {
        router.delete(API_ROUTES.DELETE_API_KEY(app.slug, app.id, apiKey.id), {
          preserveScroll: true,
          onSuccess: (page) => {
            resolve(page)
          },
          onError: (errors) => {
            const firstError = Object.values(errors)[0] as string
            reject(new Error(firstError || "Failed to delete api key"))
          },
        })
      }),
      {
        loading: <span className="animate-pulse">Deleting Api Key...</span>,
        success: "Api Key deleted successfully",
        error: (error) => catchError(error),
      },
    )
  }
  const handleConfirmDeleteApiKey = () => {
    openConfirmation({
      title: "Delete Api Key",
      description:
        "Are you sure you want to delete this api key? It can never be undone.",
      type: "warning",
      onConfirm: handleDeleteApiKey,
      confirmText: "Delete",
      cancelText: "Cancel",
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleEditApiKey}>
          <Pencil className="h-4 w-4 mr-2" />
          <span className="text-xs"> Edit Api Key</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleConfirmDeleteApiKey}
          className="text-destructive"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          <span className="text-xs"> Delete Api Key</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
