import { Document, Page, Text, View } from "@react-pdf/renderer"
import { USIDocsHeader } from "@/components/ui/common/usi-docs-header"
import { formatPdfNumber } from "@/lib/format"
import { tw } from "@/lib/tw"
import { ReturnToSupplier } from "@/types"

interface ReturnDocumentProps {
  returnItem: ReturnToSupplier
  logo?: string | null
}

export const ReturnToSupplierDocument = ({
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
        <USIDocsHeader logo={logo} title="PURCHASE RETURN SLIP" />

        <View
          style={tw(
            "flex-row justify-between mb-6 mt-2 border-b border-gray-100 pb-4",
          )}
        >
          <View style={tw("w-[60%]")}>
            <Text style={tw("text-gray-500 mb-1")}>Supplier:</Text>
            <Text style={tw("font-bold text-[10px]")}>
              {returnItem.supplier?.name}
            </Text>
            <Text style={tw("text-gray-500 mt-2")}>Remarks / Reason:</Text>
            <Text style={tw("text-[9px]")}>
              {returnItem.remarks || "No remarks provided"}
            </Text>
          </View>
          <View style={tw("items-end w-[40%]")}>
            <Text style={tw("text-gray-500 mb-1")}>Return Type:</Text>
            <Text style={tw("font-bold text-[10px] capitalize")}>
              {returnItem.type}
            </Text>
            <Text style={tw("text-gray-500 mt-2 mb-1")}>Date Generated:</Text>
            <Text style={tw("font-bold")}>
              {new Date().toLocaleDateString()}
            </Text>
          </View>
        </View>

        {/* Table Header */}
        <View style={tw("flex-row bg-slate-100 py-2 px-1 font-bold")}>
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
                `flex-row py-2 px-1 border-b border-gray-100 ${index % 2 === 0 ? "" : "bg-slate-50"}`,
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
          <View style={tw("w-[40%] border-t border-slate-200 pt-2")}>
            <View style={tw("flex-row justify-between")}>
              <Text style={tw("font-bold text-[11px]")}>Total Amount:</Text>
              <Text style={tw("font-bold text-[11px]")}>
                {formatPdfNumber(totalAmount)}
              </Text>
            </View>
          </View>
        </View>

        <View style={tw("mt-auto pt-10 flex-row justify-between")}>
          <View style={tw("border-t border-gray-300 w-[30%] pt-1")}>
            <Text style={tw("text-center text-gray-500")}>Prepared By</Text>
          </View>
          <View style={tw("border-t border-gray-300 w-[30%] pt-1")}>
            <Text style={tw("text-center text-gray-500")}>Approved By</Text>
          </View>
          <View style={tw("border-t border-gray-300 w-[30%] pt-1")}>
            <Text style={tw("text-center text-gray-500")}>Received By</Text>
            <Text style={tw("text-center text-gray-400")}>
              Signature over Printed Name
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  )
}
