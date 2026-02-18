"use client"

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react"
import React from "react"
import { Button } from "@/components/ui/common/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/common/select"

export interface DataTableColumn<T> {
  key: keyof T | string
  header: string
  cell?: (item: T) => React.ReactNode
  sortable?: boolean
  searchable?: boolean
  className?: string
}

export interface PaginationInfo {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

interface DataTablePaginationProps {
  pagination: PaginationInfo
  limit: number
  pageSizeOptions: number[]
  isFetching: boolean
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: string) => void
}

export function DataTablePagination({
  pagination,
  limit,
  pageSizeOptions,
  isFetching,
  onPageChange,
  onPageSizeChange,
}: DataTablePaginationProps) {
  return (
    <div className="flex flex-col gap-4 justify-center sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2 justify-center sm:justify-start">
        <span className="text-sm text-muted-foreground">Rows per page</span>
        <Select
          value={limit.toString()}
          onValueChange={onPageSizeChange}
          disabled={isFetching}
        >
          <SelectTrigger className="w-20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {pageSizeOptions.map((size) => (
              <SelectItem key={size} value={size.toString()}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-4 items-center sm:flex-row sm:items-center">
        <div className="text-sm text-muted-foreground text-center sm:text-left">
          {pagination.totalItems === 0
            ? 0
            : (pagination.currentPage - 1) * pagination.itemsPerPage + 1}{" "}
          to{" "}
          {Math.min(
            pagination.currentPage * pagination.itemsPerPage,
            pagination.totalItems,
          )}{" "}
          of {pagination.totalItems} entries
        </div>
        <div className="flex items-center gap-2 justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(1)}
            disabled={!pagination.hasPreviousPage || isFetching}
          >
            <ChevronsLeft className="h-4 w-4" />
            <span className="sr-only">First page</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(pagination.currentPage - 1)}
            disabled={!pagination.hasPreviousPage || isFetching}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous page</span>
          </Button>
          <div className="flex items-center gap-1">
            <span className="text-sm">Page</span>
            <strong className="text-sm">
              {pagination.currentPage} of {pagination.totalPages}
            </strong>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(pagination.currentPage + 1)}
            disabled={!pagination.hasNextPage || isFetching}
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next page</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(pagination.totalPages)}
            disabled={!pagination.hasNextPage || isFetching}
          >
            <ChevronsRight className="h-4 w-4" />
            <span className="sr-only">Last page</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
