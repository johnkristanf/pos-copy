import { ZodError } from "zod"

export interface ErrorResponseData {
  message: string
  statusCode?: number
  errors?: Record<string, string[]>
}

export interface LaravelErrorResponse {
  message: string
  errors?: Record<string, string[]>
}

export interface LaravelValidationErrorResponse {
  message: string
  errors: Record<string, string[]>
}

export class HttpError extends Error {
  public readonly status: number
  public readonly statusCode: number
  public readonly data?: any

  constructor(statusCode: number, message: string, data?: any) {
    super(message)
    this.name = "HttpError"
    this.status = statusCode
    this.statusCode = statusCode
    this.data = data

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, HttpError)
    }
  }

  get isNetworkError(): boolean {
    return this.status === 0
  }

  get isClientError(): boolean {
    return this.status >= 400 && this.status < 500
  }

  get isServerError(): boolean {
    return this.status >= 500 && this.status < 600
  }

  get isAuthError(): boolean {
    return this.status === 401 || this.status === 403
  }

  get isCsrfError(): boolean {
    return this.status === 419
  }

  get isTimeout(): boolean {
    return this.status === 408
  }

  get isValidationError(): boolean {
    return this.status === 422
  }

  toJSON() {
    return {
      name: this.name,
      status: this.status,
      statusCode: this.statusCode,
      message: this.message,
      data: this.data,
    }
  }

  toString(): string {
    return `${this.name} [${this.status}]: ${this.message}`
  }
}

export class ErrorHandler {
  public static handleError(error: unknown): ErrorResponseData {
    if (error instanceof HttpError) {
      return ErrorHandler.handleHttpError(error)
    }

    if (ErrorHandler.isZodError(error)) {
      return ErrorHandler.handleZodError(error)
    }

    if (ErrorHandler.isAxiosError(error)) {
      return ErrorHandler.handleAxiosError(error)
    }

    if (error instanceof Error) {
      return ErrorHandler.handleGenericError(error)
    }

    return ErrorHandler.handleUnknownError(error)
  }

  private static handleHttpError(error: HttpError): ErrorResponseData {
    if (error.data && ErrorHandler.isLaravelErrorResponse(error.data)) {
      return ErrorHandler.handleLaravelError(error.data, error.statusCode)
    }

    return {
      message: error.message,
      statusCode: error.statusCode,
    }
  }

  private static isZodError(error: unknown): error is ZodError {
    return error instanceof ZodError
  }

  private static isAxiosError(error: unknown): boolean {
    return (
      typeof error === "object" &&
      error !== null &&
      "isAxiosError" in error &&
      (error as any).isAxiosError === true
    )
  }

  private static isLaravelErrorResponse(
    data: unknown,
  ): data is LaravelErrorResponse {
    return (
      typeof data === "object" &&
      data !== null &&
      "message" in data &&
      typeof (data as any).message === "string"
    )
  }

  private static isLaravelValidationError(
    data: unknown,
  ): data is LaravelValidationErrorResponse {
    return (
      ErrorHandler.isLaravelErrorResponse(data) &&
      "errors" in data &&
      typeof (data as any).errors === "object" &&
      (data as any).errors !== null
    )
  }

  private static handleAxiosError(error: any): ErrorResponseData {
    const response = error.response
    const statusCode = response?.status || 500

    if (response?.data && ErrorHandler.isLaravelErrorResponse(response.data)) {
      return ErrorHandler.handleLaravelError(response.data, statusCode)
    }

    if (error.code === "NETWORK_ERROR" || !response) {
      return {
        message: "Network error. Please check your connection.",
        statusCode: 0,
      }
    }

    return {
      message: error.message || "An unexpected error occurred.",
      statusCode,
    }
  }

  private static handleLaravelError(
    data: LaravelErrorResponse,
    statusCode: number,
  ): ErrorResponseData {
    if (statusCode === 422 && ErrorHandler.isLaravelValidationError(data)) {
      return ErrorHandler.handleLaravelValidationError(data)
    }

    return {
      message: data.message,
      statusCode,
      errors: data.errors,
    }
  }

  private static handleLaravelValidationError(
    data: LaravelValidationErrorResponse,
  ): ErrorResponseData {
    const fieldErrors = Object.entries(data.errors)
      .map(([field, messages]) => `${field}: ${messages.join(", ")}`)
      .join("; ")

    return {
      message: fieldErrors || "Validation failed",
      statusCode: 422,
      errors: data.errors,
    }
  }

  private static handleZodError(error: ZodError): ErrorResponseData {
    const message = error.issues.map((e) => e.message).join(", ")
    return {
      message: `Validation error: ${message}`,
      statusCode: 400,
    }
  }

  private static handleGenericError(error: Error): ErrorResponseData {
    return {
      message: error.message || "An unexpected error occurred.",
      statusCode: 500,
    }
  }

  private static handleUnknownError(error: unknown): ErrorResponseData {
    return {
      message: typeof error === "string" ? error : "An unknown error occurred.",
      statusCode: 500,
    }
  }

  public static createHttpError(
    statusCode: number,
    message?: string,
    data?: any,
  ): HttpError {
    const defaultMessages: Record<number, string> = {
      400: "Bad Request",
      401: "Unauthorized",
      403: "Forbidden",
      404: "Not Found",
      408: "Request Timeout",
      419: "CSRF Token Mismatch",
      422: "Validation Error",
      429: "Too Many Requests",
      500: "Internal Server Error",
      502: "Bad Gateway",
      503: "Service Unavailable",
      504: "Gateway Timeout",
    }

    const errorMessage =
      message || defaultMessages[statusCode] || "An error occurred"
    return new HttpError(statusCode, errorMessage, data)
  }
}
