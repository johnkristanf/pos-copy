import { create } from "zustand"
import { immer } from "zustand/middleware/immer"
import { Customer, PaymentMethod } from "@/types"

interface DraftOrderState {
  selectedCustomer: Customer | null
  paymentMethod: PaymentMethod | null
  discount: number
  draftId: number | null
  actions: {
    setCustomer: (customer: Customer | null) => void
    setPaymentMethod: (method: PaymentMethod | null) => void
    setDiscount: (amount: number) => void
    setDraftId: (id: number | null) => void
    resetDraft: () => void
  }
}

export const useDraftOrderStore = create<DraftOrderState>()(
  immer((set) => ({
    selectedCustomer: null,
    paymentMethod: null,
    discount: 0,
    draftId: null,
    actions: {
      setCustomer: (customer) =>
        set((state) => {
          state.selectedCustomer = customer
        }),
      setPaymentMethod: (method) =>
        set((state) => {
          state.paymentMethod = method
        }),
      setDiscount: (amount) =>
        set((state) => {
          state.discount = amount
        }),
      setDraftId: (id) =>
        set((state) => {
          state.draftId = id
        }),
      resetDraft: () =>
        set((state) => {
          state.selectedCustomer = null
          state.paymentMethod = null
          state.discount = 0
          state.draftId = null
        }),
    },
  })),
)

export const useDraftOrderActions = () =>
  useDraftOrderStore((state) => state.actions)
export const useDraftOrderState = () => useDraftOrderStore((state) => state)
