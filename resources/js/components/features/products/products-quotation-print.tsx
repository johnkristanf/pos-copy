import { pdf } from "@react-pdf/renderer"
import { AlertCircle, Download, Loader2, Printer } from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"
import toast from "react-hot-toast"
import { Button } from "@/components/ui/common/button"
import { APP_ASSETS } from "@/config/assets"
import { pdfImageResizer } from "@/lib/pdf-image-resizer"
import { ProductQuotationDocument } from "./products-quotation-document"
import { QuotationItem } from "./use-quotation-store"

interface ProductQuotationExportProps {
  items: QuotationItem[]
  logo?: string | null
}

export const ProductQuotationPrint = ({
  items,
  logo,
}: ProductQuotationExportProps) => {
  const [url, setUrl] = useState<string | null>(null)
  const [status, setStatus] = useState<
    "idle" | "generating" | "ready" | "error"
  >("idle")
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [optimizedLogo, setOptimizedLogo] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    const loadLogo = async () => {
      if (!optimizedLogo && (logo || APP_ASSETS.COMPANY_LOGO_PNG)) {
        try {
          const logoData = await pdfImageResizer(
            logo || APP_ASSETS.COMPANY_LOGO_PNG,
          )
          if (active) setOptimizedLogo(logoData)
        } catch (e) {
          console.error("Failed to load logo", e)
        }
      }
    }
    loadLogo()
    return () => {
      active = false
    }
  }, [logo, optimizedLogo])

  const documentComponent = useMemo(
    () => <ProductQuotationDocument items={items} logo={optimizedLogo} />,
    [items, optimizedLogo],
  )

  useEffect(() => {
    return () => {
      if (url) URL.revokeObjectURL(url)
    }
  }, [url])

  useEffect(() => {
    if (optimizedLogo === undefined) return

    let isMounted = true
    let timer: NodeJS.Timeout

    const generatePdf = async () => {
      try {
        if (isMounted) setStatus("generating")
        const blob = await pdf(documentComponent).toBlob()
        if (isMounted) {
          const blobUrl = URL.createObjectURL(blob)
          setUrl(blobUrl)
          setStatus("ready")
        }
      } catch (error) {
        console.error("PDF Generation failed:", error)
        if (isMounted) setStatus("error")
        toast.error("Failed to generate PDF export")
      }
    }

    timer = setTimeout(() => {
      generatePdf()
    }, 500)

    return () => {
      isMounted = false
      clearTimeout(timer)
    }
  }, [documentComponent, optimizedLogo])

  const handleDownload = () => {
    if (!url) return
    const link = document.createElement("a")
    link.href = url
    link.download = `Product-Quotation-${new Date().toISOString().split("T")[0]}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success("PDF downloaded successfully")
  }

  const handlePrint = () => {
    iframeRef.current?.contentWindow?.print()
  }

  if (status === "idle" || status === "generating") {
    return (
      <div className="flex h-[75vh] w-full flex-col items-center justify-center gap-4 bg-muted/20 rounded-xl border-2 border-dashed border-muted">
        <div className="relative flex items-center justify-center p-4 bg-background shadow-sm rounded-full">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
        <div className="flex flex-col items-center text-center space-y-1">
          <span className="text-sm font-semibold text-foreground">
            Preparing Quotation Document
          </span>
          <span className="text-xs text-muted-foreground max-w-50">
            Formatting {items.length} item{items.length !== 1 && "s"} into a
            PDF...
          </span>
        </div>
      </div>
    )
  }

  if (status === "error") {
    return (
      <div className="flex h-[75vh] w-full flex-col items-center justify-center text-destructive bg-destructive/5 rounded-xl border border-destructive/20 p-6">
        <AlertCircle className="h-10 w-10 mb-3 text-destructive" />
        <p className="font-semibold mb-1">Failed to generate preview</p>
        <p className="text-sm text-destructive/80 mb-6 text-center">
          There was an issue rendering the quotation document.
        </p>
        <Button variant="outline" onClick={() => setStatus("idle")}>
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="w-full flex flex-col gap-4 h-full">
      <div className="relative flex-1 bg-muted/30 rounded-xl border border-border/50 overflow-hidden shadow-sm">
        <iframe
          ref={iframeRef}
          src={url || ""}
          className="h-[75vh] w-full border-0 bg-transparent"
          title="Product Quotation Preview"
        />
      </div>

      <div className="flex flex-col sm:flex-row w-full gap-3 pt-2">
        <Button
          variant="outline"
          className="flex-1 gap-2 h-11 font-medium transition-all hover:bg-muted"
          onClick={handleDownload}
        >
          <Download className="h-4 w-4 text-muted-foreground" />
          Download PDF
        </Button>

        <Button
          className="flex-1 gap-2 h-11 font-medium shadow-md transition-all active:scale-[0.98]"
          onClick={handlePrint}
          variant="bridge_digital"
        >
          <Printer className="h-4 w-4" />
          Print Quotation
        </Button>
      </div>
    </div>
  )
}
