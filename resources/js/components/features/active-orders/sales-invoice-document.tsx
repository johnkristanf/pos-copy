import { Document, Font, Page } from "@react-pdf/renderer"
import { tw } from "@/lib/tw"
import { Order } from "@/types"
import { SalesInvoiceBodyDocument } from "./sales-invoice-body-document"
import { SalesInvoiceFooterDocument } from "./sales-invoice-footer-document"
import { SalesInvoiceHeaderDocument } from "./sales-invoice-header-document"

Font.register({
  family: "Helvetica",
  fonts: [{ src: "Helvetica" }, { src: "Helvetica-Bold", fontWeight: "bold" }],
})

interface SalesInvoiceDocumentProps {
  data: Order
  logo?: string | null
  signature?: string | null
  isVatEnabled?: boolean
}

export const SalesInvoiceDocument = ({
  data,
  logo,
  signature,
  isVatEnabled = false,
}: SalesInvoiceDocumentProps) => {
  const order = data || {}
  const rawItems = Array.isArray(order.order_items) ? order.order_items : []

  let subTotal = 0

  const paymentMethodName = order.payment_method?.name?.toLowerCase() || ""
  const paymentMethodTag = order.payment_method?.tag?.toLowerCase() || ""
  const isCreditPayment =
    paymentMethodTag === "credit" || paymentMethodName.includes("credit")

  const items = rawItems.map((item: any) => {
    const qty = Number(
      item.pivot?.quantity || item.serve_locations?.quantity_to_serve || 0,
    )
    const unit = item.selected_uom?.name || "pcs"
    const description = item.item?.description || "Item"

    let priceVal = 0

    if (item.pivot?.price) {
      priceVal = Number.parseFloat(item.pivot.price)
    } else if (item.item?.selling_prices) {
      const sellingPrices = item.item.selling_prices
      if (isCreditPayment) {
        priceVal = Number.parseFloat(sellingPrices.credit_price || "0")
      } else {
        priceVal = Number.parseFloat(sellingPrices.unit_price || "0")
      }
    }

    const amount = priceVal * qty
    subTotal += amount

    return {
      qty: qty.toString(),
      unit: unit,
      description: description,
      price: priceVal.toFixed(2),
      amount: amount.toFixed(2),
    }
  })

  const vatAmountVal = isVatEnabled ? subTotal * 0.12 : 0
  const totalPayableVal = subTotal + vatAmountVal

  const netOfVatVal = subTotal
  const totalAmount = totalPayableVal.toFixed(2)
  const netOfVat = netOfVatVal.toFixed(2)
  const vatAmount = vatAmountVal.toFixed(2)

  const customerName = order.customer?.name || "Cash Customer"

  const loc = order.customer?.locations
  const address = loc
    ? [loc.barangay, loc.municipality, loc.province, loc.region, loc.country]
        .filter(Boolean)
        .join(", ")
    : ""

  const tin = (order.customer as any)?.tin || ""

  const dateStr = order.created_at || new Date().toISOString()
  const date = new Date(dateStr).toLocaleDateString()

  const isCash =
    paymentMethodTag === "cash" || paymentMethodName.includes("cash")
  const isCheck = paymentMethodName.includes("check")
  const isCredit = isCreditPayment

  const paymentMethods = [
    { label: "Cash", checked: isCash },
    { label: "Check", checked: isCheck },
    { label: "Credit", checked: isCredit },
  ]

  if (!isCash && !isCheck && !isCredit && order.payment_method?.name) {
    paymentMethods.push({
      label: order.payment_method.name,
      checked: true,
    })
  }

  const tableRows = items

  return (
    <Document>
      <Page size="LETTER" style={tw("flex flex-col bg-white p-10 text-[10px]")}>
        <SalesInvoiceHeaderDocument logo={logo} />

        <SalesInvoiceBodyDocument
          customerName={customerName}
          address={address}
          tin={tin}
          date={date}
          paymentMethods={paymentMethods}
          tableRows={tableRows}
          totalAmount={totalAmount}
          vatAmount={vatAmount}
          netOfVat={netOfVat}
        />

        <SalesInvoiceFooterDocument signature={signature} />
      </Page>
    </Document>
  )
}
