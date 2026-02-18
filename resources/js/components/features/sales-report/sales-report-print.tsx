import { pdf } from "@react-pdf/renderer"
import { AlertCircle, Download, Loader2, Printer } from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"
import { Button } from "@/components/ui/common/button"
import { APP_ASSETS } from "@/config/assets"
import { pdfImageResizer } from "@/lib/pdf-image-resizer"
import {
  AffiliatedCustomer,
  ItemCategorySales,
  NonAffiliatedCustomer,
  TopCustomerSales,
  TotalSales,
} from "@/types"
import { SalesReportDocument } from "./sales-report-document"

interface SalesReportExportProps {
  totalSales: TotalSales
  itemCategorySales: ItemCategorySales[]
  topCustomerSales: TopCustomerSales[]
  affiliatedCustomers: AffiliatedCustomer[]
  nonAffiliatedCustomers: NonAffiliatedCustomer[]
  logo?: string | null
  dateRange?: string
}

export default function SalesReportPrint({
  totalSales,
  itemCategorySales,
  topCustomerSales,
  affiliatedCustomers,
  nonAffiliatedCustomers,
  logo,
  dateRange,
}: SalesReportExportProps) {
  const [url, setUrl] = useState<string | null>(null)
  const [status, setStatus] = useState<
    "idle" | "generating" | "ready" | "error"
  >("idle")
  const [errorMessage, setErrorMessage] = useState<string>("")
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [optimizedLogo, setOptimizedLogo] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    const loadLogo = async () => {
      const sourceLogo = logo || APP_ASSETS.COMPANY_LOGO_PNG

      if (sourceLogo && !optimizedLogo) {
        try {
          const logoData = await pdfImageResizer(sourceLogo)
          if (active) setOptimizedLogo(logoData)
        } catch (e) {
          console.error("Failed to load logo", e)
          if (active) setOptimizedLogo("")
        }
      } else if (!sourceLogo && !optimizedLogo) {
        if (active) setOptimizedLogo("")
      }
    }
    loadLogo()
    return () => {
      active = false
    }
  }, [logo, optimizedLogo])

  const documentComponent = useMemo(
    () => (
      <SalesReportDocument
        totalSales={totalSales}
        itemCategorySales={itemCategorySales}
        topCustomerSales={topCustomerSales}
        affiliatedCustomers={affiliatedCustomers}
        nonAffiliatedCustomers={nonAffiliatedCustomers}
        logo={optimizedLogo}
        dateRange={dateRange}
      />
    ),
    [
      totalSales,
      itemCategorySales,
      topCustomerSales,
      affiliatedCustomers,
      nonAffiliatedCustomers,
      optimizedLogo,
      dateRange,
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
        console.error("PDF Generation failed:", error)
        if (isMounted) {
          setStatus("error")
          setErrorMessage(
            error instanceof Error ? error.message : "Unknown error",
          )
        }
      }
    }

    timer = setTimeout(generatePdf, 500)

    return () => {
      isMounted = false
      clearTimeout(timer)
      if (url) URL.revokeObjectURL(url)
    }
  }, [documentComponent, optimizedLogo])

  const handleDownload = () => {
    if (!url) return
    const link = document.createElement("a")
    link.href = url
    link.download = `sales-report-${new Date().toISOString().split("T")[0]}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handlePrint = () => {
    iframeRef.current?.contentWindow?.print()
  }

  if (status === "idle" || status === "generating") {
    return (
      <div className="flex h-[70vh] w-full flex-col items-center justify-center gap-3 bg-slate-50 rounded-md border border-dashed">
        <Loader2 className="h-8 w-8 animate-spin text-primary/60" />
        <div className="flex flex-col items-center text-xs text-muted-foreground">
          <span className="font-medium">Generating Sales Report...</span>
          <span>Compiling all sales data</span>
        </div>
      </div>
    )
  }

  if (status === "error") {
    return (
      <div className="flex flex-col h-[70vh] w-full items-center justify-center text-destructive bg-red-50 rounded-md border border-red-200 p-6">
        <AlertCircle className="h-10 w-10 mb-2" />
        <p className="font-medium mb-1">Failed to generate report</p>
        <code className="text-xs bg-red-100 p-2 rounded max-w-[80%] text-center break-all">
          {errorMessage || "Check console for details"}
        </code>
      </div>
    )
  }

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-6">
      <iframe
        ref={iframeRef}
        src={url || ""}
        className="h-[70vh] w-full border-0 rounded-md bg-white shadow-sm"
        title="Sales Report Export Preview"
      />

      <div className="flex flex-col sm:flex-row w-full gap-3">
        <Button
          variant="outline"
          className="flex-1 gap-2"
          onClick={handleDownload}
        >
          <Download className="h-4 w-4" />
          Download PDF
        </Button>

        <Button
          className="flex-1 gap-2"
          onClick={handlePrint}
          variant="bridge_digital"
        >
          <Printer className="h-4 w-4" />
          Print Report
        </Button>
      </div>
    </div>
  )
}
