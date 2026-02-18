import { pdf } from "@react-pdf/renderer"
import { AlertCircle, Download, Loader2, Printer } from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"
import { Button } from "@/components/ui/common/button"
import { APP_ASSETS } from "@/config/assets"
import { pdfImageResizer } from "@/lib/pdf-image-resizer"
import { FastMovingItem, ProfitableItem, SlowMovingItem } from "@/types"
import { PriceReportPdfDocument } from "./price-report-document"

interface PriceReportPrintProps {
  startDate?: string | null
  endDate?: string | null
  profitableItems?: ProfitableItem[]
  fastMovingItems?: FastMovingItem[]
  slowMovingItems?: SlowMovingItem[]
}

export const PriceReportPrint = ({
  startDate,
  endDate,
  profitableItems = [],
  fastMovingItems = [],
  slowMovingItems = [],
}: PriceReportPrintProps) => {
  const [url, setUrl] = useState<string | null>(null)
  const [status, setStatus] = useState<
    "idle" | "generating" | "ready" | "error"
  >("idle")

  const [errorMessage, setErrorMessage] = useState<string>("")

  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [optimizedLogo, setOptimizedLogo] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    const loadAssets = async () => {
      if (APP_ASSETS.COMPANY_LOGO_PNG && !optimizedLogo) {
        try {
          const logoData = await pdfImageResizer(APP_ASSETS.COMPANY_LOGO_PNG)
          if (active) setOptimizedLogo(logoData)
        } catch (e) {
          console.error("Logo Error", e)
          if (active) setOptimizedLogo("")
        }
      } else if (!APP_ASSETS.COMPANY_LOGO_PNG && !optimizedLogo) {
        if (active) setOptimizedLogo("")
      }
    }
    loadAssets()
    return () => {
      active = false
    }
  }, [optimizedLogo])

  const documentComponent = useMemo(
    () => (
      <PriceReportPdfDocument
        startDate={startDate}
        endDate={endDate}
        profitableItems={profitableItems}
        fastMovingItems={fastMovingItems}
        slowMovingItems={slowMovingItems}
        logo={optimizedLogo}
      />
    ),
    [
      startDate,
      endDate,
      profitableItems,
      fastMovingItems,
      slowMovingItems,
      optimizedLogo,
    ],
  )

  useEffect(() => {
    if (optimizedLogo === null) return
    let isMounted = true
    let timer: NodeJS.Timeout

    const generatePdf = async () => {
      try {
        if (isMounted) {
          setStatus("generating")
          setErrorMessage("")
        }

        const blob = await pdf(documentComponent).toBlob()

        if (isMounted) {
          if (url) URL.revokeObjectURL(url)
          const blobUrl = URL.createObjectURL(blob)
          setUrl(blobUrl)
          setStatus("ready")
        }
      } catch (error) {
        const msg =
          error instanceof Error ? error.message : "Unknown error occurred"
        if (isMounted) {
          setErrorMessage(msg)
          setStatus("error")
        }
      }
    }

    timer = setTimeout(generatePdf, 500)

    return () => {
      isMounted = false
      clearTimeout(timer)
    }
  }, [documentComponent, optimizedLogo])

  const handlePrint = () => iframeRef.current?.contentWindow?.print()

  const handleDownload = () => {
    if (!url) return
    const link = document.createElement("a")
    link.href = url
    link.download = `price-report-${startDate || "all-time"}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const renderContent = () => {
    if (status === "idle" || status === "generating") {
      return (
        <div className="flex h-[60vh] w-full flex-col items-center justify-center gap-3 bg-slate-50 rounded-md border border-dashed">
          <Loader2 className="h-8 w-8 animate-spin text-primary/60" />
          <div className="flex flex-col items-center text-xs text-muted-foreground">
            <span className="font-medium">Preparing Report...</span>
            <span>Processing data...</span>
          </div>
        </div>
      )
    }

    if (status === "error") {
      return (
        <div className="flex flex-col h-[60vh] w-full items-center justify-center text-destructive bg-red-50 rounded-md border border-red-200 p-6 gap-2">
          <AlertCircle className="h-8 w-8" />
          <p className="font-medium">Failed to generate PDF</p>
          <code className="text-xs bg-red-100 p-2 rounded max-w-full break-all">
            {errorMessage || "Check data integrity"}
          </code>
        </div>
      )
    }

    return (
      <iframe
        ref={iframeRef}
        src={url || ""}
        className="h-[60vh] w-full border-0 rounded-md bg-white shadow-sm"
        title="Price Report Preview"
      />
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6">
      {renderContent()}

      <div className="flex flex-col sm:flex-row w-full gap-3">
        <Button
          variant="outline"
          className="flex-1 gap-2"
          onClick={handleDownload}
          disabled={status !== "ready"}
        >
          <Download className="h-4 w-4" />
          Download PDF
        </Button>

        <Button
          className="flex-1 gap-2"
          onClick={handlePrint}
          disabled={status !== "ready"}
          variant="default"
        >
          <Printer className="h-4 w-4" />
          Print Price Report
        </Button>
      </div>
    </div>
  )
}
