import { Document, Font, Page, pdf, Text, View } from "@react-pdf/renderer"
import { Download, Loader2, Printer } from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"
import toast from "react-hot-toast"
import { Button } from "@/components/ui/common/button"
import { USIDocsHeader } from "@/components/ui/common/usi-docs-header"
import { APP_ASSETS } from "@/config/assets"
import { pdfImageResizer } from "@/lib/pdf-image-resizer"
import { tw } from "@/lib/tw"
import { Voucher } from "@/types"

Font.register({
  family: "Helvetica",
  fonts: [{ src: "Helvetica" }, { src: "Helvetica-Bold", fontWeight: "bold" }],
})

const formatCurrency = (val: number | string) => {
  const num = typeof val === "string" ? parseFloat(val) : val
  if (Number.isNaN(num)) return "—"

  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(num)
}

const formatVoucherPdfValue = (amount: number, type: string) => {
  if (type === "percentage") return `${amount}%`
  if (type === "complimentary") return "FREE"
  return formatCurrency(amount)
}

interface VoucherListDocumentProps {
  vouchers: Voucher[]
  logo?: string | null
}

const VoucherListDocument = ({ vouchers, logo }: VoucherListDocumentProps) => {
  return (
    <Document>
      <Page
        size="LETTER"
        orientation="landscape"
        style={tw("flex flex-col bg-white p-10 text-[9px]")}
      >
        <USIDocsHeader logo={logo} title="VOUCHER MASTER LIST" />

        {/* Table Header */}
        <View
          style={tw(
            "flex-row border border-gray-300 bg-gray-100 text-gray-700",
          )}
        >
          <View style={tw("w-[15%] border-r border-gray-300 p-2")}>
            <Text style={tw("text-[8px] text-center font-bold")}>Code</Text>
          </View>
          <View style={tw("w-[25%] border-r border-gray-300 p-2")}>
            <Text style={tw("text-[8px] text-center font-bold")}>
              Description
            </Text>
          </View>
          <View style={tw("w-[15%] border-r border-gray-300 p-2")}>
            <Text style={tw("text-[8px] text-center font-bold")}>Type</Text>
          </View>
          <View style={tw("w-[15%] border-r border-gray-300 p-2")}>
            <Text style={tw("text-[8px] text-center font-bold")}>Value</Text>
          </View>
          <View style={tw("w-[15%] border-r border-gray-300 p-2")}>
            <Text style={tw("text-[8px] text-center font-bold")}>
              Min Spend
            </Text>
          </View>
          <View style={tw("w-[15%] p-2")}>
            <Text style={tw("text-[8px] text-center font-bold")}>
              Capped At
            </Text>
          </View>
        </View>

        {/* Table Rows */}
        {vouchers.map((voucher, _index) => (
          <View
            key={voucher.id}
            style={tw("flex-row border-b border-l border-r border-gray-300")}
          >
            <View style={tw("w-[15%] border-r border-gray-300 p-2")}>
              <Text style={tw("text-[8px] text-center font-bold uppercase")}>
                {voucher.code}
              </Text>
            </View>
            <View style={tw("w-[25%] border-r border-gray-300 p-2")}>
              <Text style={tw("text-[8px] text-gray-600")}>
                {voucher.description || "—"}
              </Text>
            </View>
            <View style={tw("w-[15%] border-r border-gray-300 p-2")}>
              <Text style={tw("text-[8px] text-center capitalize")}>
                {voucher.type.replace(/_/g, " ")}
              </Text>
            </View>
            <View style={tw("w-[15%] border-r border-gray-300 p-2")}>
              <Text style={tw("text-[8px] text-center font-bold")}>
                {formatVoucherPdfValue(voucher.amount, voucher.type)}
              </Text>
            </View>
            <View style={tw("w-[15%] border-r border-gray-300 p-2")}>
              <Text style={tw("text-[8px] text-center")}>
                {voucher.min_spend ? formatCurrency(voucher.min_spend) : "—"}
              </Text>
            </View>
            <View style={tw("w-[15%] p-2")}>
              <Text style={tw("text-[8px] text-center")}>
                {voucher.capped_amount
                  ? formatCurrency(voucher.capped_amount)
                  : "—"}
              </Text>
            </View>
          </View>
        ))}

        {/* Page Numbers */}
        <Text
          style={tw("absolute bottom-5 right-10 text-[8px] text-gray-600")}
          render={({ pageNumber, totalPages }) =>
            `Page ${pageNumber} of ${totalPages}`
          }
          fixed
        />
      </Page>
    </Document>
  )
}

interface VoucherListExportProps {
  vouchers: Voucher[]
  logo?: string | null
}

export const VoucherListExport = ({
  vouchers,
  logo,
}: VoucherListExportProps) => {
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
    () => <VoucherListDocument vouchers={vouchers} logo={optimizedLogo} />,
    [vouchers, optimizedLogo],
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
    link.download = `voucher-list-${new Date().toISOString().split("T")[0]}.pdf`
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
      <div className="flex h-[70vh] w-full flex-col items-center justify-center gap-3 rounded-md border border-dashed bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary/60" />
        <div className="flex flex-col items-center text-xs text-muted-foreground">
          <span className="font-medium">Generating Export...</span>
          <span>Processing {vouchers.length} vouchers</span>
        </div>
      </div>
    )
  }

  if (status === "error") {
    return (
      <div className="flex h-[70vh] w-full items-center justify-center rounded-md border border-red-200 bg-red-50 text-destructive">
        <div className="text-center">
          <p className="mb-2 font-medium">Failed to generate export</p>
          <p className="text-sm">Please try again or contact support</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <iframe
        ref={iframeRef}
        src={url || ""}
        className="h-[70vh] w-full rounded-md border-0 bg-white shadow-sm"
        title="Voucher List Export Preview"
      />

      <div className="flex w-full flex-col gap-3 sm:flex-row">
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
