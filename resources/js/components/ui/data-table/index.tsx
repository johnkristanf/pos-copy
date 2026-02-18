import { router } from "@inertiajs/react"
import { useQuery } from "@tanstack/react-query"
import { ChevronDown, ChevronUp, Search } from "lucide-react"
import {
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
  useQueryState,
} from "nuqs"
import React, { useCallback, useEffect, useState } from "react"

import { Card, CardContent } from "@/components/ui/common/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/common/table"
import { Skeleton } from "@/components/ui/fallbacks/skeleton"
import { Input } from "@/components/ui/inputs/input"

import { DataTablePagination, PaginationInfo } from "./data-table-pagination"

export interface DataTableColumn<T> {
  key: keyof T | string
  header: string | React.ReactNode
  cell?: (item: T) => React.ReactNode
  sortable?: boolean
  searchable?: boolean
  className?: string
  mobileLabel?: string
  showInMobileCard?: boolean
}

export interface DataTableProps<T> {
  queryKey?: string[]
  queryFn?: (params: {
    page: number
    limit: number
    search?: string
    sortBy?: string
    sortOrder?: "asc" | "desc"
  }) => Promise<{
    data: T[]
    pagination: PaginationInfo
  }>
  data?: T[]
  pagination?: PaginationInfo
  useInertia?: boolean
  columns: DataTableColumn<T>[]
  toolbar?: React.ReactNode
  customToolbar?: React.ReactNode
  customToolbarClassName?: string
  searchPlaceholder?: string
  pageSizeOptions?: number[]
  defaultPageSize?: number
  emptyMessage?: string
  loadingRows?: number
  mobileCardComponent?: (item: T) => React.ReactNode
  enableMobileCards?: boolean
  getRowClassName?: (item: T) => string
  getRowId?: (item: T) => string
  isRowLoading?: (item: T) => boolean
}

