import { router } from "@inertiajs/react"
import {
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
  useQueryState,
} from "nuqs"
import { useEffect, useMemo, useRef } from "react"
import { API_ROUTES } from "@/config/api-routes"
import { useDebounce } from "@/hooks/ui/use-debounce"
import { PaginatedApps } from "@/types"
import { IntegrationsEmptyState } from "./integration-empty-state"
import { IntegrationGroup } from "./integration-group"
import { IntegrationHeader } from "./integration-header"
import { IntegrationPagination } from "./integration-pagination"

interface IntegrationsSectionProps {
  apps: PaginatedApps
}

export const IntegrationsSection = ({ apps }: IntegrationsSectionProps) => {
  const isMounted = useRef(false)

  const [currentPage, setCurrentPage] = useQueryState(
    "page",
    parseAsInteger.withDefault(1),
  )
  const [search] = useQueryState("search", parseAsString.withDefault(""))
  const [searchBy] = useQueryState(
    "search_by",
    parseAsStringEnum(["name", "tag"]).withDefault("name"),
  )
  const [dateFrom] = useQueryState("date_from", parseAsString.withDefault(""))
  const [dateTo] = useQueryState("date_to", parseAsString.withDefault(""))

  const debouncedSearch = useDebounce(search, 1000)

  const appsList = useMemo(() => {
    return apps?.data || []
  }, [apps])

  const paginationInfo = useMemo(() => {
    if (!apps) return null
    return {
      currentPage: apps.current_page,
      lastPage: apps.last_page,
      total: apps.total,
      from: apps.from,
      to: apps.to,
      hasNextPage: !!apps.next_page_url,
      hasPrevPage: !!apps.prev_page_url,
    }
  }, [apps])

  useEffect(() => {
    if (isMounted.current) {
      const params: Record<string, string | number> = {
        page: currentPage,
      }

      if (debouncedSearch) {
        params.search = debouncedSearch
        params.search_by = searchBy
      }

      if (dateFrom) {
        params.date_from = dateFrom
      }

      if (dateTo) {
        params.date_to = dateTo
      }

      router.get(API_ROUTES.GET_APPS, params, {
        preserveState: true,
        preserveScroll: true,
        only: ["apps"],
      })
    } else {
      isMounted.current = true
    }
  }, [currentPage, debouncedSearch, searchBy, dateFrom, dateTo])

  useEffect(() => {
    if (debouncedSearch !== search && currentPage !== 1) {
      setCurrentPage(1)
    }
  }, [debouncedSearch])

  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1)
    }
  }, [dateFrom, dateTo])

  const activeIntegrations = appsList.filter(
    (app: any) => app.isactive === 1 || app.status === "active",
  )
  const inactiveIntegrations = appsList.filter(
    (app: any) => app.isactive === 0 || app.status === "inactive",
  )

  const handlePrevPage = () => {
    if (paginationInfo?.hasPrevPage) {
      const newPage = currentPage - 1
      setCurrentPage(newPage === 1 ? 1 : newPage)
    }
  }

  const handleNextPage = () => {
    if (paginationInfo?.hasNextPage) {
      setCurrentPage(currentPage + 1)
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  if (appsList.length === 0) {
    return (
      <div className="space-y-3 sm:space-y-4">
        <IntegrationHeader />
        {debouncedSearch || dateFrom || dateTo ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              No apps found with current filters
            </p>
          </div>
        ) : (
          <IntegrationsEmptyState />
        )}
      </div>
    )
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      <IntegrationHeader />

      {activeIntegrations.length > 0 && (
        <IntegrationGroup
          title="Active Integrations"
          integrations={activeIntegrations}
        />
      )}
      {inactiveIntegrations.length > 0 && (
        <IntegrationGroup
          title="Available Integrations"
          integrations={inactiveIntegrations}
        />
      )}

      {paginationInfo && paginationInfo.total > 0 && (
        <IntegrationPagination
          paginationInfo={paginationInfo}
          onPageChange={handlePageChange}
          onPrevPage={handlePrevPage}
          onNextPage={handleNextPage}
          isLoading={false}
          showInfo={true}
        />
      )}
    </div>
  )
}
