type LogLevel = "log" | "info" | "warn" | "error" | "debug" | "trace"

interface LoggerConfig {
  enabled: boolean
  prefix?: string
  timestamp?: boolean
}

class Logger {
  private config: LoggerConfig

  constructor(
    config: LoggerConfig = {
      enabled: import.meta.env.NODE_ENV === "development",
    },
  ) {
    this.config = {
      timestamp: true,
      ...config,
    }
  }

  private shouldLog(): boolean {
    return this.config.enabled
  }

  private formatMessage(level: LogLevel, ...args: any[]): any[] {
    if (!this.shouldLog()) return []

    const timestamp = this.config.timestamp
      ? `[${new Date().toISOString()}]`
      : ""
    const prefix = this.config.prefix ? `[${this.config.prefix}]` : ""
    const levelTag = `[${level.toUpperCase()}]`

    const formattedPrefix = [timestamp, prefix, levelTag]
      .filter(Boolean)
      .join(" ")

    return formattedPrefix ? [formattedPrefix, ...args] : args
  }

  log(...args: any[]): void {
    if (!this.shouldLog()) return
    console.log(...this.formatMessage("log", ...args))
  }

  info(...args: any[]): void {
    if (!this.shouldLog()) return
    console.info(...this.formatMessage("info", ...args))
  }

  warn(...args: any[]): void {
    if (!this.shouldLog()) return
    console.warn(...this.formatMessage("warn", ...args))
  }

  error(...args: any[]): void {
    if (!this.shouldLog()) return
    console.error(...this.formatMessage("error", ...args))
  }

  debug(...args: any[]): void {
    if (!this.shouldLog()) return
    console.debug(...this.formatMessage("debug", ...args))
  }

  trace(...args: any[]): void {
    if (!this.shouldLog()) return
    console.trace(...this.formatMessage("trace", ...args))
  }

  group(label?: string): void {
    if (!this.shouldLog()) return
    console.group(label)
  }

  groupCollapsed(label?: string): void {
    if (!this.shouldLog()) return
    console.groupCollapsed(label)
  }

  groupEnd(): void {
    if (!this.shouldLog()) return
    console.groupEnd()
  }

  table(data: any): void {
    if (!this.shouldLog()) return
    console.table(data)
  }

  time(label: string): void {
    if (!this.shouldLog()) return
    console.time(label)
  }

  timeEnd(label: string): void {
    if (!this.shouldLog()) return
    console.timeEnd(label)
  }

  clear(): void {
    if (!this.shouldLog()) return
    console.clear()
  }
}

export const logger = new Logger()
export const middlewareLogger = new Logger({
  enabled: import.meta.env.NODE_ENV === "development",
  prefix: "MIDDLEWARE",
})
export const apiLogger = new Logger({
  enabled: import.meta.env.NODE_ENV === "development",
  prefix: "API",
})
export const clientLogger = new Logger({
  enabled: import.meta.env.NODE_ENV === "development",
  prefix: "CLIENT",
})

export { Logger }
export default logger
