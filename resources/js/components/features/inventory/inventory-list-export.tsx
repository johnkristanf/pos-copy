import { Document, Font, Page, pdf, Text, View } from "@react-pdf/renderer"
import { Download, Loader2, Printer } from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"
import toast from "react-hot-toast"
import { Button } from "@/components/ui/common/button"
import { USIDocsHeader } from "@/components/ui/common/usi-docs-header"
import { APP_ASSETS } from "@/config/assets"
import { pdfImageResizer } from "@/lib/pdf-image-resizer"
import { tw } from "@/lib/tw"
import { InventoryItem } from "@/types"

Font.register({
  family: "Helvetica",
  fonts: [{ src: "Helvetica" }, { src: "Helvetica-Bold", fontWeight: "bold" }],
})

interface InventoryDocumentProps {
  items: InventoryItem[]
  logo?: string | null
}

const InventoryDocument = ({ items, logo }: InventoryDocumentProps) => {
  return (
    <Document>
      <Page
        size="LETTER"
        orientation="landscape"
        style={tw("flex flex-col bg-white p-10 text-[9px]")}
      >
        <USIDocsHeader logo={logo} title="INVENTORY REPORT" />

        {/* Table Header */}
        <View
          style={tw(
            "flex-row border border-gray-300 bg-gray-100 text-gray-700",
          )}
        >
          <View style={tw("w-[10%] border-r border-gray-300 p-2")}>
            <Text style={tw("text-[8px] font-bold")}>SKU</Text>
          </View>
          <View style={tw("w-[20%] border-r border-gray-300 p-2")}>
            <Text style={tw("text-[8px] font-bold")}>Item Description</Text>
          </View>
          <View style={tw("w-[14%] border-r border-gray-300 p-2")}>
            <Text style={tw("text-[8px] text-center font-bold")}>
              Attributes
            </Text>
          </View>
          <View style={tw("w-[9%] border-r border-gray-300 p-2")}>
            <Text style={tw("text-[8px] text-center font-bold")}>Brand</Text>
          </View>
          <View style={tw("w-[8%] border-r border-gray-300 p-2")}>
            <Text style={tw("text-[8px] text-center font-bold")}>Category</Text>
          </View>
          <View style={tw("w-[16%] border-r border-gray-300 p-2")}>
            <Text style={tw("text-[8px] text-center font-bold")}>
              Stock Levels
            </Text>
          </View>
          <View style={tw("w-[23%] p-2")}>
            <Text style={tw("text-[8px] text-center font-bold")}>Supplier</Text>
          </View>
        </View>

        {/* Table Rows */}
        {items.map((item) => (
          <View
            key={item.id}
            style={tw("flex-row border-b border-l border-r border-gray-300")}
          >
            <View style={tw("w-[10%] border-r border-gray-300 gap-2 p-2")}>
              {item.sku && <Text style={tw("text-gray-500")}> {item.sku}</Text>}
            </View>
            <View style={tw("w-[20%] border-r border-gray-300 gap-2 p-2")}>
              <Text style={tw("text-[8px]")}>{item.description}</Text>
            </View>
            <View style={tw("w-[14%] border-r border-gray-300 p-2")}>
              <Text style={tw("text-[8px] text-center")}>
                {[item.size, item.color].filter(Boolean).join(", ") || "—"}
              </Text>
            </View>
            <View style={tw("w-[9%] border-r border-gray-300 p-2")}>
              <Text style={tw("text-[8px] text-center")}>
                {item.brand || "—"}
              </Text>
            </View>
            <View style={tw("w-[8%] border-r border-gray-300 p-2")}>
              <Text style={tw("text-[8px] text-center")}>
                {item.category?.name || "Unknown"}
              </Text>
            </View>
            <View style={tw("w-[16%] border-r border-gray-300 p-2")}>
              <View style={tw("flex-col gap-1")}>
                {(() => {
                  const stocks = item.stocks || []
                  const storeStock = stocks
                    .filter(
                      (s) =>
                        s.location?.tag === "store" ||
                        s.location?.name?.toLowerCase().includes("store"),
                    )
                    .reduce(
                      (acc, s) => acc + (Number(s.available_quantity) || 0),
                      0,
                    )

                  const warehouseStock = stocks
                    .filter(
                      (s) =>
                        s.location?.tag === "warehouse" ||
                        s.location?.name?.toLowerCase().includes("warehouse"),
                    )
                    .reduce(
                      (acc, s) => acc + (Number(s.available_quantity) || 0),
                      0,
                    )

                  return (
                    <>
                      <View style={tw("flex-col justify-between")}>
                        <Text style={tw("text-[8px]")}>
                          <Text style={tw("text-neutral-600")}>Store:</Text>{" "}
                          {storeStock}{" "}
                          {item?.conversion_units?.[0]?.purchase_uom?.name ||
                            ""}
                        </Text>
                        <Text style={tw("text-[8px]")}>
                          <Text style={tw("text-neutral-600")}>Wrhs:</Text>{" "}
                          {warehouseStock}{" "}
                          {item?.conversion_units?.[0]?.purchase_uom?.name ||
                            ""}
                        </Text>
                      </View>
                    </>
                  )
                })()}
              </View>
            </View>
            <View style={tw("w-[23%] p-2")}>
              <Text style={tw("text-[8px] text-center")}>
                {item.supplier?.name || "Unknown"}
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

interface InventoryExportProps {
  items: InventoryItem[]
  logo?: string | null
}

export const InventoryExport = ({ items, logo }: InventoryExportProps) => {
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
    () => <InventoryDocument items={items} logo={optimizedLogo} />,
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
    link.download = `inventory-report-${new Date().toISOString().split("T")[0]}.pdf`
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
      <div className="flex h-[70vh] w-full flex-col items-center justify-center gap-3 bg-slate-50 rounded-md border border-dashed">
        <Loader2 className="h-8 w-8 animate-spin text-primary/60" />
        <div className="flex flex-col items-center text-xs text-muted-foreground">
          <span className="font-medium">Generating Inventory Report...</span>
          <span>Processing {items.length} items</span>
        </div>
      </div>
    )
  }

  if (status === "error") {
    return (
      <div className="flex h-[70vh] w-full items-center justify-center text-destructive bg-red-50 rounded-md border border-red-200">
        <div className="text-center">
          <p className="font-medium mb-2">
            Failed to generate inventory report
          </p>
          <p className="text-sm">Please try again or contact support</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-6">
      <iframe
        ref={iframeRef}
        src={url || ""}
        className="h-[70vh] w-full border-0 rounded-md bg-white shadow-sm"
        title="Inventory Report Export Preview"
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
