import { Errors, Page } from "@inertiajs/core"
import { router } from "@inertiajs/react"
import { useRequestObserver } from "@/hooks/api/request-observer"

interface InertiaEventDetail {
  visit?: {
    url: URL | string
    method: string
    data: unknown
  }
  page?: Page
  errors?: Errors
}

class RequestObserverService {
  private activeInertiaVisits = new WeakMap<object, string>()

  constructor() {
    this.setupInertiaListeners()
  }

  private get actions() {
    return useRequestObserver.getState().actions
  }

  private get logs() {
    return useRequestObserver.getState().logs
  }

  public captureInitialPage(page: Page) {
    const id = "initial-load"

    this.actions.addLog({
      id,
      method: "GET",
      url: typeof window !== "undefined" ? window.location.href : page.url,
      type: "inertia",
      payload: {},
      startTime: performance.now(),
    })

    this.actions.updateLogResponse(id, 200, page.props)
  }

  private setupInertiaListeners() {
    if (typeof window === "undefined") return

    router.on("start", (event) => {
      const detail = event.detail as InertiaEventDetail
      const visit = detail.visit
      if (!visit) return

      const id = Math.random().toString(36).substring(7)

      if (typeof visit === "object") {
        this.activeInertiaVisits.set(visit, id)
      }

      this.actions.addLog({
        id,
        method: visit.method.toUpperCase(),
        url: visit.url.toString(),
        type: "inertia",
        payload: visit.data,
        startTime: performance.now(),
      })
    })

    router.on("success", (event) => {
      const detail = event.detail as InertiaEventDetail
      const visit = detail.visit

      let id =
        visit && typeof visit === "object"
          ? this.activeInertiaVisits.get(visit)
          : null

      if (!id) {
        const lastPending = this.logs.find(
          (l) => l.type === "inertia" && !l.duration,
        )
        id = lastPending?.id
      }

      if (id && detail.page) {
        this.actions.updateLogResponse(id, 200, detail.page.props)
      }
    })

    router.on("error", (event) => {
      const detail = event.detail as InertiaEventDetail
      const visit = detail.visit

      let id =
        visit && typeof visit === "object"
          ? this.activeInertiaVisits.get(visit)
          : null

      if (!id) {
        const lastPending = this.logs.find(
          (l) => l.type === "inertia" && !l.duration,
        )
        id = lastPending?.id
      }

      if (id && detail.errors) {
        this.actions.updateLogResponse(id, 422, detail.errors, true)
      }
    })

    router.on("finish", (event) => {
      const detail = event.detail as InertiaEventDetail
      const visit = detail.visit

      let id =
        visit && typeof visit === "object"
          ? this.activeInertiaVisits.get(visit)
          : null

      if (!id) {
        const lastPending = this.logs.find(
          (l) => l.type === "inertia" && !l.duration,
        )
        id = lastPending?.id
      }

      if (id) {
        const currentLog = this.logs.find((l) => l.id === id)

        const hasResponse = currentLog?.response !== undefined

        if (currentLog && !hasResponse) {
          this.actions.updateLogResponse(
            id,
            currentLog.status || 200,
            "Navigation Completed (No Data Captured)",
          )
        } else if (currentLog) {
          this.actions.updateLogResponse(
            id,
            currentLog.status || 200,
            currentLog.response,
          )
        }
      }
    })
  }

  clear() {
    this.actions.clearLogs()
  }
}

export const requestObserver = new RequestObserverService()
