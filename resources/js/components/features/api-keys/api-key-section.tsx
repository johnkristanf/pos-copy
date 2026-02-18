import { router } from "@inertiajs/react"
import { useMemo } from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/common/tabs"
import { DataTable } from "@/components/ui/data-table"
import { PaginationInfo } from "@/components/ui/data-table/data-table-pagination"
import { useDynamicDialog } from "@/hooks/ui/use-dynamic-dialog"
import { App, AppFeature, KeyExpirationOption, PaginatedApiKeys } from "@/types"
import { ApiKeyToolbar } from "./api-key-toolbar"
import { getApiKeysColumns } from "./api-keys-column"
import { CreateApiKeyForm } from "./create-api-key-form"
import { MobileApiKeyCard } from "./mobile-api-key-card"

interface ApiKeysSectionProps {
  apiKeys?: PaginatedApiKeys
  app: App
  features: AppFeature[]
  keyExpirationOptions: KeyExpirationOption[]
  filters?: {
    type?: string
  }
}

export const ApiKeysSection = ({
  apiKeys,
  app,
  features,
  keyExpirationOptions,
  filters,
}: ApiKeysSectionProps) => {
  const { openDialog } = useDynamicDialog()
  const currentType = (filters?.type as "inbound" | "outbound") || "inbound"

  const columns = useMemo(
    () => getApiKeysColumns(app, features, keyExpirationOptions),
    [app, features, keyExpirationOptions],
  )

  if (!apiKeys) {
    return null
  }

  const pagination: PaginationInfo = {
    currentPage: apiKeys.current_page,
    totalPages: apiKeys.last_page,
    totalItems: apiKeys.total,
    itemsPerPage: apiKeys.per_page,
    hasNextPage: apiKeys.current_page < apiKeys.last_page,
    hasPreviousPage: apiKeys.current_page > 1,
  }

  const handleTabChange = (value: string) => {
    router.get(
      window.location.pathname,
      { type: value, page: 1 },
      { preserveState: true, preserveScroll: true },
    )
  }

  const handleCreateNew = () => {
    openDialog({
      title: `Create ${currentType === "outbound" ? "Outbound" : "Inbound"} API Key`,
      description:
        currentType === "outbound"
          ? "Store a key for an external service."
          : "Generate a key to allow access to this system.",
      children: (
        <CreateApiKeyForm
          app={app}
          features={features}
          keyExpirationOptions={keyExpirationOptions}
          defaultType={currentType}
        />
      ),
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold">API Keys</h2>
          <p className="text-muted-foreground text-xs sm:text-sm">
            Manage {currentType} keys for {app.name}
          </p>
        </div>

        <Tabs value={currentType} onValueChange={handleTabChange}>
          <TabsList>
            <TabsTrigger value="inbound">Inbound</TabsTrigger>
            <TabsTrigger value="outbound">Outbound</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <DataTable
        data={apiKeys.data.map((apiKey) => ({
          ...apiKey,
          app: Number(apiKey.app_id),
        }))}
        pagination={pagination}
        useInertia={true}
        columns={columns}
        toolbar={
          <ApiKeyToolbar
            onCreateNew={handleCreateNew}
            app={{ ...app, id: Number(app.id) }}
          />
        }
        searchPlaceholder={`Search ${currentType} keys...`}
        emptyMessage={`No ${currentType} keys found for this app`}
        mobileCardComponent={(apiKey) => (
          <MobileApiKeyCard
            apiKey={apiKey}
            app={{ ...app, id: Number(app.id) }}
            features={features}
            keyExpirationOptions={keyExpirationOptions}
          />
        )}
        enableMobileCards={true}
      />
    </div>
  )
}
