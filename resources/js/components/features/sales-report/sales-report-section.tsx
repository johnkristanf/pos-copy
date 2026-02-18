import { router } from "@inertiajs/react"
import { addDays, format, parseISO } from "date-fns"
import { motion } from "framer-motion"
import { Printer } from "lucide-react"
import { useQueryState } from "nuqs"
import { useEffect, useRef, useState } from "react"
import { DateRange } from "react-day-picker"
import { Button } from "@/components/ui/common/button"
import { DatePickerWithRange } from "@/components/ui/common/date-range-picker"
import { SectionHeader } from "@/components/ui/common/section-header"
import { APP_ASSETS } from "@/config/assets"
import { useDynamicDialog } from "@/hooks/ui/use-dynamic-dialog"
import { useRolePermissionFeatureViewer } from "@/hooks/ui/use-role-permission-viewer"
import {
  cardVariants,
  containerVariants,
  itemVariants,
} from "@/lib/animation-variants"
import {
  AffiliatedCustomer,
  CashReconciliation,
  ItemCategorySales,
  NonAffiliatedCustomer,
  TopCustomerSales,
  TotalSales,
  User,
} from "@/types"
import MonthlySalesReport from "./monthly-sales-report"
import SalesCategoryBreakdown from "./pie-chart-category"
import CustomerSalesBreakdown from "./pie-chart-customer"
import SalesReportPrint from "./sales-report-print"
import FinancialSummaryReport from "./summary-sales-report"
import TopCustomersNonAffiliatedChart from "./top-customer-non-affiliated"
import TopCustomersAffiliatedChart from "./top-customers-affiliated"

interface SalesReportSectionProps {
  totalSales: TotalSales
  totalAffiliatedCustomer: AffiliatedCustomer[]
  totalNonAffiliatedCustomer: NonAffiliatedCustomer[]
  itemCategorySales: ItemCategorySales[]
  topCustomerSales: TopCustomerSales[]
  cashReconciliation: CashReconciliation
  user: User
}

export const SalesReportSection = ({
  totalSales,
  totalAffiliatedCustomer,
  totalNonAffiliatedCustomer,
  itemCategorySales,
  topCustomerSales,
  cashReconciliation,
  user,
}: SalesReportSectionProps) => {
  const { openDialog } = useDynamicDialog()
  const isMounted = useRef(false)
  const { viewWrapper } = useRolePermissionFeatureViewer()
  const canExport = viewWrapper(
    [],
    ["reports_and_analytics"],
    [],
    ["print"],
    user,
  )

  const [categoryFilter, setCategoryFilter] = useQueryState("category_filter", {
    defaultValue: "credit_sales",
    shallow: true,
  })

  const [customerFilter, setCustomerFilter] = useQueryState("customer_filter", {
    defaultValue: "credit_sales",
    shallow: true,
  })

  const [startDateParam, setStartDateParam] = useQueryState("start_date", {
    defaultValue: format(new Date(), "yyyy-MM-dd"),
    shallow: true,
  })

  const [endDateParam, setEndDateParam] = useQueryState("end_date", {
    defaultValue: format(addDays(new Date(), 30), "yyyy-MM-dd"),
    shallow: true,
  })

  const [date, setDate] = useState<DateRange | undefined>(() => {
    return {
      from: startDateParam ? parseISO(startDateParam) : undefined,
      to: endDateParam ? parseISO(endDateParam) : undefined,
    }
  })

  useEffect(() => {
    if (isMounted.current) {
      const isCompleteRange = date?.from && date?.to
      const isCleared = !date?.from && !date?.to

      if (isCompleteRange || isCleared) {
        if (date?.from) setStartDateParam(format(date.from, "yyyy-MM-dd"))
        else setStartDateParam(null)

        if (date?.to) setEndDateParam(format(date.to, "yyyy-MM-dd"))
        else setEndDateParam(null)

        router.get(
          window.location.pathname,
          {
            start_date: date?.from ? format(date.from, "yyyy-MM-dd") : null,
            end_date: date?.to ? format(date.to, "yyyy-MM-dd") : null,
            category_filter: categoryFilter,
            customer_filter: customerFilter,
          },
          {
            preserveState: true,
            preserveScroll: true,
            replace: true,
          },
        )
      }
    } else {
      isMounted.current = true
    }
  }, [date, categoryFilter, customerFilter])

  const handleDateChange = (newDate: DateRange | undefined) => {
    setDate(newDate)
  }

  const handlePrintReport = () => {
    openDialog({
      title: "Sales Report",
      description: "Review your sales overview before exporting.",
      children: (
        <SalesReportPrint
          totalSales={totalSales}
          itemCategorySales={itemCategorySales}
          topCustomerSales={topCustomerSales}
          affiliatedCustomers={totalAffiliatedCustomer}
          nonAffiliatedCustomers={totalNonAffiliatedCustomer}
          logo={APP_ASSETS.COMPANY_LOGO_PNG}
        />
      ),
    })
  }

  return (
    <motion.div
      className="space-y-4"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div variants={itemVariants}>
        <SectionHeader
          headerTitle="Sales Report"
          headerSubtitle="Overview of monthly revenue and sales distribution."
        />
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="flex justify-between items-center"
      >
        <DatePickerWithRange date={date} setDate={handleDateChange} />
        {canExport && (
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={handlePrintReport}
              variant="outline"
              className="gap-2"
            >
              <Printer className="h-4 w-4" /> Export to PDF
            </Button>
          </motion.div>
        )}
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 xl:grid-cols-3 gap-4"
      >
        <motion.div
          className="xl:col-span-2 flex flex-col gap-4 w-full"
          variants={cardVariants}
        >
          <motion.div
            id="monthly-sales-chart"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
          >
            <MonthlySalesReport totalSales={totalSales} />
          </motion.div>
          <motion.div
            className="flex gap-4 w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
          >
            <motion.div
              className="flex-1 min-w-0"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <SalesCategoryBreakdown
                itemCategorySales={itemCategorySales}
                currentFilter={categoryFilter}
                onFilterChange={setCategoryFilter}
              />
            </motion.div>
            <motion.div
              className="flex-1 min-w-0"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <CustomerSalesBreakdown
                topCustomerSales={topCustomerSales}
                currentFilter={customerFilter}
                onFilterChange={setCustomerFilter}
              />
            </motion.div>
          </motion.div>
        </motion.div>

        <motion.div
          className="scale-100 origin-top-left flex flex-col gap-4"
          variants={cardVariants}
        >
          <motion.div
            id="top-customers-affiliated-chart"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, type: "spring", stiffness: 100 }}
            whileHover={{ scale: 1.02 }}
          >
            <TopCustomersAffiliatedChart
              totalAffiliatedCustomer={totalAffiliatedCustomer}
            />
          </motion.div>
          <motion.div
            id="top-customers-non-affiliated-chart"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 100 }}
            whileHover={{ scale: 1.02 }}
          >
            <TopCustomersNonAffiliatedChart
              totalNonAffiliatedCustomer={totalNonAffiliatedCustomer}
            />
          </motion.div>
          <motion.div
            id="financial-summary-chart"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, type: "spring", stiffness: 100 }}
            whileHover={{ scale: 1.02 }}
          >
            <FinancialSummaryReport cashReconciliation={cashReconciliation} />
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
