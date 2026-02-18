import { http } from "@/config/http"
import { HttpError } from "./error"
import { apiLogger } from "./logger"

export class CsrfTokenManager {
  private token: string | null = null

  async refreshToken(): Promise<string> {
    try {
      try {
        await http.get("/sanctum/csrf-cookie", {
          contentType: "text" as const,
          retries: 2,
          timeout: 10000,
        })

        this.token =
          document
            .querySelector('meta[name="csrf-token"]')
            ?.getAttribute("content") || null
      } catch (sanctumError) {
        apiLogger.warn("🔐 Sanctum CSRF endpoint failed, trying fallback", {
          error: sanctumError,
        })
      }

      if (!this.token) {
        try {
          const csrfResponse = await http.get<{ token: string }>(
            "/csrf-token",
            {
              retries: 2,
              timeout: 10000,
            },
          )
          this.token = csrfResponse.token || null
        } catch (csrfError) {
          apiLogger.warn("🔐 CSRF token endpoint failed", {
            error: csrfError,
          })
        }
      }

      if (!this.token) {
        this.token =
          document
            .querySelector('meta[name="csrf-token"]')
            ?.getAttribute("content") || null
      }

      if (!this.token) {
        throw new HttpError(
          419,
          "No CSRF token available after refresh attempts",
        )
      }

      apiLogger.info("🔐 CSRF token refreshed successfully")
      return this.token
    } catch (error) {
      apiLogger.error("🔐 CSRF Token refresh failed", { error })

      if (error instanceof HttpError) {
        throw error
      }

      throw new HttpError(419, "Failed to refresh CSRF token")
    }
  }

  getToken(): string | null {
    return this.token
  }

  setToken(token: string) {
    this.token = token
  }

  async ensureValidToken(): Promise<string> {
    const token = this.getToken()

    if (!token) {
      return await this.refreshToken()
    }

    return token
  }

  clearToken(): void {
    this.token = null
  }
}
