// resources/js/components/features/customer-profile/recent-order-print.tsx

import { pdf } from "@react-pdf/renderer"
import { Download, Loader2, Printer } from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"
import toast from "react-hot-toast"
import { Button } from "@/components/ui/common/button"
import { APP_ASSETS } from "@/config/assets"
import { pdfImageResizer } from "@/lib/pdf-image-resizer"
import { DetailedCustomer, User } from "@/types"
import { RecentOrderDocument } from "./recent-order-payment-document"
import { RecentOrder } from "./recent-orders"

interface RecentOrderPrintProps {
  order: RecentOrder
  customer: DetailedCustomer
  user?: User
  isVatEnabled?: boolean
}

export const RecentOrderPrint = ({
  order,
  customer,
  user,
  isVatEnabled = false,
}: RecentOrderPrintProps) => {
  const [url, setUrl] = useState<string | null>(null)
  const [status, setStatus] = useState<
    "idle" | "generating" | "ready" | "error"
  >("idle")
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [optimizedLogo, setOptimizedLogo] = useState<string | null>(null)
  const [optimizedSignature, setOptimizedSignature] = useState<string | null>(
    null,
  )

  useEffect(() => {
    let active = true
    const loadAssets = async () => {
      if (!optimizedLogo && APP_ASSETS.COMPANY_LOGO_PNG) {
        const logoData = await pdfImageResizer(APP_ASSETS.COMPANY_LOGO_PNG)
        if (active) setOptimizedLogo(logoData)
      }

      const signatureUrl = user?.user_signature

      if (!optimizedSignature && signatureUrl) {
        try {
          const signatureData = await pdfImageResizer(signatureUrl)
          if (active) setOptimizedSignature(signatureData)
        } catch (e) {
          console.error("Failed to load signature", e)
          toast.error("Failed to load signature")
        }
      }
    }
    loadAssets()
    return () => {
      active = false
    }
  }, [user, optimizedLogo, optimizedSignature])

  const documentComponent = useMemo(
    () => (
      <RecentOrderDocument
        data={order}
        customer={customer}
        logo={optimizedLogo}
        signature={optimizedSignature}
        isVatEnabled={isVatEnabled}
      />
    ),
    [order, customer, optimizedLogo, optimizedSignature, isVatEnabled],
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
      }
    }

    timer = setTimeout(() => {
      generatePdf()
    }, 500)

    return () => {
      isMounted = false
      clearTimeout(timer)
    }
  }, [documentComponent, optimizedLogo, optimizedSignature])

  const handlePrint = () => {
    iframeRef.current?.contentWindow?.print()
  }

  const handleDownload = () => {
    if (!url) return
    const link = document.createElement("a")
    link.href = url
    link.download = `sales-invoice-${order.order_number || "preview"}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const renderSalesInvoiceDocument = () => {
    if (status === "idle" || status === "generating") {
      return (
        <div className="flex h-[60vh] w-full flex-col items-center justify-center gap-3 bg-slate-50 rounded-md border border-dashed">
          <Loader2 className="h-8 w-8 animate-spin text-primary/60" />
          <div className="flex flex-col items-center text-xs text-muted-foreground">
            <span className="font-medium">Preparing Invoice...</span>
            <span>Optimizing assets & generating PDF</span>
          </div>
        </div>
      )
    }

    if (status === "error") {
      return (
        <div className="flex h-[60vh] w-full items-center justify-center text-destructive bg-red-50 rounded-md border border-red-200">
          <p>Failed to load invoice. Please try again.</p>
        </div>
      )
    }

    return (
      <iframe
        ref={iframeRef}
        src={url || ""}
        className="h-[60vh] w-full border-0 rounded-md bg-white shadow-sm"
        title="Sales Invoice Preview"
      />
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6">
      {renderSalesInvoiceDocument()}

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
          variant={"bridge_digital"}
        >
          <Printer className="h-4 w-4" />
          Print Sales Invoice
        </Button>
      </div>
    </div>
  )
}
