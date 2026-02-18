import { Text, View } from "@react-pdf/renderer"
import { tw } from "@/lib/tw"
import { SalesInvoicePdfTableRow } from "@/types"

interface SalesInvoiceBodyDocumentProps {
  customerName: string
  address: string
  tin: string
  date: string
  paymentMethods: { label: string; checked: boolean }[]
  tableRows: SalesInvoicePdfTableRow[]
  totalAmount: string
  vatAmount: string
  netOfVat: string
}

export const SalesInvoiceBodyDocument = ({
  customerName,
  address,
  tin,
  date,
  paymentMethods,
  tableRows,
  totalAmount,
}: SalesInvoiceBodyDocumentProps) => {
  return (
    <>
      <View style={tw("mb-4 flex flex-row")}>
        <View style={tw("flex-1 flex flex-col bg-gray-50 p-4 mr-3")}>
          <View style={tw("flex flex-row items-center mb-2")}>
            <Text style={tw("text-gray-600 w-20 text-[9px]")}>Sold to:</Text>
            <Text style={tw("flex-1 text-[10px]")}>{customerName}</Text>
          </View>

          <View style={tw("flex flex-row items-center")}>
            <Text style={tw("text-gray-600 w-20 text-[9px]")}>Address:</Text>
            <Text style={tw("flex-1 text-[10px]")}>{address}</Text>
          </View>
        </View>

        <View style={tw("w-[30%] flex flex-col bg-gray-50 p-4")}>
          <View style={tw("flex flex-row items-center mb-2")}>
            <Text style={tw("text-gray-600 w-24 text-[9px]")}>Date:</Text>
            <Text style={tw("flex-1 text-[10px]")}>{date}</Text>
          </View>
          <View style={tw("flex flex-row items-center mb-3")}>
            <Text style={tw("text-gray-600 w-24 text-[9px]")}>TIN/SC-TIN:</Text>
            <Text style={tw("flex-1 text-[10px]")}>{tin}</Text>
          </View>
          <View style={tw("flex flex-row flex-wrap items-center")}>
            {paymentMethods.map((method, index) => (
              <View
                key={index}
                style={tw("flex flex-row items-center mr-3 mb-1")}
              >
                <View
                  style={tw(
                    `w-3 h-3 border border-gray-400 mr-1 ${
                      method.checked ? "bg-black" : "bg-white"
                    }`,
                  )}
                >
                  {method.checked && (
                    <Text style={tw("text-white text-[6px] text-center")}>
                      ✓
                    </Text>
                  )}
                </View>
                <Text style={tw("text-[9px]")}>{method.label}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      <View style={tw("border border-gray-300 flex flex-col min-h-[400px]")}>
        <View
          style={tw(
            "flex flex-row bg-gray-100 text-center text-[9px] text-gray-700",
          )}
        >
          <Text style={tw("w-[10%] border-r border-gray-300 py-2")}>Qty</Text>
          <Text style={tw("w-[10%] border-r border-gray-300 py-2")}>Unit</Text>
          <Text style={tw("w-[50%] border-r border-gray-300 py-2")}>
            Description
          </Text>
          <Text style={tw("w-[15%] border-r border-gray-300 py-2")}>
            Unit Price
          </Text>
          <Text style={tw("w-[15%] py-2")}>Amount</Text>
        </View>

        <View>
          {tableRows.map((item, index) => (
            <View
              key={index}
              style={tw("flex flex-row border-b border-gray-200 items-center")}
            >
              <Text
                style={tw(
                  "w-[10%] border-r border-gray-200 py-2 text-center text-[9px]",
                )}
              >
                {item.qty}
              </Text>
              <Text
                style={tw(
                  "w-[10%] border-r border-gray-200 py-2 text-center text-[9px]",
                )}
              >
                {item.unit}
              </Text>
              <Text
                style={tw(
                  "w-[50%] border-r border-gray-200 py-2 pl-3 text-left text-[9px]",
                )}
              >
                {item.description}
              </Text>
              <Text
                style={tw(
                  "w-[15%] border-r border-gray-200 py-2 pr-3 text-right text-[9px]",
                )}
              >
                {item.price}
              </Text>
              <Text style={tw("w-[15%] py-2 pr-3 text-right text-[9px]")}>
                {item.amount}
              </Text>
            </View>
          ))}
        </View>

        <View style={tw("border-t border-gray-300 flex flex-col mt-auto")}>
          <View style={tw("flex flex-row bg-gray-50")}>
            <View style={tw("w-[20%] border-r border-gray-200 p-2")}></View>
            <View style={tw("w-[65%] border-r border-gray-200 p-2 pr-3")}>
              <Text style={tw("text-right text-[10px]")}>TOTAL AMOUNT DUE</Text>
            </View>
            <View style={tw("w-[15%] p-2 pr-3")}>
              <Text style={tw("text-right text-[10px]")}>{totalAmount}</Text>
            </View>
          </View>
        </View>
      </View>
    </>
  )
}
