import { Document, Font, Page, Text, View } from "@react-pdf/renderer"
import { USIDocsHeader } from "@/components/ui/common/usi-docs-header"
import { tw } from "@/lib/tw"
import {
  AffiliatedCustomer,
  ItemCategorySales,
  NonAffiliatedCustomer,
  TopCustomerSales,
  TotalSales,
} from "@/types"

Font.register({
  family: "Helvetica",
  fonts: [{ src: "Helvetica" }, { src: "Helvetica-Bold", fontWeight: "bold" }],
})

interface SalesReportDocumentProps {
  totalSales: TotalSales
  itemCategorySales: ItemCategorySales[]
  topCustomerSales: TopCustomerSales[]
  affiliatedCustomers: AffiliatedCustomer[]
  nonAffiliatedCustomers: NonAffiliatedCustomer[]
  logo?: string | null
  dateRange?: string
}

const safeCurrency = (value: number | undefined | null) => {
  const num = Number(value || 0)
  return `${num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

const safePercent = (
  value: number | undefined | null,
  total: number | undefined | null,
) => {
  const v = Number(value || 0)
  const t = Number(total || 0)
  if (t === 0) return "0.0"
  return ((v / t) * 100).toFixed(1)
}

export const SalesReportDocument = ({
  totalSales,
  itemCategorySales = [],
  topCustomerSales = [],
  affiliatedCustomers = [],
  nonAffiliatedCustomers = [],
  logo,
  dateRange,
}: SalesReportDocumentProps) => {
  const categorySalesTotal = itemCategorySales.reduce(
    (sum, item) => sum + (item.credit_sales || 0),
    0,
  )
  const customerSalesTotal = topCustomerSales.reduce(
    (sum, item) => sum + (item.credit_sales || 0),
    0,
  )

  const getBorderBottom = (index: number, length: number) => {
    return index < length - 1
      ? { borderBottomWidth: 1, borderBottomColor: "#E5E7EB" }
      : {}
  }

  return (
    <Document>
      <Page size="LETTER" style={tw("flex flex-col bg-white p-10 text-[9px]")}>
        <USIDocsHeader logo={logo || ""} title="SALES REPORT" />

        {dateRange && (
          <View style={tw("mb-4 text-center")}>
            <Text style={tw("text-[8px] text-gray-600")}>{dateRange}</Text>
          </View>
        )}

        <View style={tw("mb-6")}>
          <Text style={tw("text-[11px] font-bold mb-3 text-gray-800")}>
            MONTHLY SALES OVERVIEW
          </Text>

          <View style={tw("flex-row gap-3 mb-4")}>
            <View
              style={tw("flex-1 border border-gray-300 rounded p-3 bg-gray-50")}
            >
              <Text style={tw("text-[7px] text-gray-600 mb-1")}>
                TOTAL SALES
              </Text>
              <Text style={tw("text-[13px] font-bold text-gray-900")}>
                {safeCurrency(totalSales?.total)}
              </Text>
            </View>
            <View
              style={tw("flex-1 border border-gray-300 rounded p-3 bg-gray-50")}
            >
              <Text style={tw("text-[7px] text-gray-600 mb-1")}>
                MONTHLY AVERAGE
              </Text>
              <Text style={tw("text-[13px] font-bold text-gray-900")}>
                {safeCurrency(totalSales?.average_monthly_sales)}
              </Text>
            </View>
            <View
              style={tw("flex-1 border border-gray-300 rounded p-3 bg-gray-50")}
            >
              <Text style={tw("text-[7px] text-gray-600 mb-1")}>
                HIGHEST MONTH
              </Text>
              <Text style={tw("text-[13px] font-bold text-gray-900")}>
                {safeCurrency(totalSales?.highest_month?.total)}
              </Text>
              <Text style={tw("text-[7px] text-gray-500 mt-0.5")}>
                {totalSales?.highest_month?.month || "--"} '
                {totalSales?.highest_month?.year?.slice(-2) || "--"}
              </Text>
            </View>
          </View>

          <View style={tw("border border-gray-300 rounded")}>
            <View
              style={tw(
                "flex-row border-b border-gray-300 bg-gray-100 text-gray-700",
              )}
            >
              <View style={tw("w-1/3 border-r border-gray-300 p-2")}>
                <Text style={tw("text-[8px] font-bold")}>Month</Text>
              </View>
              <View style={tw("w-1/3 border-r border-gray-300 p-2")}>
                <Text style={tw("text-[8px] font-bold text-right")}>
                  Sales Amount
                </Text>
              </View>
              <View style={tw("w-1/3 p-2")}>
                <Text style={tw("text-[8px] font-bold text-right")}>
                  % of Total
                </Text>
              </View>
            </View>

            {(totalSales?.months || []).map((month, index) => (
              <View
                key={index}
                style={{
                  ...tw("flex-row"),
                  ...getBorderBottom(index, totalSales.months.length),
                }}
              >
                <View style={tw("w-1/3 border-r border-gray-200 p-2")}>
                  <Text style={tw("text-[8px]")}>
                    {month.month} '{month.year?.slice(-2)}
                  </Text>
                </View>
                <View style={tw("w-1/3 border-r border-gray-200 p-2")}>
                  <Text style={tw("text-[8px] text-right")}>
                    {safeCurrency(month.total)}
                  </Text>
                </View>
                <View style={tw("w-1/3 p-2")}>
                  <Text style={tw("text-[8px] text-right")}>
                    {safePercent(month.total, totalSales.total)}%
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={tw("mb-6")}>
          <Text style={tw("text-[11px] font-bold mb-3 text-gray-800")}>
            SALES BY CATEGORY
          </Text>
          <View
            style={tw("mb-3 p-3 bg-gray-50 rounded border border-gray-200")}
          >
            <Text style={tw("text-[7px] text-gray-600 mb-0.5")}>
              TOTAL CATEGORY SALES
            </Text>
            <Text style={tw("text-[13px] font-bold text-gray-900")}>
              {safeCurrency(categorySalesTotal)}
            </Text>
          </View>
          <View style={tw("border border-gray-300 rounded")}>
            <View
              style={tw(
                "flex-row border-b border-gray-300 bg-gray-100 text-gray-700",
              )}
            >
              <View style={tw("w-2/5 border-r border-gray-300 p-2")}>
                <Text style={tw("text-[8px] font-bold")}>Category</Text>
              </View>
              <View style={tw("w-2/5 border-r border-gray-300 p-2")}>
                <Text style={tw("text-[8px] font-bold text-right")}>
                  Sales Amount
                </Text>
              </View>
              <View style={tw("w-1/5 p-2")}>
                <Text style={tw("text-[8px] font-bold text-right")}>
                  % Share
                </Text>
              </View>
            </View>
            {[...itemCategorySales]
              .sort((a, b) => b.credit_sales - a.credit_sales)
              .map((cat, index, arr) => (
                <View
                  key={cat.category_id}
                  style={{
                    ...tw("flex-row"),
                    ...getBorderBottom(index, arr.length),
                  }}
                >
                  <View style={tw("w-2/5 border-r border-gray-200 p-2")}>
                    <Text style={tw("text-[8px]")}>{cat.category_name}</Text>
                  </View>
                  <View style={tw("w-2/5 border-r border-gray-200 p-2")}>
                    <Text style={tw("text-[8px] text-right")}>
                      {safeCurrency(cat.credit_sales)}
                    </Text>
                  </View>
                  <View style={tw("w-1/5 p-2")}>
                    <Text style={tw("text-[8px] text-right")}>
                      {safePercent(cat.credit_sales, categorySalesTotal)}%
                    </Text>
                  </View>
                </View>
              ))}
          </View>
        </View>

        <Text
          style={tw("absolute bottom-5 right-10 text-[8px] text-gray-600")}
          render={({ pageNumber, totalPages }) =>
            `Page ${pageNumber} of ${totalPages}`
          }
          fixed
        />
      </Page>

      <Page size="LETTER" style={tw("flex flex-col bg-white p-10 text-[9px]")}>
        <USIDocsHeader logo={logo || ""} title="SALES REPORT" />

        <View style={tw("mb-6")}>
          <Text style={tw("text-[11px] font-bold mb-3 text-gray-800")}>
            SALES BY CUSTOMER
          </Text>
          <View
            style={tw("mb-3 p-3 bg-gray-50 rounded border border-gray-200")}
          >
            <Text style={tw("text-[7px] text-gray-600 mb-0.5")}>
              TOTAL CUSTOMER SALES
            </Text>
            <Text style={tw("text-[13px] font-bold text-gray-900")}>
              {safeCurrency(customerSalesTotal)}
            </Text>
          </View>
          <View style={tw("border border-gray-300 rounded")}>
            <View
              style={tw(
                "flex-row border-b border-gray-300 bg-gray-100 text-gray-700",
              )}
            >
              <View style={tw("w-2/5 border-r border-gray-300 p-2")}>
                <Text style={tw("text-[8px] font-bold")}>Customer Name</Text>
              </View>
              <View style={tw("w-2/5 border-r border-gray-300 p-2")}>
                <Text style={tw("text-[8px] font-bold text-right")}>
                  Sales Amount
                </Text>
              </View>
              <View style={tw("w-1/5 p-2")}>
                <Text style={tw("text-[8px] font-bold text-right")}>
                  % Share
                </Text>
              </View>
            </View>
            {[...topCustomerSales]
              .sort((a, b) => b.credit_sales - a.credit_sales)
              .map((cust, index, arr) => (
                <View
                  key={cust.customer_id}
                  style={{
                    ...tw("flex-row"),
                    ...getBorderBottom(index, arr.length),
                  }}
                >
                  <View style={tw("w-2/5 border-r border-gray-200 p-2")}>
                    <Text style={tw("text-[8px]")}>{cust.customer_name}</Text>
                  </View>
                  <View style={tw("w-2/5 border-r border-gray-200 p-2")}>
                    <Text style={tw("text-[8px] text-right")}>
                      {safeCurrency(cust.credit_sales)}
                    </Text>
                  </View>
                  <View style={tw("w-1/5 p-2")}>
                    <Text style={tw("text-[8px] text-right")}>
                      {safePercent(cust.credit_sales, customerSalesTotal)}%
                    </Text>
                  </View>
                </View>
              ))}
          </View>
        </View>

        <View style={tw("mb-6")}>
          <Text style={tw("text-[11px] font-bold mb-3 text-gray-800")}>
            TOP AFFILIATED CUSTOMERS
          </Text>
          <View style={tw("border border-gray-300 rounded")}>
            <View
              style={tw(
                "flex-row border-b border-gray-300 bg-gray-100 text-gray-700",
              )}
            >
              <View style={tw("w-1/2 border-r border-gray-300 p-2")}>
                <Text style={tw("text-[8px] font-bold")}>Customer Name</Text>
              </View>
              <View style={tw("w-1/2 p-2")}>
                <Text style={tw("text-[8px] font-bold text-right")}>
                  Order Volume
                </Text>
              </View>
            </View>
            {affiliatedCustomers.map((cust, index) => (
              <View
                key={index}
                style={{
                  ...tw("flex-row"),
                  ...getBorderBottom(index, affiliatedCustomers.length),
                }}
              >
                <View style={tw("w-1/2 border-r border-gray-200 p-2")}>
                  <Text style={tw("text-[8px]")}>{cust.customer_name}</Text>
                </View>
                <View style={tw("w-1/2 p-2")}>
                  <Text style={tw("text-[8px] text-right")}>
                    {safeCurrency(cust.total_volume)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={tw("mb-6")}>
          <Text style={tw("text-[11px] font-bold mb-3 text-gray-800")}>
            TOP NON-AFFILIATED CUSTOMERS
          </Text>
          <View style={tw("border border-gray-300 rounded")}>
            <View
              style={tw(
                "flex-row border-b border-gray-300 bg-gray-100 text-gray-700",
              )}
            >
              <View style={tw("w-1/2 border-r border-gray-300 p-2")}>
                <Text style={tw("text-[8px] font-bold")}>Customer Name</Text>
              </View>
              <View style={tw("w-1/2 p-2")}>
                <Text style={tw("text-[8px] font-bold text-right")}>
                  Order Volume
                </Text>
              </View>
            </View>
            {nonAffiliatedCustomers.map((cust, index) => (
              <View
                key={index}
                style={{
                  ...tw("flex-row"),
                  ...getBorderBottom(index, nonAffiliatedCustomers.length),
                }}
              >
                <View style={tw("w-1/2 border-r border-gray-200 p-2")}>
                  <Text style={tw("text-[8px]")}>{cust.customer_name}</Text>
                </View>
                <View style={tw("w-1/2 p-2")}>
                  <Text style={tw("text-[8px] text-right")}>
                    {safeCurrency(cust.total_volume)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <Text
          style={tw("absolute bottom-5 right-10 text-[8px] text-gray-600")}
          render={({ pageNumber, totalPages }) =>
            `Page ${pageNumber} of ${totalPages}`
          }
          fixed
        />
      </Page>
    </Document>
  )
}
