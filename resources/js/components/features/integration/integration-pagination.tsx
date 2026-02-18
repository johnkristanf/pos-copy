"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/common/button"
import { PaginationInfo } from "@/types"

interface IntegrationPaginationProps {
  paginationInfo: PaginationInfo
  onPageChange: (page: number) => void
  onPrevPage: () => void
  onNextPage: () => void
  isLoading?: boolean
  showInfo?: boolean
}

export const IntegrationPagination = ({
  paginationInfo,
  onPageChange,
  onPrevPage,
  onNextPage,
  isLoading = false,
  showInfo = true,
}: IntegrationPaginationProps) => {
  if (!paginationInfo || paginationInfo.lastPage <= 1) {
    return null
  }

  const from = paginationInfo.from ?? 0
  const to = paginationInfo.to ?? 0
  const currentPageItemsCount = from && to ? to - from + 1 : 0

  return (
    <div className="space-y-4">
      {showInfo && paginationInfo.total > 0 && currentPageItemsCount > 0 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Showing {currentPageItemsCount} out of {paginationInfo.total} items
          </span>
          <span>
            Page {paginationInfo.currentPage} of {paginationInfo.lastPage}
          </span>
        </div>
      )}

      <div className="flex items-center justify-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onPrevPage}
          disabled={!paginationInfo.hasPrevPage || isLoading}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </Button>

        <div className="flex items-center gap-1">
          {Array.from({ length: paginationInfo.lastPage }, (_, i) => i + 1)
            .filter((page) => {
              return (
                page === 1 ||
                page === paginationInfo.lastPage ||
                Math.abs(page - paginationInfo.currentPage) <= 1
              )
            })
            .map((page, index, array) => {
              const prevPage = array[index - 1]
              const showEllipsis = prevPage && page - prevPage > 1

              return (
                <div key={page} className="flex items-center">
                  {showEllipsis && (
                    <span className="px-2 text-muted-foreground">...</span>
                  )}
                  <Button
                    variant={
                      page === paginationInfo.currentPage
                        ? "bridge_digital"
                        : "ghost"
                    }
                    size="sm"
                    onClick={() => onPageChange(page)}
                    disabled={isLoading}
                    className="w-8 h-8 p-0"
                  >
                    {page}
                  </Button>
                </div>
              )
            })}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={onNextPage}
          disabled={!paginationInfo.hasNextPage || isLoading}
        >
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  )
}
