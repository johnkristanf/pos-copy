import { CsrfTokenManager } from "@/lib/csrf"
import { dataSerializer } from "@/lib/data-serializer"
import { HttpError } from "@/lib/error"
import { apiLogger } from "@/lib/logger"
import { buildQueryString } from "@/lib/query-string"

export type HttpMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "DELETE"
  | "PATCH"
  | "HEAD"
  | "OPTIONS"

export type ContentType = "json" | "form" | "text" | "blob" | "arrayBuffer"

export interface RequestConfig<RequestType = unknown, ResponseType = unknown> {
  url?: string
  method: HttpMethod
  params?: Record<string, string | number | boolean | undefined | null>
  headers?: HeadersInit
  body?: RequestType
  transformResponse?: (data: unknown) => ResponseType
  customURL?: string
  timeout?: number
  retries?: number
  retryDelay?: number
  contentType?: ContentType
  credentials?: RequestCredentials
}

const csrfTokenManager = new CsrfTokenManager()

function handleError(
  error: unknown,
  attempt: number,
  retries: number,
): HttpError {
  apiLogger.error(`🚨 Request Error [Attempt ${attempt + 1}/${retries}]`, {
    error: error instanceof Error ? error.message : String(error),
    attempt: attempt + 1,
    totalRetries: retries,
    errorType: error instanceof Error ? error.constructor.name : typeof error,
  })

  switch (true) {
    case error instanceof HttpError:
      return error
    case error instanceof Error && error.name === "AbortError":
      return new HttpError(408, "Request timed out")
    case error instanceof TypeError:
      return new HttpError(0, "Network error - please check your connection")
    case error instanceof SyntaxError:
      return new HttpError(500, "Invalid JSON response from server")
    case error instanceof RangeError:
      return new HttpError(400, "Invalid request parameters")
    case error instanceof ReferenceError:
      return new HttpError(500, "Internal reference error")
    case error instanceof URIError:
      return new HttpError(400, "Invalid URL format")
    case error instanceof Error && error.name === "TimeoutError":
      return new HttpError(408, "Request timeout")
    case error instanceof Error && error.name === "NetworkError":
      return new HttpError(0, "Network connection failed")
    default:
      return attempt < retries - 1
        ? new HttpError(0, "RETRY")
        : new HttpError(500, "The request failed after multiple attempts")
  }
}

function serializeBody(
  body: unknown,
  contentType: ContentType,
): BodyInit | null {
  switch (contentType) {
    case "json":
      return JSON.stringify(dataSerializer(body))
    case "form":
      return body instanceof FormData
        ? body
        : new URLSearchParams(body as Record<string, string>)
    case "text":
      return String(body)
    case "blob":
      return body as Blob
    case "arrayBuffer":
      return body as ArrayBuffer
    default:
      return JSON.stringify(dataSerializer(body))
  }
}

function getContentTypeHeader(contentType: ContentType): string {
  switch (contentType) {
    case "json":
      return "application/json"
    case "form":
      return "application/x-www-form-urlencoded"
    case "text":
      return "text/plain"
    case "blob":
      return "application/octet-stream"
    case "arrayBuffer":
      return "application/octet-stream"
    default:
      return "application/json"
  }
}

async function parseResponse(response: Response): Promise<unknown> {
  const textResponse = await response.text()

  if (!textResponse.trim()) return {}

  const contentType = response.headers.get("content-type")
  if (!contentType?.includes("application/json")) return textResponse

  return JSON.parse(textResponse)
}

async function handleErrorResponse(response: Response): Promise<never> {
  let errorMessage = response.statusText
  let errorData = null
  const contentType = response.headers.get("content-type")

  if (contentType?.includes("application/json")) {
    errorData = await response.json().catch(() => null)
    errorMessage = errorData?.error || errorData?.message || response.statusText
  }

  apiLogger.error(`❌ HTTP Error ${response.status}: ${response.statusText}`, {
    status: response.status,
    statusText: response.statusText,
    url: response.url,
    message: errorMessage,
    data: errorData,
  })

  throw new HttpError(response.status, errorMessage, errorData)
}

