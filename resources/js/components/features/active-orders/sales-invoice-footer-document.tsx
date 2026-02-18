import { Image, Text, View } from "@react-pdf/renderer"
import { tw } from "@/lib/tw"

interface SalesInvoiceFooterDocumentProps {
  signature?: string | null
}

export const SalesInvoiceFooterDocument = ({
  signature,
}: SalesInvoiceFooterDocumentProps) => {
  return (
    <View style={tw("mt-5 flex flex-col justify-end")}>
      <View style={tw("flex flex-row justify-start")}>
        <View style={tw("w-48 flex flex-col items-center")}>
          <View
            style={tw("relative w-full h-16 flex items-center justify-end")}
          >
            {signature && (
              <Image
                src={signature}
                style={tw("w-24 h-12 absolute bottom-0")}
              />
            )}
            <View style={tw("w-full border-b border-gray-400 mb-1")} />
          </View>
          <Text style={tw("text-[9px] text-gray-700")}>
            Authorized Signature
          </Text>
        </View>
      </View>
    </View>
  )
}
