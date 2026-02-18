import { create } from "zustand"
import { immer } from "zustand/middleware/immer"
import { Voucher } from "@/types"

interface VoucherState {
  code: string
  discountAmount: number
  appliedVoucher: Voucher | null
  isLoading: boolean
  error: string | null
}

interface VoucherActions {
  setCode: (code: string) => void
  setAppliedVoucher: (voucher: Voucher, discountAmount: number) => void
  clearVoucher: () => void
  setLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
  reset: () => void
}

export const useActiveOrderVoucherStore = create<
  VoucherState & VoucherActions
>()(
  immer((set) => ({
    code: "",
    discountAmount: 0,
    appliedVoucher: null,
    isLoading: false,
    error: null,

    setCode: (code) =>
      set((state) => {
        state.code = code
      }),

    setAppliedVoucher: (voucher, discountAmount) =>
      set((state) => {
        state.appliedVoucher = voucher
        state.discountAmount = discountAmount
        state.error = null
        state.isLoading = false
      }),

    clearVoucher: () =>
      set((state) => {
        state.code = ""
        state.discountAmount = 0
        state.appliedVoucher = null
        state.error = null
      }),

    setLoading: (isLoading) =>
      set((state) => {
        state.isLoading = isLoading
      }),

    setError: (error) =>
      set((state) => {
        state.error = error
        state.isLoading = false
        state.appliedVoucher = null
        state.discountAmount = 0
      }),

    reset: () =>
      set((state) => {
        state.code = ""
        state.discountAmount = 0
        state.appliedVoucher = null
        state.isLoading = false
        state.error = null
      }),
  })),
)
