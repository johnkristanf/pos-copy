import { useMemo } from "react"
import { DataTable } from "@/components/ui/data-table"
import { PaginationInfo } from "@/components/ui/data-table/data-table-pagination"
import { useSidebarToggle } from "@/hooks/ui/use-sidebar-toggle"
import { cn } from "@/lib/cn"
import {
  Category,
  Location,
  PaginatedOrderableItems,
  PaymentMethod,
  UnitOfMeasure,
  User,
} from "@/types"
import { BillingSalesOrder } from "./billing-sales-orders"
import { getCreateOrderColumns } from "./create-orders-columns"
import { CreateOrdersToolbar } from "./create-orders-toolbar"
import { MobileCreateOrdersCard } from "./mobile-orders-card"
import { SalesOrderSummary } from "./sales-order-summary"
import {
  useCreateOrderActions,
  useOrderErrors,
  useSelectedItems,
  useSelectedPriceTypes,
  useSelectedUoms,
} from "./use-create-order-store"

interface CreateOrderSectionProps {
  items: PaginatedOrderableItems
  categories: Category[]
  unit_of_measures?: UnitOfMeasure[]
  payment_methods: PaymentMethod[]
  isSalesOfficer?: boolean
  updatingItemId?: number | null
  user: User
}

export const CreateOrderSection = ({
  items,
  categories = [],
  unit_of_measures = [],
  payment_methods = [],
  isSalesOfficer,
  updatingItemId,
  user,
}: CreateOrderSectionProps) => {
  const { isOpen: isSidebarOpen } = useSidebarToggle()
  const { toggleItem, toggleAll, setUom } = useCreateOrderActions()
  const selectedItems = useSelectedItems()
  const selectedUoms = useSelectedUoms()
  const selectedPriceTypes = useSelectedPriceTypes()
  const errors = useOrderErrors()
  const data = items?.data || []

  const selectedIds = useMemo(
    () => new Set(Object.keys(selectedItems).map(Number)),
    [selectedItems],
  )

  const currentIds = useMemo(() => data.map((i) => i.id), [data])
  const hasSelectedItems = Object.keys(selectedItems).length > 0
  const selectedCount = Object.keys(selectedItems).length
  const isAllSelected =
    currentIds.length > 0 && currentIds.every((id) => selectedIds.has(id))

  const columns = useMemo(
    () =>
      getCreateOrderColumns(
        (checked) => toggleAll(data, checked),
        (item, checked) => toggleItem(item, checked),
        selectedIds,
        isAllSelected,
        unit_of_measures,
        setUom,
        selectedUoms,
        // setPriceType,
        selectedPriceTypes,
        errors,
        selectedItems,
      ),
    [
      selectedIds,
      isAllSelected,
      data,
      toggleAll,
      toggleItem,
      unit_of_measures,
      setUom,
      selectedUoms,
      // setPriceType,
      selectedPriceTypes,
      errors,
      selectedItems,
    ],
  )

  const derivedLocations = useMemo(() => {
    const locs = new Map<number, Location>()
    data.forEach((item) => {
      if (item.stocks) {
        item.stocks.forEach((stock) => {
          if (stock.location) {
            locs.set(stock.location.id, stock.location as unknown as Location)
          }
        })
      }
    })
    return Array.from(locs.values())
  }, [data])

  const pagination: PaginationInfo = {
    currentPage: items?.current_page || 1,
    totalPages: items?.last_page || 1,
    totalItems: items?.total || 0,
    itemsPerPage: items?.per_page || 10,
    hasNextPage: !!items?.next_page_url,
    hasPreviousPage: !!items?.prev_page_url,
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold">
            {isSalesOfficer ? "Create Order" : "Review Order"}
          </h2>
          <p className="text-muted-foreground text-xs sm:text-sm">
            Browse inventory and add items to the current order.
          </p>
        </div>
      </div>

      <div
        className={cn(
          "flex flex-col gap-4",
          isSalesOfficer &&
            (isSidebarOpen
              ? "xl:flex-row xl:items-start"
              : "lg:flex-row lg:items-start"),
        )}
      >
        <div className="flex-1 w-full min-w-0">
          <DataTable
            data={data}
            pagination={pagination}
            useInertia={true}
            columns={columns}
            toolbar={
              <CreateOrdersToolbar
                categories={categories}
                locations={derivedLocations}
                hasSelectedItems={hasSelectedItems}
                selectedCount={selectedCount}
                user={user}
                isSalesOfficer={isSalesOfficer}
              />
            }
            searchPlaceholder="Search by name, SKU..."
            emptyMessage="No items found matching your criteria."
            mobileCardComponent={(item) => (
              <MobileCreateOrdersCard
                item={item}
                isSelected={selectedIds.has(item.id)}
                onToggle={(checked) => toggleItem(item, checked)}
                unit_of_measures={unit_of_measures}
                setUom={setUom}
                selectedUoms={selectedUoms}
              />
            )}
            enableMobileCards={true}
            isRowLoading={(item) => item.id === updatingItemId}
          />
        </div>

        {isSalesOfficer && (
          <div
            className={cn(
              "flex w-full flex-col gap-4 shrink-0",
              isSidebarOpen
                ? "xl:w-77.5 xl:sticky xl:top-4"
                : "lg:w-77.5 lg:sticky lg:top-4",
            )}
          >
            <div className="flex flex-col border-0 shadow-none bg-transparent gap-4">
              <BillingSalesOrder paymentMethods={payment_methods} />
            </div>
            <SalesOrderSummary />
          </div>
        )}
      </div>
    </div>
  )
}
