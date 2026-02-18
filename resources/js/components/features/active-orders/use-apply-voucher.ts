import { useMutation } from "@tanstack/react-query"
import axios from "axios"
import { API_ROUTES } from "@/config/api-routes"
import { Voucher } from "@/types"
import { useActiveOrderVoucherStore } from "./use-active-order-voucher"

interface ApplyVoucherPayload {
  code: string
  order_amount: number
}

interface ApplyVoucherResponse {
  voucher: Voucher
  discount_amount: string
  new_total: number
}

export const useApplyVoucher = () => {
  const activeOrderVoucherStore = useActiveOrderVoucherStore()

  return useMutation({
    mutationFn: async (payload: ApplyVoucherPayload) => {
      const response = await axios.post<ApplyVoucherResponse>(
        API_ROUTES.APPLY_VOUCHER,
        payload,
      )
      return response.data
    },
    onMutate: () => {
      activeOrderVoucherStore.setLoading(true)
      activeOrderVoucherStore.setError(null)
    },
    onSuccess: (data) => {
      activeOrderVoucherStore.setAppliedVoucher(
        data.voucher,
        Number(data.discount_amount),
      )
      activeOrderVoucherStore.setCode(data.voucher.code)
    },
    onError: (error: any) => {
      const msg =
        error?.response?.data?.errors?.code?.[0] ||
        error?.response?.data?.message ||
        "Failed to apply voucher"

      activeOrderVoucherStore.setError(msg)
    },
    onSettled: () => {
      activeOrderVoucherStore.setLoading(false)
    },
  })
}
