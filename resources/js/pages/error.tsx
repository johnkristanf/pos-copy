import { Head } from "@inertiajs/react"
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  ChevronRight,
  Copy,
  FileCode,
  RefreshCw,
  Terminal,
} from "lucide-react"
import { useState } from "react"
import { Badge } from "@/components/ui/common/badge"
import { Button } from "@/components/ui/common/button"
import { Card, CardContent } from "@/components/ui/common/card"
import { ScrollArea } from "@/components/ui/common/scroll-area"
import { Separator } from "@/components/ui/common/separator"
import { cn } from "@/lib/cn"

interface ErrorTrace {
  file: string
  line: number
  function: string
  class?: string
}

interface ErrorDetails {
  message: string
  file: string
  line: number
  trace: ErrorTrace[]
}

interface ErrorPageProps {
  status: number
  title: string
  description: string
  isDev: boolean
  error?: ErrorDetails
}

export default function ErrorPage({
  status,
  title,
  description,
  isDev,
  error,
}: ErrorPageProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const getStatusConfig = (status: number) => {
    const statusRanges = [
      {
        range: [500, Infinity],
        color: "text-red-600 dark:text-red-400",
        bgGradient:
          "from-red-50/50 via-background to-background dark:from-red-950/10",
        borderColor: "border-red-200/50 dark:border-red-900/50",
        badgeColor:
          "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-900",
        accentColor: "bg-red-500/10 dark:bg-red-500/20",
        icon: AlertTriangle,
      },
      {
        range: [400, 499],
        color: "text-amber-600 dark:text-amber-400",
        bgGradient:
          "from-amber-50/50 via-background to-background dark:from-amber-950/10",
        borderColor: "border-amber-200/50 dark:border-amber-900/50",
        badgeColor:
          "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-900",
        accentColor: "bg-amber-500/10 dark:bg-amber-500/20",
        icon: AlertCircle,
      },
    ]

    const config = statusRanges.find(
      (range) => status >= range.range[0] && status <= range.range[1],
    )

    return (
      config || {
        color: "text-blue-600 dark:text-blue-400",
        bgGradient:
          "from-blue-50/50 via-background to-background dark:from-blue-950/10",
        borderColor: "border-blue-200/50 dark:border-blue-900/50",
        badgeColor:
          "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-900",
        accentColor: "bg-blue-500/10 dark:bg-blue-500/20",
        icon: AlertCircle,
      }
    )
  }

  const config = getStatusConfig(status)
  const StatusIcon = config.icon

  const handleRefresh = () => {
    window.location.reload()
  }

  const getShortPath = (path: string) => {
    const parts = path.split(/[/\\]/)
    return parts.length > 3 ? `.../${parts.slice(-3).join("/")}` : path
  }

  const copyToClipboard = async (text: string, index: number) => {
    await navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  return (
    <>
      <Head title={`${status} - ${title}`} />
      <div
        className={cn(
          "relative min-h-screen flex items-center justify-center",
          config.bgGradient,
        )}
      >
        <div className="absolute inset-0" />

        <div className="relative w-full">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
            <div className="space-y-12">
              <div className="flex flex-col items-center text-center space-y-8">
                <div className="relative">
                  <div
                    className={cn(
                      "absolute inset-0 blur-3xl opacity-20 rounded-full",
                      config.accentColor,
                    )}
                  />
                  <div
                    className={cn(
                      "relative rounded-2xl p-6",
                      config.accentColor,
                    )}
                  >
                    <StatusIcon
                      className={cn("h-12 w-12", config.color)}
                      strokeWidth={1.5}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-3">
                    <h1
                      className={cn(
                        "text-7xl sm:text-9xl font-bold tracking-tighter tabular-nums",
                        config.color,
                      )}
                    >
                      {status}
                    </h1>
                  </div>
                  <div className="space-y-3">
                    <h2 className="text-2xl sm:text-4xl font-semibold tracking-tight text-foreground">
                      {title}
                    </h2>
                    <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                      {description}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
                  <Button
                    size="lg"
                    onClick={handleRefresh}
                    variant={"bridge_digital"}
                    className="gap-2 h-11 px-6 rounded-full font-medium shadow-sm hover:shadow transition-all"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Refresh Page
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => window.history.back()}
                    className="gap-2 h-11 px-6 rounded-full font-medium"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Go Back
                  </Button>
                </div>
              </div>

              {isDev && error && (
                <div className="mx-auto max-w-5xl">
                  <Card className="border shadow-xl bg-background/60 backdrop-blur-xl">
                    <CardContent className="p-6 sm:p-8 space-y-8">
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={cn(
                              "gap-1.5 px-3 py-1 font-medium",
                              config.badgeColor,
                            )}
                          >
                            <Terminal className="h-3 w-3" />
                            Development Mode
                          </Badge>
                          <Badge
                            variant="outline"
                            className="font-mono text-xs tabular-nums px-2.5 py-1"
                          >
                            {status}
                          </Badge>
                        </div>

                        <div className="space-y-3">
                          <h3 className="text-xl font-semibold text-foreground leading-tight">
                            {error.message}
                          </h3>
                          <div className="flex items-start gap-2 text-sm text-muted-foreground">
                            <FileCode className="h-4 w-4 shrink-0 mt-0.5" />
                            <div className="font-mono text-xs break-all">
                              <span className="text-foreground/80">
                                {error.file}
                              </span>
                              <span
                                className={cn("font-semibold", config.color)}
                              >
                                :{error.line}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                            <Terminal className="h-4 w-4" />
                            Stack Trace
                          </h4>
                          <Badge
                            variant="secondary"
                            className="font-mono text-xs tabular-nums"
                          >
                            {error.trace.length}{" "}
                            {error.trace.length === 1 ? "frame" : "frames"}
                          </Badge>
                        </div>

                        <ScrollArea className="h-96 rounded-xl border bg-muted/30">
                          <div className="p-4 space-y-3">
                            {error.trace.map((trace, index) => (
                              <div
                                key={index}
                                className="group relative rounded-lg border bg-background/50 p-4 transition-all hover:bg-background hover:shadow-md"
                              >
                                <div className="flex items-start gap-3">
                                  <Badge
                                    variant="outline"
                                    className="shrink-0 font-mono text-xs tabular-nums w-12 justify-center"
                                  >
                                    #{String(index + 1).padStart(2, "0")}
                                  </Badge>

                                  <div className="flex-1 min-w-0 space-y-2">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      {trace.class && (
                                        <>
                                          <span className="font-semibold text-foreground text-sm">
                                            {trace.class}
                                          </span>
                                          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                                        </>
                                      )}
                                      <span
                                        className={cn(
                                          "font-bold text-sm",
                                          config.color,
                                        )}
                                      >
                                        {trace.function}()
                                      </span>
                                    </div>

                                    <div className="flex items-start gap-2">
                                      <FileCode className="h-3.5 w-3.5 shrink-0 mt-0.5 text-muted-foreground" />
                                      <div className="font-mono text-xs break-all text-muted-foreground flex-1">
                                        <span className="text-foreground/70">
                                          {getShortPath(trace.file)}
                                        </span>
                                        <span
                                          className={cn(
                                            "font-semibold",
                                            config.color,
                                          )}
                                        >
                                          :{trace.line}
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
                                    onClick={() =>
                                      copyToClipboard(
                                        `${trace.file}:${trace.line}`,
                                        index,
                                      )
                                    }
                                  >
                                    <Copy className="h-3.5 w-3.5" />
                                  </Button>
                                </div>

                                {copiedIndex === index && (
                                  <div className="absolute top-2 right-2 text-xs text-green-600 dark:text-green-400 font-medium">
                                    Copied!
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {!isDev && (
                <div className="mx-auto max-w-2xl">
                  <Card className="border-dashed bg-muted/30">
                    <CardContent className="p-6">
                      <p className="text-center text-sm text-muted-foreground leading-relaxed">
                        If this problem persists, please contact support and
                        reference error code{" "}
                        <Badge
                          variant="secondary"
                          className="font-mono font-semibold"
                        >
                          ERR-{status}
                        </Badge>
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
