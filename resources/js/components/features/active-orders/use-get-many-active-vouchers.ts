import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import { API_ROUTES } from "@/config/api-routes"
import { Voucher } from "@/types"

interface PaginatedVouchers {
  data: Voucher[]
}

export const useGetManyActiveVouchers = () => {
  return useQuery({
    queryKey: ["active-vouchers"],
    queryFn: async () => {
      const response = await axios.get<PaginatedVouchers>(
        API_ROUTES.GET_ACTIVE_VOUCHERS,
      )
      return response.data
    },
  })
}
