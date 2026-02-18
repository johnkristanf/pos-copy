import { router } from "@inertiajs/react"
import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import { addDays, format, parseISO } from "date-fns"
import { motion } from "framer-motion"
import { Printer } from "lucide-react"
import { useQueryState } from "nuqs"
import { useEffect, useMemo, useRef, useState } from "react"
import { DateRange } from "react-day-picker"
import { Button } from "@/components/ui/common/button"
import { Card } from "@/components/ui/common/card"
import { DatePickerWithRange } from "@/components/ui/common/date-range-picker"
import { SectionHeader } from "@/components/ui/common/section-header"
import { DataTable } from "@/components/ui/data-table"
import { API_ROUTES } from "@/config/api-routes"
import { useDynamicDialog } from "@/hooks/ui/use-dynamic-dialog"
import { useRolePermissionFeatureViewer } from "@/hooks/ui/use-role-permission-viewer"
import { containerVariants, itemVariants } from "@/lib/animation-variants"
import { Item, User } from "@/types"
import FastMovingItemsChart from "./fast-moving-item"
import { getPriceReportColumn } from "./price-report-column"
import { PriceReportPrint } from "./price-report-print"
import SlowMovingItemsChart from "./slow-moving-item"
import TopProfitableItemsChart from "./top-profitable-items"

interface PriceReportSectionProps {
  allItemsReport: Item[]
  user: User
}

export const PriceReportSection = ({
  allItemsReport,
  user,
}: PriceReportSectionProps) => {
  const priceReportColumns = useMemo(() => getPriceReportColumn(), [])
  const { openDialog } = useDynamicDialog()
  const isMounted = useRef(false)
  const { viewWrapper } = useRolePermissionFeatureViewer()
  const canExport = viewWrapper(
    [],
    ["price_analysis_report"],
    [],
    ["print"],
    user,
  )

  const [startDateParam, setStartDateParam] = useQueryState("start_date", {
    defaultValue: format(new Date(), "yyyy-MM-dd"),
    shallow: true,
  })

  const [endDateParam, setEndDateParam] = useQueryState("end_date", {
    defaultValue: format(addDays(new Date(), 30), "yyyy-MM-dd"),
    shallow: true,
  })

  const [date, setDate] = useState<DateRange | undefined>(() => ({
    from: startDateParam ? parseISO(startDateParam) : undefined,
    to: endDateParam ? parseISO(endDateParam) : undefined,
  }))

  const { data: profitableData = [], isLoading: isLoadingProfitable } =
    useQuery({
      queryKey: ["top-profitable-items", startDateParam, endDateParam],
      queryFn: async () => {
        const response = await axios.get(API_ROUTES.GET_TOP_PROFITABLE_ITEMS, {
          params: { start_date: startDateParam, end_date: endDateParam },
        })
        return response.data
      },
      retry: false,
    })

  const { data: fastMovingData = [], isLoading: isLoadingFast } = useQuery({
    queryKey: ["fast-moving-items", startDateParam, endDateParam],
    queryFn: async () => {
      const response = await axios.get(API_ROUTES.GET_FAST_MOVING_ITEMS, {
        params: { start_date: startDateParam, end_date: endDateParam },
      })
      return response.data
    },
    retry: false,
  })

  const { data: slowMovingData = [], isLoading: isLoadingSlow } = useQuery({
    queryKey: ["slow-moving-items", startDateParam, endDateParam],
    queryFn: async () => {
      const response = await axios.get(API_ROUTES.GET_SLOW_MOVING_ITEMS, {
        params: { start_date: startDateParam, end_date: endDateParam },
      })
      return response.data
    },
    retry: false,
  })

  useEffect(() => {
    if (isMounted.current) {
      const isCompleteRange = date?.from && date?.to
      const isCleared = !date?.from && !date?.to

      if (isCompleteRange || isCleared) {
        const newStart = date?.from ? format(date.from, "yyyy-MM-dd") : null
        const newEnd = date?.to ? format(date.to, "yyyy-MM-dd") : null

        setStartDateParam(newStart)
        setEndDateParam(newEnd)

        router.get(
          window.location.pathname,
          {
            start_date: newStart,
            end_date: newEnd,
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
  }, [date])

  const handlePrintReport = () => {
    openDialog({
      title: "Price Report",
      description: "Review your sales overview before exporting.",
      children: (
        <PriceReportPrint
          startDate={startDateParam}
          endDate={endDateParam}
          fastMovingItems={fastMovingData}
          slowMovingItems={slowMovingData}
          profitableItems={profitableData}
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
          headerTitle="Price Report"
          headerSubtitle="Comprehensive breakdown of pricing, profitability, and stock movement."
        />
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="flex justify-between items-center"
      >
        <DatePickerWithRange date={date} setDate={setDate} />
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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, type: "spring" as const, stiffness: 100 }}
          whileHover={{ scale: 1.02 }}
          className="transition-shadow hover:shadow-lg"
        >
          <TopProfitableItemsChart
            data={profitableData}
            isLoading={isLoadingProfitable}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, type: "spring" as const, stiffness: 100 }}
          whileHover={{ scale: 1.02 }}
          className="transition-shadow hover:shadow-lg"
        >
          <FastMovingItemsChart
            data={fastMovingData}
            isLoading={isLoadingFast}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, type: "spring" as const, stiffness: 100 }}
          whileHover={{ scale: 1.02 }}
          className="transition-shadow hover:shadow-lg"
        >
          <SlowMovingItemsChart
            data={slowMovingData}
            isLoading={isLoadingSlow}
          />
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, type: "spring" as const, stiffness: 80 }}
      >
        <Card className="p-4">
          <DataTable
            data={allItemsReport}
            columns={priceReportColumns}
            useInertia={true}
            searchPlaceholder="Search items by name, brand, or category..."
            emptyMessage="No price data available."
          />
        </Card>
      </motion.div>
    </motion.div>
  )
}
