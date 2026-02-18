import { pdf } from "@react-pdf/renderer"
import { Download, Printer, Loader2 } from "lucide-react"
import { useEffect, useState, useRef, useMemo } from "react"
import { Button } from "@/components/ui/common/button"
import { APP_ASSETS } from "@/config/assets"
import { pdfImageResizer } from "@/lib/pdf-image-resizer"
import { ReturnFromCustomerDocument } from "./return-from-customer-document"
import { ReturnFromCustomer } from "@/types"
import toast from "react-hot-toast"

export const ReturnFromCustomerPrint = ({
  returnItem,
}: {
  returnItem: ReturnFromCustomer
}) => {
  const [url, setUrl] = useState<string | null>(null)
  const [status, setStatus] = useState<"generating" | "ready" | "error">(
    "generating",
  )
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [optimizedLogo, setOptimizedLogo] = useState<string | null>(null)

  // Load Logo
  useEffect(() => {
    pdfImageResizer(APP_ASSETS.COMPANY_LOGO_PNG)
      .then(setOptimizedLogo)
      .catch(console.error)
  }, [])

  const doc = useMemo(
    () => (
      <ReturnFromCustomerDocument
        returnItem={returnItem}
        logo={optimizedLogo}
      />
    ),
    [returnItem, optimizedLogo],
  )

  useEffect(() => {
    const generate = async () => {
      try {
        const blob = await pdf(doc).toBlob()
        const blobUrl = URL.createObjectURL(blob)
        setUrl(blobUrl)
        setStatus("ready")
      } catch (e) {
        setStatus("error")
        toast.error("Failed to generate PDF")
      }
    }
    generate()
    return () => {
      if (url) URL.revokeObjectURL(url)
    }
  }, [doc])

  if (status === "generating")
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    )

  return (
    <div className="flex flex-col gap-4">
      <iframe
        ref={iframeRef}
        src={url || ""}
        title={`Return Slip Preview - ${returnItem.invoice_number}`}
        className="h-[60vh] w-full rounded-md border"
      />
      <div className="flex gap-2">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => {
            const link = document.createElement("a")
            link.href = url!
            link.download = `Return-${returnItem.invoice_number}.pdf`
            link.click()
          }}
        >
          <Download className="mr-2 size-4" /> Download
        </Button>
        <Button
          className="flex-1"
          variant="bridge_digital"
          onClick={() => iframeRef.current?.contentWindow?.print()}
        >
          <Printer className="mr-2 size-4" /> Print
        </Button>
      </div>
    </div>
  )
}
