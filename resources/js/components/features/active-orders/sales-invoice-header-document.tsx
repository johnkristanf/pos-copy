import { Image, Text, View } from "@react-pdf/renderer"
import { APP_ASSETS } from "@/config/assets"
import { tw } from "@/lib/tw"

interface SalesInvoiceHeaderDocumentProps {
  logo?: string | null
}

export const SalesInvoiceHeaderDocument = ({
  logo,
}: SalesInvoiceHeaderDocumentProps) => {
  return (
    <View style={tw("mb-3 flex flex-col")}>
      <View style={tw("flex flex-row items-start w-full mb-2")}>
        {logo && (
          <View style={tw("mr-4")}>
            <Image src={logo} style={tw("h-20 w-25")} />
          </View>
        )}
        <View style={tw("flex-1 flex flex-col")}>
          <Text style={tw("text-3xl text-black")}>INDUSTRIAL SUPPLY</Text>
          <View style={tw("flex flex-col")}>
            <Text style={tw("text-gray-700 text-[10px] -mt-7")}>
              {APP_ASSETS.COMPANY_LOCATION}
            </Text>
            <Text style={tw("text-gray-600 text-[9px]")}>
              Owned By: {APP_ASSETS.COMPANY_NAME}
            </Text>
            <Text style={tw("text-gray-600 text-[9px]")}>
              VAT REG TIN: {APP_ASSETS.COMPANY_VAT}
            </Text>
          </View>
        </View>
      </View>

      <View style={tw("w-full border-b border-gray-300 mb-2")} />

      <View
        style={tw("flex flex-col items-center justify-center w-full -mb-5")}
      >
        <Text
          style={tw("text-2xl text-black text-center items-center text-bold")}
        >
          SALES INVOICE
        </Text>
      </View>
    </View>
  )
}
