import {
  AlertCircle,
  CheckCircle2,
  Database,
  Layers,
  Terminal,
} from "lucide-react"
import { match } from "ts-pattern"
import { cn } from "@/lib/cn"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../common/sheet"

const TypeBadge = ({ value }: { value: any }) => {
  let type = typeof value
  if (value === null) type = "object"
  else if (Array.isArray(value)) type = "object"

  const config = match(type)
    .with("string", () => ({
      label: "String",
      bg: "bg-emerald-500/10",
      text: "text-emerald-500",
      border: "border-emerald-500/20",
    }))
    .with("number", () => ({
      label: "Number",
      bg: "bg-blue-500/10",
      text: "text-blue-500",
      border: "border-blue-500/20",
    }))
    .with("boolean", () => ({
      label: "Bool",
      bg: "bg-amber-500/10",
      text: "text-amber-500",
      border: "border-amber-500/20",
    }))
    .with("object", () => ({
      label: "Object",
      bg: "bg-indigo-500/10",
      text: "text-indigo-500",
      border: "border-indigo-500/20",
    }))
    .when(
      () => Array.isArray(value),
      () => ({
        label: "Array",
        bg: "bg-purple-500/10",
        text: "text-purple-500",
        border: "border-purple-500/20",
      }),
    )
    .when(
      () => value === null,
      () => ({
        label: "Null",
        bg: "bg-slate-500/10",
        text: "text-slate-500",
        border: "border-slate-500/20",
      }),
    )
    .otherwise(() => ({
      label: type,
      bg: "bg-slate-500/10",
      text: "text-slate-500",
      border: "border-slate-500/20",
    }))

  return (
    <span
      className={cn(
        "ml-2 inline-flex select-none items-center rounded border px-1 py-px text-[9px] font-bold uppercase tracking-wider",
        config.bg,
        config.text,
        config.border,
      )}
    >
      {config.label}
    </span>
  )
}

const RecursiveJsonViewer = ({
  data,
  isLastItem = true,
}: {
  data: any
  isLastItem?: boolean
}) => {
  if (typeof data !== "object" || data === null) {
    const valueColor = match(typeof data)
      .with("string", () => "text-emerald-400")
      .with("number", () => "text-blue-400")
      .with("boolean", () => "text-amber-400")
      .otherwise(() => "text-slate-400")
    const displayValue = typeof data === "string" ? `"${data}"` : String(data)
    return (
      <div className="inline-flex items-center">
        <span className={cn("font-medium break-all", valueColor)}>
          {displayValue}
        </span>
        <TypeBadge value={data} />
        {!isLastItem && <span className="text-slate-600">,</span>}
      </div>
    )
  }
  const isArray = Array.isArray(data)
  const isEmpty = Object.keys(data).length === 0
  if (isEmpty) {
    return (
      <div className="inline-flex items-center">
        <span className="text-slate-500">{isArray ? "[]" : "{}"}</span>
        <TypeBadge value={data} />
        {!isLastItem && <span className="text-slate-600">,</span>}
      </div>
    )
  }
  return (
    <div className="inline-block w-full align-top">
      <span className="text-slate-600">{isArray ? "[" : "{"}</span>
      <div className="my-0.5 ml-1.5 border-l-2 border-slate-800/50 pl-4">
        {Object.entries(data).map(([key, value], index, arr) => {
          const isLast = index === arr.length - 1
          return (
            <div key={key} className="leading-6 hover:bg-slate-900/30">
              {!isArray && (
                <span className="mr-2 text-indigo-300">"{key}":</span>
              )}
              <RecursiveJsonViewer data={value} isLastItem={isLast} />
            </div>
          )
        })}
      </div>
      <span className="text-slate-600">{isArray ? "]" : "}"}</span>
      {!isLastItem && <span className="text-slate-600">,</span>}
    </div>
  )
}

export const FormDebugger = ({ form }: { form: any }) => {
  if (process.env.NODE_ENV === "production") return null

  const inertiaState = {
    isDirty: form.isDirty,
    processing: form.processing,
    recentlySuccessful: form.recentlySuccessful,
    hasErrors: form.hasErrors,
    progress: form.progress,
    wasSuccessful: form.wasSuccessful,
  }

  return (
    <Sheet open={true} modal={false}>
      <SheetContent
        side="left"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        className="flex w-100 flex-col border-l-slate-800 bg-slate-950 p-0 text-xs font-mono text-slate-300 shadow-none sm:w-112.5"
      >
        <SheetHeader className="border-b border-slate-800 bg-slate-900 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-400">
              <Terminal className="h-4 w-4" />
              <SheetTitle className="font-mono text-xs font-bold uppercase tracking-wider text-slate-400">
                Form Debugger
              </SheetTitle>
            </div>

            <div className="flex gap-2">
              {form.hasErrors && (
                <div
                  className="flex h-5 w-5 items-center justify-center rounded-full border border-red-500/20 bg-red-500/10 text-red-500"
                  title="Errors Detected"
                >
                  <AlertCircle className="h-3 w-3" />
                </div>
              )}
              {form.isDirty && (
                <div
                  className="flex h-5 w-5 items-center justify-center rounded-full border border-amber-500/20 bg-amber-500/10 text-amber-500"
                  title="Unsaved Changes"
                >
                  <Database className="h-3 w-3" />
                </div>
              )}
            </div>
          </div>
        </SheetHeader>

        <div className="flex flex-1 flex-col divide-y divide-slate-800 overflow-hidden">
          <div className="flex flex-2 flex-col min-h-0">
            <div className="flex shrink-0 items-center gap-2 border-b border-slate-800 bg-slate-900/50 px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-emerald-500">
              <Database className="h-3 w-3" /> Payload
            </div>
            <div className="flex-1 overflow-auto p-4 scrollbar-thin scrollbar-track-slate-950 scrollbar-thumb-slate-800">
              <RecursiveJsonViewer data={form.data} />
            </div>
          </div>

          <div className="flex flex-1 flex-col min-h-0">
            <div className="flex shrink-0 items-center gap-2 border-b border-slate-800 bg-slate-900/50 px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-red-500">
              <AlertCircle className="h-3 w-3" /> Errors
            </div>
            <div className="flex-1 overflow-auto p-4 scrollbar-thin scrollbar-track-slate-950 scrollbar-thumb-slate-800">
              {Object.keys(form.errors).length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-slate-700">
                  <CheckCircle2 className="mb-2 h-8 w-8 opacity-20" />
                  <span>No Errors</span>
                </div>
              ) : (
                <RecursiveJsonViewer data={form.errors} />
              )}
            </div>
          </div>

          <div className="flex shrink-0 flex-col max-h-[25%]">
            <div className="flex shrink-0 items-center gap-2 border-b border-slate-800 bg-slate-900/50 px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-blue-500">
              <Layers className="h-3 w-3" /> State
            </div>
            <div className="overflow-auto p-4 scrollbar-thin scrollbar-track-slate-950 scrollbar-thumb-slate-800">
              <RecursiveJsonViewer data={inertiaState} />
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