async function ensureCsrfToken(): Promise<void> {
  const token = csrfTokenManager.getToken()

  if (!token) {
    apiLogger.warn("🔐 CSRF token not found, attempting to refresh...")
    await csrfTokenManager.refreshToken()
  }
}

async function makeHttpRequest<RequestType = unknown, ResponseType = unknown>(
  config: RequestConfig<RequestType, ResponseType>,
): Promise<ResponseType> {
  const {
    url,
    method,
    params,
    headers = {},
    body,
    transformResponse,
    customURL,
    timeout = 24 * 60 * 60 * 1000,
    retries = 3,
    retryDelay = 1000,
    contentType = "json",
    credentials = "include",
  } = config

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  const makeRequest = async (): Promise<ResponseType> => {
    if (!url && !customURL) {
      throw new HttpError(400, "No URL provided for the API request")
    }

    const fullUrl = url
      ? `${import.meta.env.API_URL}/api/v1/${url}${buildQueryString(params)}`
      : customURL

    apiLogger.info(`🚀 ${method} Request`, {
      method,
      url: fullUrl,
      hasParams: !!params && Object.keys(params).length > 0,
      hasBody: !!body && method !== "GET",
      contentType,
      timeout: `${timeout}ms`,
    })

    if (body && method !== "GET") {
      const bodyStr = typeof body === "string" ? body : JSON.stringify(body)
      apiLogger.debug(`📤 Request Body [${bodyStr.length} chars]`, {
        contentType,
        bodyPreview:
          bodyStr.length > 200 ? `${bodyStr.substring(0, 200)}...` : bodyStr,
        fullSize: `${bodyStr.length} characters`,
      })
    }

    const urlObject = new URL(fullUrl!)
    if (!["http:", "https:"].includes(urlObject.protocol)) {
      apiLogger.error("🔒 Invalid Protocol", {
        protocol: urlObject.protocol,
        message: "URL must use HTTP or HTTPS protocol",
      })
    }

    const methodsRequiringCsrf = ["POST", "PUT", "DELETE", "PATCH"]
    if (methodsRequiringCsrf.includes(method)) {
      await ensureCsrfToken()
    }

    const csrfToken = csrfTokenManager.getToken()
    const requestHeaders: Record<string, string> = {
      ...(contentType !== "form" || !(body instanceof FormData)
        ? { "Content-Type": getContentTypeHeader(contentType) }
        : {}),
      ...(headers as Record<string, string>),
    }

    if (methodsRequiringCsrf.includes(method) && csrfToken) {
      requestHeaders["X-CSRF-TOKEN"] = csrfToken
    }

    const requestOptions: RequestInit = {
      method,
      credentials,
      headers: requestHeaders,
      cache: "no-store",
      signal: controller.signal,
    }

    const methodsWithoutBody = ["GET", "HEAD", "OPTIONS"]

    if (methodsWithoutBody.includes(method) && body) {
      apiLogger.error("⚠️ Invalid Request", {
        method,
        issue: "Request should not have a body",
        message: `${method} request should not have a body`,
      })
    }

    if (body && !methodsWithoutBody.includes(method)) {
      requestOptions.body = serializeBody(body, contentType)
    }

    const requestStart = performance.now()
    const response = await fetch(fullUrl!, requestOptions)
    const requestDuration = Math.round(performance.now() - requestStart)

    const statusEmoji = response.ok ? "✅" : "❌"
    apiLogger.info(`${statusEmoji} ${method} Response [${requestDuration}ms]`, {
      method,
      url: fullUrl,
      status: response.status,
      statusText: response.statusText,
      duration: `${requestDuration}ms`,
      ok: response.ok,
      contentType: response.headers.get("content-type"),
    })

    if (response.status === 419) {
      apiLogger.warn("🔐 CSRF token mismatch, refreshing token...")
      await csrfTokenManager.refreshToken()
      throw new HttpError(419, "CSRF token mismatch - token refreshed")
    }

    if (!response.ok) {
      return await handleErrorResponse(response)
    }

    if (method === "HEAD") {
      return {} as ResponseType
    }

    const data = await parseResponse(response)
    const serializedData = dataSerializer(data)

    const dataStr = JSON.stringify(serializedData)
    apiLogger.debug(`📥 Response Data [${dataStr.length} chars]`, {
      hasData: !!serializedData && Object.keys(serializedData).length > 0,
      dataSize: `${dataStr.length} characters`,
      dataPreview:
        dataStr.length > 200 ? `${dataStr.substring(0, 200)}...` : dataStr,
      transformApplied: !!transformResponse,
    })

    return transformResponse
      ? transformResponse(serializedData)
      : (serializedData as ResponseType)
  }

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const result = await makeRequest()
      clearTimeout(timeoutId)
      return result
    } catch (error) {
      const handledError = handleError(error, attempt, retries)

      if (
        handledError instanceof HttpError &&
        handledError.status === 419 &&
        attempt < retries - 1
      ) {
        apiLogger.warn(`🔄 Retrying after CSRF token refresh`, {
          attempt: attempt + 1,
          totalRetries: retries,
          nextAttempt: `${attempt + 2}/${retries}`,
        })
        await new Promise((resolve) => setTimeout(resolve, retryDelay))
        continue
      }

      if (handledError.message === "RETRY" && attempt < retries - 1) {
        const delay = retryDelay * 2 ** attempt
        apiLogger.warn(`🔄 Retrying Request`, {
          attempt: attempt + 1,
          totalRetries: retries,
          delay: `${delay}ms`,
          nextAttempt: `${attempt + 2}/${retries}`,
        })
        await new Promise((resolve) => setTimeout(resolve, delay))
        continue
      }

      clearTimeout(timeoutId)
      controller.abort()

      if (handledError instanceof HttpError) {
        apiLogger.error("💥 Request Failed", {
          message: handledError.message,
        })
        throw handledError
      } else {
        apiLogger.error("💥 Unexpected Error", {
          message: "An unexpected error occurred",
        })
        throw new HttpError(500, "An unexpected error occurred")
      }
    }
  }

  clearTimeout(timeoutId)
  controller.abort()
  throw new HttpError(500, "Request failed after all retry attempts")
}

