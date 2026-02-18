import { create } from "zustand"
import { immer } from "zustand/middleware/immer"

export type RequestLogType = "inertia" | "api" | "other"

export interface RequestLog {
  id: string
  method: string
  url: string
  payload?: unknown
  response?: unknown
  status?: number
  duration?: number
  startTime: number
  type: RequestLogType
  error?: boolean
}

interface RequestState {
  logs: RequestLog[]
  actions: {
    addLog: (log: RequestLog) => void
    updateLogResponse: (
      id: string,
      status: number,
      response?: unknown,
      error?: boolean,
    ) => void
    clearLogs: () => void
  }
}

export const useRequestObserver = create<RequestState>()(
  immer((set) => ({
    logs: [],
    actions: {
      addLog: (log) =>
        set((state) => {
          state.logs.unshift(log)
        }),
      updateLogResponse: (id, status, response, error = false) =>
        set((state) => {
          const log = state.logs.find((l) => l.id === id)
          if (log) {
            log.status = status
            if (response !== undefined || error) {
              log.response = response
            }
            log.duration = Math.round(performance.now() - log.startTime)
            log.error = error
          }
        }),
      clearLogs: () =>
        set((state) => {
          state.logs = []
        }),
    },
  })),
)
