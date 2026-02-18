import { useMemo } from "react"
import { DataTable } from "@/components/ui/data-table"
import { PaginationInfo } from "@/components/ui/data-table/data-table-pagination"
import { useDynamicDialog } from "@/hooks/ui/use-dynamic-dialog"
import { PaginatedCustomers, User } from "@/types"
import { CreateCustomerForm } from "./create-customer-form"
import { CustomerExport } from "./customer-export"
import { getCustomersColumns } from "./customers-column"
import { CustomersToolbar } from "./customers-toolbar"
import { MobileCustomersCard } from "./mobile-customers-card"

interface CustomersSectionProps {
  customers: PaginatedCustomers
  updatingCustomerId?: number | null
  setUpdatingCustomerId?: (id: number | null) => void
  user: User
}

export function CustomersSection({
  customers,
  updatingCustomerId,
  setUpdatingCustomerId,
  user,
}: CustomersSectionProps) {
  const { openDialog } = useDynamicDialog()

  const customersColumn = useMemo(
    () => getCustomersColumns(setUpdatingCustomerId, user),
    [setUpdatingCustomerId, user],
  )

  const pagination: PaginationInfo = {
    currentPage: customers?.current_page || 1,
    totalPages: customers?.last_page || 1,
    totalItems: customers?.total || 0,
    itemsPerPage: customers?.per_page || 10,
    hasNextPage: !!customers?.next_page_url,
    hasPreviousPage: !!customers?.prev_page_url,
  }

  const handleCreateNew = () => {
    openDialog({
      title: "Create New Customer",
      description: "Add a new customer to the system",
      children: <CreateCustomerForm />,
    })
  }

  const handleExport = () => {
    openDialog({
      title: "Export Customers",
      description: "Preview and download customer list",
      children: <CustomerExport customers={customers?.data || []} />,
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold">Customers</h2>
          <p className="text-muted-foreground text-xs sm:text-sm">
            Manage customers and their information
          </p>
        </div>
      </div>

      <DataTable
        data={customers?.data || []}
        pagination={pagination}
        useInertia={true}
        columns={customersColumn}
        toolbar={
          <CustomersToolbar
            onCreateNew={handleCreateNew}
            onExport={handleExport}
            user={user}
            customers={customers?.data || []}
          />
        }
        searchPlaceholder="Search customers..."
        emptyMessage="No customers found"
        mobileCardComponent={(customer) => (
          <MobileCustomersCard customer={customer} />
        )}
        enableMobileCards={true}
        isRowLoading={(item) => item.id === updatingCustomerId}
      />
    </div>
  )
}
