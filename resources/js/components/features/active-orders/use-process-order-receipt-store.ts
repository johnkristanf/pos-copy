import { router } from "@inertiajs/react"
import { create } from "zustand"
import { immer } from "zustand/middleware/immer"

import { API_ROUTES } from "@/config/api-routes"

interface ProcessOrderPayload {
  order_id: number
  total_payable: number
  paid_amount: number
  used_voucher?: number | null
  vouchers_used?: number | null
  override_email?: string
  override_password?: string
}

interface ProcessOrderReceiptState {
  isProcessing: boolean
  processPayment: (data: ProcessOrderPayload) => Promise<void>
}

export const useProcessOrderReceiptStore = create<ProcessOrderReceiptState>()(
  immer((set) => ({
    isProcessing: false,
    processPayment: (data) => {
      return new Promise<void>((resolve, reject) => {
        if (data.paid_amount === 0 && data.total_payable > 0) {
          reject("Cash received cannot be zero. Please enter a valid amount.")
          return
        }

        set((state) => {
          state.isProcessing = true
        })

        router.post(API_ROUTES.PROCESS_ORDER, data as any, {
          preserveScroll: true,
          onSuccess: () => {
            set((state) => {
              state.isProcessing = false
            })
            resolve()
          },
          onError: (errors) => {
            set((state) => {
              state.isProcessing = false
            })
            reject(errors)
          },
          onFinish: () => {
            set((state) => {
              state.isProcessing = false
            })
          },
        })
      })
    },
  })),
)