export function DataTable<T extends Record<string, any>>({
  queryKey,
  queryFn,
  data: inertiaData,
  pagination: inertiaPagination,
  useInertia = false,
  columns,
  toolbar,
  customToolbar,
  customToolbarClassName,
  searchPlaceholder = "Search...",
  pageSizeOptions = [10, 20, 50, 100],
  defaultPageSize = 10,
  emptyMessage = "No data available",
  loadingRows = 5,
  mobileCardComponent,
  enableMobileCards = true,
  getRowClassName,
  getRowId,
  isRowLoading,
}: DataTableProps<T>) {
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1))

  const [limit, setLimit] = useQueryState(
    "per_page",
    parseAsInteger.withDefault(defaultPageSize),
  )

  const [search, setSearch] = useQueryState(
    "search",
    parseAsString.withDefault(""),
  )

  const [sortBy, setSortBy] = useQueryState(
    "sortBy",
    parseAsString.withDefault(""),
  )

  const [sortOrder, setSortOrder] = useQueryState(
    "sortOrder",
    parseAsStringEnum<"asc" | "desc">(["asc", "desc"]).withDefault("asc"),
  )

  const [searchInput, setSearchInput] = useState(search)

  const buildParams = useCallback(
    (overrides: Record<string, any> = {}) => {
      const params: Record<string, any> = {
        page: overrides.page ?? page,
        per_page: overrides.limit ?? limit,
      }

      const searchValue = Object.hasOwn(overrides, "search")
        ? overrides.search
        : search

      if (searchValue && searchValue.trim() !== "") {
        params.search = searchValue.trim()
      }

      const sortByValue = Object.hasOwn(overrides, "sortBy")
        ? overrides.sortBy
        : sortBy

      if (sortByValue && sortByValue.trim() !== "") {
        params.sortBy = sortByValue
        params.sortOrder = overrides.sortOrder ?? sortOrder
      }

      return params
    },
    [page, limit, search, sortBy, sortOrder],
  )

  const navigateInertia = useCallback((params: Record<string, any>) => {
    router.get(window.location.pathname, params, {
      preserveState: false,
      preserveScroll: false,
      replace: true,
    })
  }, [])

  useEffect(() => {
    if (useInertia && inertiaPagination) {
      const urlParams = new URLSearchParams(window.location.search)
      const hasPerPage = urlParams.has("per_page")

      if (!hasPerPage && inertiaPagination.itemsPerPage !== limit) {
        navigateInertia(buildParams({ limit: limit, page: 1 }))
      }
    }
  }, [
    useInertia,
    inertiaPagination,
    limit,
    buildParams,
    navigateInertia,
    defaultPageSize,
  ])

  const applySearch = useCallback(() => {
    const trimmedSearch = searchInput.trim()

    if (trimmedSearch !== search) {
      if (useInertia) {
        const params = buildParams({ search: trimmedSearch, page: 1 })
        if (trimmedSearch === "") {
          delete params.search
        }
        navigateInertia(params)
      } else {
        setSearch(trimmedSearch || null)
        setPage(1)
      }
    }
  }, [
    searchInput,
    search,
    useInertia,
    buildParams,
    navigateInertia,
    setSearch,
    setPage,
  ])

  useEffect(() => {
    if (search !== searchInput.trim()) {
      setSearchInput(search)
    }
  }, [search])

  useEffect(() => {
    const trimmedInput = searchInput.trim()

    if (trimmedInput === search) {
      return
    }

    const timeoutId = setTimeout(() => {
      if (trimmedInput !== "") {
        applySearch()
      }
    }, 1000)

    return () => clearTimeout(timeoutId)
  }, [searchInput, search, applySearch])

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      setSearchInput(value)

      if (value.trim() === "" && search !== "") {
        if (useInertia) {
          const params = buildParams({ search: "", page: 1 })
          delete params.search
          navigateInertia(params)
        } else {
          setSearch(null)
          setPage(1)
        }
      }
    },
    [search, useInertia, buildParams, navigateInertia, setSearch, setPage],
  )

  const handleSearchKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault()
        applySearch()
      }
    },
    [applySearch],
  )

  const {
    data: response,
    isLoading: isQueryLoading,
    isFetching: isQueryFetching,
    isError,
    error,
  } = useQuery({
    queryKey: queryKey
      ? [...queryKey, page, limit, search, sortBy, sortOrder]
      : [],
    queryFn: queryFn
      ? () =>
          queryFn({
            page,
            limit,
            search: search || undefined,
            sortBy: sortBy || undefined,
            sortOrder,
          })
      : () => Promise.resolve({ data: [], pagination: {} as PaginationInfo }),
    enabled: !useInertia && !!queryFn,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message.includes("4")) {
        return false
      }
      return failureCount < 3
    },
  })

  const handleSort = useCallback(
    (columnKey: string) => {
      const column = columns.find((col) => col.key === columnKey)
      if (!column?.sortable) return

      const newSortOrder =
        sortBy === columnKey && sortOrder === "asc" ? "desc" : "asc"

      if (useInertia) {
        navigateInertia(
          buildParams({
            sortBy: columnKey,
            sortOrder: newSortOrder,
          }),
        )
      } else {
        setSortBy(columnKey)
        setSortOrder(newSortOrder)
      }
    },
    [
      columns,
      sortBy,
      sortOrder,
      useInertia,
      navigateInertia,
      buildParams,
      setSortBy,
      setSortOrder,
    ],
  )

  const handlePageChange = useCallback(
    (newPage: number) => {
      if (useInertia) {
        navigateInertia(buildParams({ page: newPage }))
      } else {
        setPage(newPage)
      }
    },
    [useInertia, navigateInertia, buildParams, setPage],
  )

  const handlePageSizeChange = useCallback(
    (newPageSize: string) => {
      if (useInertia) {
        navigateInertia(buildParams({ limit: newPageSize, page: 1 }))
      } else {
        setLimit(parseInt(newPageSize, 10))
        setPage(1)
      }
    },
    [useInertia, navigateInertia, buildParams, setLimit, setPage],
  )

  const renderCellContent = (item: T, column: DataTableColumn<T>) => {
    if (column.cell) {
      return column.cell(item)
    }

    const value = item[column.key as keyof T]
    return value?.toString() || ""
  }

  const getHeaderText = (column: DataTableColumn<T>): string => {
    if (typeof column.header === "string") {
      return column.header
    }
    return column.mobileLabel || String(column.key)
  }

  const DefaultMobileCard = ({ item }: { item: T }) => {
    const mobileColumns = columns.filter(
      (col) => col.showInMobileCard !== false,
    )

    if (isRowLoading?.(item)) {
      return (
        <Card className="mb-3">
          <CardContent className="p-4">
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, skeletonIndex) => (
                <div key={skeletonIndex} className="flex justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )
    }

    return (
      <Card className="mb-3">
        <CardContent className="p-4">
          <div className="space-y-2">
            {mobileColumns.map((column, index) => {
              const value = renderCellContent(item, column)
              const label = column.mobileLabel || getHeaderText(column)

              return (
                <div key={index} className="flex justify-between items-start">
                  <span className="mr-2 min-w-0 text-sm font-medium text-muted-foreground">
                    {label}:
                  </span>
                  <div className="flex-1 min-w-0 text-right text-sm">
                    {value}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    )
  }

  const MobileLoadingSkeleton = () => (
    <div className="space-y-3">
      {Array.from({ length: loadingRows }).map((_, index) => (
        <Card key={index}>
          <CardContent className="p-4">
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, skeletonIndex) => (
                <div key={skeletonIndex} className="flex justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  const DesktopLoadingSkeleton = () => (
    <>
      {Array.from({ length: loadingRows }).map((_, index) => (
        <TableRow key={index}>
          {columns.map((column, colIndex) => (
            <TableCell key={colIndex} className={column.className}>
              <Skeleton className="h-4 w-full" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  )

  const SingleRowSkeleton = () => (
    <TableRow>
      {columns.map((column, colIndex) => (
        <TableCell key={colIndex} className={column.className}>
          <Skeleton className="h-4 w-full" />
        </TableCell>
      ))}
    </TableRow>
  )

  const isLoading = useInertia ? false : isQueryLoading
  const isFetching = useInertia ? false : isQueryFetching
  const data = useInertia ? inertiaData || [] : response?.data || []
  const pagination = useInertia ? inertiaPagination : response?.pagination

  if (!useInertia && isError) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <p className="mb-2 text-destructive">Error loading data</p>
          <p className="text-sm text-muted-foreground">
            {error instanceof Error ? error.message : "Unknown error occurred"}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={searchInput}
            onChange={handleSearchChange}
            onKeyDown={handleSearchKeyDown}
            className="pl-10"
            disabled={isFetching}
          />
        </div>

        {toolbar && (
          <div className="flex flex-wrap items-center gap-2">{toolbar}</div>
        )}
      </div>

      {customToolbar && (
        <div className={`${customToolbarClassName || ""}`}>{customToolbar}</div>
      )}

      {enableMobileCards && (
        <div className="block md:hidden">
          {isLoading || isFetching ? (
            <MobileLoadingSkeleton />
          ) : data.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">{emptyMessage}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {data.map((item, index) => (
                <div key={index}>
                  {mobileCardComponent ? (
                    mobileCardComponent(item)
                  ) : (
                    <DefaultMobileCard item={item} />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div
        className={`overflow-hidden rounded-md border ${
          enableMobileCards ? "hidden md:block" : ""
        }`}
      >
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column, index) => (
                  <TableHead
                    key={index}
                    className={`${column.className || ""} ${
                      column.sortable
                        ? "cursor-pointer select-none hover:bg-muted/50"
                        : ""
                    }`}
                    onClick={() =>
                      column.sortable &&
                      !isFetching &&
                      handleSort(column.key as string)
                    }
                  >
                    <div className="flex items-center gap-2">
                      {column.header}
                      {column.sortable && (
                        <div className="flex flex-col">
                          <ChevronUp
                            className={`h-3 w-3 ${
                              sortBy === column.key && sortOrder === "asc"
                                ? "text-foreground"
                                : "text-muted-foreground"
                            }`}
                          />
                          <ChevronDown
                            className={`h-3 w-3 ${
                              sortBy === column.key && sortOrder === "desc"
                                ? "text-foreground"
                                : "text-muted-foreground"
                            }`}
                          />
                        </div>
                      )}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading || isFetching ? (
                <DesktopLoadingSkeleton />
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center text-muted-foreground"
                  >
                    {emptyMessage}
                  </TableCell>
                </TableRow>
              ) : (
                data.map((item, index) => {
                  if (isRowLoading?.(item)) {
                    return <SingleRowSkeleton key={index} />
                  }

                  return (
                    <TableRow
                      key={index}
                      id={getRowId ? getRowId(item) : undefined}
                      className={getRowClassName ? getRowClassName(item) : ""}
                    >
                      {columns.map((column, colIndex) => (
                        <TableCell
                          key={colIndex}
                          className={column.className || ""}
                        >
                          {renderCellContent(item, column)}
                        </TableCell>
                      ))}
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {pagination && (
        <DataTablePagination
          pagination={pagination}
          limit={limit}
          pageSizeOptions={pageSizeOptions}
          isFetching={isFetching}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      )}
    </div>
  )
}
