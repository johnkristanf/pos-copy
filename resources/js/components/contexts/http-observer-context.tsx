import {
  Activity,
  ArrowRight,
  CheckCircle2,
  Clock,
  Globe,
  Search,
  Trash2,
  X,
  XCircle,
} from "lucide-react"
import { useMemo, useState } from "react"
import { createPortal } from "react-dom"
import { useRequestObserver } from "@/hooks/api/request-observer"
import { cn } from "@/lib/cn"
import { requestObserver } from "@/lib/http-observer-service"

export const HttpRequestsObserver = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null)
  const logs = useRequestObserver((state) => state.logs)

  const selectedLog = useMemo(
    () => logs.find((l) => l.id === selectedLogId),
    [logs, selectedLogId],
  )

  const pendingCount = logs.filter((l) => !l.duration).length

  if (process.env.NODE_ENV === "production") return null

  return createPortal(
    <div className="fixed bottom-6 right-6 z-9999 font-sans antialiased text-slate-200">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "relative flex h-12 w-12 items-center justify-center rounded-full border shadow-2xl transition-all duration-300 ease-out hover:scale-105 active:scale-95",
          isOpen
            ? "bg-zinc-950 border-zinc-800 text-white"
            : "bg-black border-white/10 text-white hover:border-white/20",
        )}
      >
        {isOpen ? <X size={20} /> : <Activity size={20} />}
        {pendingCount > 0 && !isOpen && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 animate-pulse items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white ring-2 ring-black">
            {pendingCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute bottom-16 right-0 flex h-150 w-200 flex-col overflow-hidden rounded-xl border border-white/10 bg-[#09090b] shadow-[0_0_50px_-12px_rgba(0,0,0,0.8)] animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="flex items-center justify-between border-b border-white/10 bg-zinc-900/50 px-4 py-3 backdrop-blur-xl">
            <div className="flex items-center gap-2">
              <Activity size={16} className="text-zinc-400" />
              <h3 className="text-sm font-medium text-zinc-100">
                Network Observer
              </h3>
              <span className="ml-2 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-zinc-400">
                {logs.length} requests
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                requestObserver.clear()
                setSelectedLogId(null)
              }}
              className="group flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-zinc-400 transition-colors hover:bg-white/5 hover:text-white"
            >
              <Trash2 size={12} />
              <span>Clear</span>
            </button>
          </div>

          <div className="flex flex-1 overflow-hidden">
            <div className="w-[320px] flex flex-col border-r border-white/10 bg-black/50">
              {logs.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center gap-3 text-zinc-500">
                  <div className="rounded-full bg-white/5 p-3">
                    <Search size={16} className="opacity-50" />
                  </div>
                  <span className="text-xs">No requests recorded</span>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                  {logs.map((log) => (
                    <button
                      type="button"
                      key={log.id}
                      onClick={() => setSelectedLogId(log.id)}
                      className={cn(
                        "group flex w-full flex-col gap-1.5 border-b border-white/5 p-3 text-left text-xs transition-all hover:bg-white/2",
                        selectedLogId === log.id && "bg-white/6",
                      )}
                    >
                      <div className="flex w-full items-center justify-between">
                        <MethodBadge method={log.method} />
                        <span
                          className={cn(
                            "font-mono text-[10px]",
                            !log.duration
                              ? "text-amber-500 animate-pulse"
                              : "text-zinc-500",
                          )}
                        >
                          {log.duration ? `${log.duration}ms` : "Pending"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className="truncate font-medium text-zinc-300 w-full"
                          title={log.url}
                        >
                          {log.url.replace(/^https?:\/\/[^/]+/, "")}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <StatusBadge status={log.status} />
                        <span className="text-[10px] text-zinc-600 uppercase tracking-wider">
                          {log.type}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto bg-[#0c0c0e] p-0">
              {selectedLog ? (
                <div className="space-y-6 p-6">
                  <div className="space-y-3">
                    <h4 className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                      <Globe size={12} /> Request Details
                    </h4>
                    <div className="grid grid-cols-1 gap-px bg-white/10 rounded-lg border border-white/10 overflow-hidden">
                      <DetailRow
                        label="URL"
                        value={selectedLog.url}
                        fullWidth
                      />
                      <div className="grid grid-cols-2 gap-px bg-white/10">
                        <DetailRow
                          label="Method"
                          value={
                            <span className="font-bold text-zinc-200">
                              {selectedLog.method}
                            </span>
                          }
                        />
                        <DetailRow
                          label="Status"
                          value={
                            <span
                              className={cn(
                                "font-mono",
                                selectedLog.status && selectedLog.status >= 400
                                  ? "text-red-400"
                                  : "text-green-400",
                              )}
                            >
                              {selectedLog.status || "Pending..."}
                            </span>
                          }
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-px bg-white/10">
                        <DetailRow
                          label="Duration"
                          value={`${selectedLog.duration || 0}ms`}
                        />
                        <DetailRow
                          label="Timestamp"
                          value={new Date().toLocaleTimeString()}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                      <ArrowRight size={12} /> Payload
                    </h4>
                    <JsonViewer data={selectedLog.payload} />
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                      <CheckCircle2 size={12} /> Response Body
                    </h4>
                    <JsonViewer data={selectedLog.response} />
                  </div>
                </div>
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-2 text-zinc-600">
                  <Activity size={32} className="opacity-20" />
                  <span className="text-sm">
                    Select a request to inspect details
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>,
    document.body,
  )
}

function DetailRow({
  label,
  value,
  fullWidth = false,
}: {
  label: string
  value: React.ReactNode
  fullWidth?: boolean
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1 bg-[#09090b] p-3",
        fullWidth ? "col-span-2" : "col-span-1",
      )}
    >
      <span className="text-[10px] text-zinc-500 font-medium uppercase">
        {label}
      </span>
      <span className="text-xs text-zinc-300 font-mono break-all">{value}</span>
    </div>
  )
}

function JsonViewer({ data }: { data: unknown }) {
  if (
    data === undefined ||
    data === null ||
    (typeof data === "object" && Object.keys(data as object).length === 0)
  ) {
    return (
      <div className="rounded-md border border-dashed border-white/10 bg-white/2 p-4 text-center text-xs text-zinc-600">
        No content
      </div>
    )
  }
  return (
    <div className="relative overflow-hidden rounded-md border border-white/10 bg-black">
      <div className="absolute top-0 right-0 p-2 opacity-0 transition-opacity hover:opacity-100">
        <span className="text-[10px] text-zinc-600">JSON</span>
      </div>
      <div className="overflow-x-auto p-3 custom-scrollbar">
        <pre className="text-[11px] leading-relaxed font-mono text-[#00ff41]">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </div>
  )
}

function MethodBadge({ method }: { method: string }) {
  const styles: Record<string, string> = {
    GET: "text-blue-400 bg-blue-400/10 border-blue-400/20",
    POST: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
    PUT: "text-orange-400 bg-orange-400/10 border-orange-400/20",
    DELETE: "text-red-400 bg-red-400/10 border-red-400/20",
    PATCH: "text-purple-400 bg-purple-400/10 border-purple-400/20",
  }

  const defaultStyle = "text-zinc-400 bg-zinc-400/10 border-zinc-400/20"

  return (
    <span
      className={cn(
        "rounded-lg border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider",
        styles[method] || defaultStyle,
      )}
    >
      {method}
    </span>
  )
}

function StatusBadge({ status }: { status?: number }) {
  if (!status)
    return (
      <span className="flex items-center gap-1 text-[10px] text-zinc-500">
        <Clock size={10} />
        <span>Pending</span>
      </span>
    )

  const isError = status >= 400
  const ColorIcon = isError ? XCircle : CheckCircle2

  return (
    <span
      className={cn(
        "flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium border",
        isError
          ? "bg-red-500/10 text-red-400 border-red-500/20"
          : "bg-green-500/10 text-green-400 border-green-500/20",
      )}
    >
      <ColorIcon size={10} />
      {status}
    </span>
  )
}
