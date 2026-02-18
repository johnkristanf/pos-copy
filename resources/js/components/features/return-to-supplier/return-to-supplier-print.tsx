import { pdf } from "@react-pdf/renderer"
import { Download, Printer, Loader2 } from "lucide-react"
import { useEffect, useState, useRef, useMemo } from "react"
import { Button } from "@/components/ui/common/button"
import { APP_ASSETS } from "@/config/assets"
import { pdfImageResizer } from "@/lib/pdf-image-resizer"
import { ReturnToSupplierDocument } from "./return-to-supplier-document"
import { ReturnToSupplier } from "@/types"
import toast from "react-hot-toast"

export const ReturnToSupplierPrint = ({
  returnItem,
}: {
  returnItem: ReturnToSupplier
}) => {
  const [url, setUrl] = useState<string | null>(null)
  const [status, setStatus] = useState<"generating" | "ready" | "error">(
    "generating",
  )
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [optimizedLogo, setOptimizedLogo] = useState<string | null>(null)

  useEffect(() => {
    pdfImageResizer(APP_ASSETS.COMPANY_LOGO_PNG)
      .then(setOptimizedLogo)
      .catch(console.error)
  }, [])

  const doc = useMemo(
    () => (
      <ReturnToSupplierDocument returnItem={returnItem} logo={optimizedLogo} />
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

  if (status === "generating") {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-2">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Generating Document...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="relative flex-1 bg-muted/30 rounded-xl border overflow-hidden">
        <iframe
          ref={iframeRef}
          src={url || ""}
          title={`Return to Supplier Preview - ${returnItem.supplier?.name}`}
          className="h-[65vh] w-full border-0"
        />
      </div>
      <div className="flex flex-col sm:flex-row gap-2">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => {
            const link = document.createElement("a")
            link.href = url!
            link.download = `Return-Supplier-${returnItem.supplier?.name?.replace(/\s+/g, "-")}.pdf`
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
          <Printer className="mr-2 size-4" /> Print Document
        </Button>
      </div>
    </div>
  )
}
