import { Document, Font, Page, Text, View } from "@react-pdf/renderer"
import { format } from "date-fns"
import { USIDocsHeader } from "@/components/ui/common/usi-docs-header"
import { tw } from "@/lib/tw"
import { FastMovingItem, ProfitableItem, SlowMovingItem } from "@/types"

Font.register({
  family: "Helvetica",
  fonts: [{ src: "Helvetica" }, { src: "Helvetica-Bold", fontWeight: "bold" }],
})

interface PriceReportPdfProps {
  startDate?: string | null
  endDate?: string | null
  profitableItems?: ProfitableItem[]
  fastMovingItems?: FastMovingItem[]
  slowMovingItems?: SlowMovingItem[]
  logo?: string | null
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
  }).format(amount)
}

export const PriceReportPdfDocument = ({
  startDate,
  endDate,
  profitableItems = [],
  fastMovingItems = [],
  slowMovingItems = [],
  logo,
}: PriceReportPdfProps) => {
  const dateRangeStr =
    startDate && endDate
      ? `${format(new Date(startDate), "MMM dd, yyyy")} - ${format(new Date(endDate), "MMM dd, yyyy")}`
      : "All Time"

  return (
    <Document>
      <Page
        size="A4"
        style={{
          ...tw("p-8"),
          fontFamily: "Helvetica",
          fontSize: "10px",
        }}
      >
        <View style={tw("mb-4 pb-4")}>
          <USIDocsHeader logo={logo || ""} title="PRICE REPORT" />
          <View style={tw("flex flex-row justify-between")}>
            <View style={tw("flex flex-col")}>
              <Text style={tw("text-[10px] text-gray-500")}>Report Period</Text>
              <Text style={tw("text-xs text-gray-700")}>{dateRangeStr}</Text>
            </View>
            <View style={tw("flex flex-col items-end")}>
              <Text style={tw("text-[10px] text-gray-500")}>Generated On</Text>
              <Text style={tw("text-xs text-gray-700")}>
                {format(new Date(), "MMM dd, yyyy HH:mm")}
              </Text>
            </View>
          </View>
        </View>

        <View style={tw("mb-4")}>
          <Text
            style={tw(
              "text-sm text-gray-800 font-bold mb-2 uppercase tracking-wide",
            )}
          >
            Top Profitable Items
          </Text>

          <View style={tw("border border-gray-300 flex flex-col")}>
            <View
              style={tw("flex flex-row bg-gray-100 text-[9px] text-gray-700")}
            >
              <Text style={tw("w-[70%] border-r border-gray-300 py-2 pl-2")}>
                Item Description
              </Text>
              <Text style={tw("w-[30%] py-2 pr-2 text-right")}>
                Total Revenue
              </Text>
            </View>

            {profitableItems.length > 0 ? (
              profitableItems.map((item, index) => (
                <View
                  key={index}
                  style={{
                    ...tw(
                      "flex flex-row border-b border-gray-200 items-center",
                    ),
                    ...(index === profitableItems.length - 1
                      ? { borderBottomWidth: 0 }
                      : {}),
                  }}
                >
                  <Text
                    style={tw(
                      "w-[70%] border-r border-gray-200 py-2 pl-2 text-left text-[9px]",
                    )}
                  >
                    {item.description}
                  </Text>
                  <Text style={tw("w-[30%] py-2 pr-2 text-right text-[9px]")}>
                    {formatCurrency(item.total_revenue)}
                  </Text>
                </View>
              ))
            ) : (
              <View style={tw("p-4")}>
                <Text style={tw("text-[9px] text-gray-500 text-center")}>
                  No data available
                </Text>
              </View>
            )}
          </View>
        </View>

        <View style={tw("flex flex-row gap-4 mt-2")}>
          <View style={tw("flex-1")}>
            <Text
              style={tw(
                "text-sm text-gray-800 font-bold mb-2 uppercase tracking-wide",
              )}
            >
              Fast Moving Items
            </Text>
            <View style={tw("border border-gray-300 flex flex-col")}>
              <View
                style={tw(
                  "flex flex-row bg-gray-100 text-[9px] text-gray-700 font-bold",
                )}
              >
                <Text style={tw("w-[70%] border-r border-gray-300 py-2 pl-2")}>
                  Description
                </Text>
                <Text style={tw("w-[30%] py-2 pr-2 text-right")}>Avg Days</Text>
              </View>
              {fastMovingItems.length > 0 ? (
                fastMovingItems.map((item, index) => (
                  <View
                    key={index}
                    style={{
                      ...tw(
                        "flex flex-row border-b border-gray-200 items-center",
                      ),
                      ...(index === profitableItems.length - 1
                        ? { borderBottomWidth: 0 }
                        : {}),
                    }}
                  >
                    <Text
                      style={tw(
                        "w-[70%] border-r border-gray-200 py-2 pl-2 text-left text-[9px]",
                      )}
                    >
                      {item.description}
                    </Text>
                    <Text style={tw("w-[30%] py-2 pr-2 text-right text-[9px]")}>
                      {item.average_order_difference_days.toFixed(1)} d
                    </Text>
                  </View>
                ))
              ) : (
                <View style={tw("p-4")}>
                  <Text style={tw("text-[9px] text-gray-500 text-center")}>
                    No data available
                  </Text>
                </View>
              )}
            </View>
          </View>

          <View style={tw("flex-1")}>
            <Text
              style={tw(
                "text-sm text-gray-800 font-bold mb-2 uppercase tracking-wide",
              )}
            >
              Slow Moving Items
            </Text>
            <View style={tw("border border-gray-300 flex flex-col")}>
              <View
                style={tw(
                  "flex flex-row bg-gray-100 text-[9px] text-gray-700 font-bold",
                )}
              >
                <Text style={tw("w-[70%] border-r border-gray-300 py-2 pl-2")}>
                  Description
                </Text>
                <Text style={tw("w-[30%] py-2 pr-2 text-right")}>Avg Days</Text>
              </View>
              {slowMovingItems.length > 0 ? (
                slowMovingItems.map((item, index) => (
                  <View
                    key={index}
                    style={{
                      ...tw(
                        "flex flex-row border-b border-gray-200 items-center",
                      ),
                      ...(index === profitableItems.length - 1
                        ? { borderBottomWidth: 0 }
                        : {}),
                    }}
                  >
                    <Text
                      style={tw(
                        "w-[70%] border-r border-gray-200 py-2 pl-2 text-left text-[9px]",
                      )}
                    >
                      {item.description}
                    </Text>
                    <Text style={tw("w-[30%] py-2 pr-2 text-right text-[9px]")}>
                      {item.average_order_difference_days.toFixed(1)} d
                    </Text>
                  </View>
                ))
              ) : (
                <View style={tw("p-4")}>
                  <Text style={tw("text-[9px] text-gray-500 text-center")}>
                    No data available
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </Page>
    </Document>
  )
}
