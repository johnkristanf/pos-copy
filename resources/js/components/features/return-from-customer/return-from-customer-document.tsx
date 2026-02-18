import { Document, Page, Text, View } from "@react-pdf/renderer"
import { USIDocsHeader } from "@/components/ui/common/usi-docs-header"
import { formatPdfNumber } from "@/lib/format"
import { tw } from "@/lib/tw"
import { ReturnFromCustomer } from "@/types"

interface ReturnDocumentProps {
  returnItem: ReturnFromCustomer
  logo?: string | null
}

export const ReturnFromCustomerDocument = ({
  returnItem,
  logo,
}: ReturnDocumentProps) => {
  const totalAmount =
    returnItem.items?.reduce((sum, item) => {
      const unitPrice = parseFloat(item.selling_prices?.unit_price || "0")
      return sum + (item.pivot?.quantity || 0) * unitPrice
    }, 0) || 0

  return (
    <Document>
      <Page size="LETTER" style={tw("flex flex-col bg-white p-10 text-[9px]")}>
        <USIDocsHeader logo={logo} title="CUSTOMER RETURN SLIP" />

        <View
          style={tw(
            "flex-row justify-between mb-6 mt-2 border-b border-gray-100 pb-4",
          )}
        >
          <View>
            <Text style={tw("text-gray-500 mb-1")}>Customer:</Text>
            <Text style={tw("font-bold text-[10px]")}>
              {returnItem.customer?.name}
            </Text>
            <Text style={tw("text-gray-500 mt-1")}>Reason:</Text>
            <Text style={tw("text-[9px]")}>{returnItem.reason || "N/A"}</Text>
          </View>
          <View style={tw("items-end")}>
            <Text style={tw("text-gray-500 mb-1")}>Invoice No:</Text>
            <Text style={tw("font-bold text-[10px]")}>
              {returnItem.invoice_number}
            </Text>
            <Text style={tw("text-gray-500 mt-1 mb-1")}>Return Date:</Text>
            <Text style={tw("font-bold")}>
              {new Date(returnItem.invoice_issued_date).toLocaleDateString()}
            </Text>
          </View>
        </View>

        {/* Table Header */}
        <View style={tw("flex-row bg-gray-100 py-2 px-1 font-bold")}>
          <Text style={tw("w-[10%] text-center")}>Qty</Text>
          <Text style={tw("w-[50%] px-1")}>Product Description</Text>
          <Text style={tw("w-[20%] text-right")}>Unit Price</Text>
          <Text style={tw("w-[20%] text-right px-1")}>Total</Text>
        </View>

        {/* Table Rows */}
        {returnItem.items?.map((item, index) => {
          const qty = item.pivot?.quantity || 0
          const price = parseFloat(item.selling_prices?.unit_price || "0")
          return (
            <View
              key={item.id}
              style={tw(
                `flex-row py-2 px-1 border-b border-gray-100 ${index % 2 === 0 ? "" : "bg-gray-50"}`,
              )}
            >
              <Text style={tw("w-[10%] text-center font-bold")}>{qty}</Text>
              <Text style={tw("w-[50%] px-1")}>{item.description}</Text>
              <Text style={tw("w-[20%] text-right")}>
                {formatPdfNumber(price)}
              </Text>
              <Text style={tw("w-[20%] text-right font-bold px-1")}>
                {formatPdfNumber(qty * price)}
              </Text>
            </View>
          )
        })}

        {/* Summary */}
        <View style={tw("flex-row justify-end mt-4")}>
          <View style={tw("w-[40%] border-t border-gray-200 pt-2")}>
            <View style={tw("flex-row justify-between")}>
              <Text style={tw("font-bold text-[11px]")}>
                Total Return Value:
              </Text>
              <Text style={tw("font-bold text-[11px]")}>
                {formatPdfNumber(totalAmount)}
              </Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  )
}
