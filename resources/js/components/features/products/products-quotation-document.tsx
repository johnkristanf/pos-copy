import { Document, Font, Page, Text, View } from "@react-pdf/renderer"
import { USIDocsHeader } from "@/components/ui/common/usi-docs-header"
import { formatPdfNumber } from "@/lib/format"
import { tw } from "@/lib/tw"
import { QuotationItem } from "./use-quotation-store"

Font.register({
  family: "Helvetica",
  fonts: [{ src: "Helvetica" }, { src: "Helvetica-Bold", fontWeight: "bold" }],
})

interface ProductQuotationDocumentProps {
  items: QuotationItem[]
  logo?: string | null
}

export const ProductQuotationDocument = ({
  items,
  logo,
}: ProductQuotationDocumentProps) => {
  const grandTotal = items.reduce(
    (sum, item) => sum + (Number(item.product.unit_price) || 0) * item.quantity,
    0,
  )

  return (
    <Document>
      <Page
        size="LETTER"
        orientation="portrait"
        style={tw("flex flex-col bg-white p-10 text-[9px]")}
      >
        <USIDocsHeader logo={logo} title="PRODUCT QUOTATION" />

        {/* Info Meta Data */}
        <View style={tw("flex-row justify-between mb-4 mt-2")}>
          <View>
            <Text style={tw("text-gray-500 mb-1")}>Quotation Date:</Text>
            <Text style={tw("font-bold text-[10px]")}>
              {new Date().toLocaleDateString("en-US", {
                month: "2-digit",
                day: "2-digit",
                year: "numeric",
              })}
            </Text>
          </View>
          <View style={tw("items-end")}>
            <Text style={tw("text-gray-500 mb-1")}>Total Items:</Text>
            <Text style={tw("font-bold text-[10px]")}>{items.length}</Text>
          </View>
        </View>

        {/* Table Header */}
        <View
          style={tw(
            "flex-row bg-gray-100 text-gray-800 border-b border-gray-300 py-2 px-1 font-bold",
          )}
        >
          <Text style={tw("w-[6%] text-center")}>Qty</Text>
          <Text style={tw("w-[34%] px-1")}>Description</Text>
          <Text style={tw("w-[8%] text-center")}>Size</Text>
          <Text style={tw("w-[12%]")}>Category</Text>
          <Text style={tw("w-[15%] text-right")}>Unit Price</Text>
          <Text style={tw("w-[15%] text-right")}>Wholesale</Text>
          <Text style={tw("w-[15%] text-right px-1")}>Total</Text>
        </View>

        {/* Table Rows (Zebra Striping) */}
        {items.map((item, index) => {
          const lineTotal =
            (Number(item.product.unit_price) || 0) * item.quantity

          return (
            <View
              key={item.product.id}
              style={tw(
                `flex-row items-center border-b border-gray-100 py-2 px-1 ${
                  index % 2 === 0 ? "bg-white" : "bg-gray-50"
                }`,
              )}
            >
              {/* Display user-selected quantity here */}
              <Text style={tw("w-[6%] text-center font-bold")}>
                {item.quantity}
              </Text>
              <View style={tw("w-[34%] px-1")}>
                <Text style={tw("font-bold")}>{item.product.description}</Text>
                {item.product.sku && (
                  <Text style={tw("text-gray-400 text-[7px] mt-0.5")}>
                    {item.product.sku}
                  </Text>
                )}
              </View>
              <Text style={tw("w-[8%] text-center")}>
                {item.product.size || "—"}
              </Text>
              <Text style={tw("w-[12%] text-gray-600")}>
                {item.product.category?.name || "—"}
              </Text>

              {/* Pricing columns aligned right */}
              <Text style={tw("w-[15%] text-right text-gray-700")}>
                {formatPdfNumber(item.product.unit_price)}
              </Text>
              <Text style={tw("w-[15%] text-right text-gray-700")}>
                {formatPdfNumber(item.product.wholesale_price)}
              </Text>
              {/* Calculated Line Total */}
              <Text style={tw("w-[15%] text-right font-bold px-1")}>
                {formatPdfNumber(lineTotal)}
              </Text>
            </View>
          )
        })}

        {/* PDF Total Summary */}
        <View style={tw("flex-row justify-end mt-4 px-1")}>
          <View style={tw("w-[30%]")}>
            <View style={tw("flex-row justify-between mb-1")}>
              <Text style={tw("text-gray-600")}>Grand Total:</Text>
              <Text style={tw("font-bold text-[11px]")}>
                {formatPdfNumber(grandTotal)}
              </Text>
            </View>
          </View>
        </View>

        {/* Page Numbers */}
        <Text
          style={tw("absolute bottom-5 right-10 text-[8px] text-gray-400")}
          render={({ pageNumber, totalPages }) =>
            `Page ${pageNumber} of ${totalPages}`
          }
          fixed
        />
      </Page>
    </Document>
  )
}