export function httpRequest<RequestType = unknown, ResponseType = unknown>(
  urlOrCustomURL: string,
  method: HttpMethod,
  options: Partial<
    Omit<
      RequestConfig<RequestType, ResponseType>,
      "url" | "method" | "customURL"
    >
  > = {},
): Promise<ResponseType> {
  const isCustomURL =
    urlOrCustomURL.startsWith("http://") ||
    urlOrCustomURL.startsWith("https://")

  return makeHttpRequest<RequestType, ResponseType>({
    ...(isCustomURL ? { customURL: urlOrCustomURL } : { url: urlOrCustomURL }),
    method,
    ...options,
  })
}

export const http = {
  get: <ResponseType = unknown>(
    url: string,
    options?: Partial<
      Omit<RequestConfig<unknown, ResponseType>, "url" | "method">
    >,
  ) => httpRequest<unknown, ResponseType>(url, "GET", options),

  post: <RequestType = unknown, ResponseType = unknown>(
    url: string,
    body?: RequestType,
    options?: Partial<
      Omit<RequestConfig<RequestType, ResponseType>, "url" | "method" | "body">
    >,
  ) =>
    httpRequest<RequestType, ResponseType>(url, "POST", { ...options, body }),

  put: <RequestType = unknown, ResponseType = unknown>(
    url: string,
    body?: RequestType,
    options?: Partial<
      Omit<RequestConfig<RequestType, ResponseType>, "url" | "method" | "body">
    >,
  ) => httpRequest<RequestType, ResponseType>(url, "PUT", { ...options, body }),

  delete: <ResponseType = unknown>(
    url: string,
    options?: Partial<
      Omit<RequestConfig<unknown, ResponseType>, "url" | "method">
    >,
  ) => httpRequest<unknown, ResponseType>(url, "DELETE", options),

  patch: <RequestType = unknown, ResponseType = unknown>(
    url: string,
    body?: RequestType,
    options?: Partial<
      Omit<RequestConfig<RequestType, ResponseType>, "url" | "method" | "body">
    >,
  ) =>
    httpRequest<RequestType, ResponseType>(url, "PATCH", { ...options, body }),
}
