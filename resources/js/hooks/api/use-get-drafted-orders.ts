import { useQuery } from "@tanstack/react-query"
import { API_ROUTES } from "@/config/api-routes"
import { fetchJson } from "@/lib/fetch-json"
import { Order } from "@/types"

export const useGetDraftedOrders = () => {
  return useQuery({
    queryKey: ["draft-orders"],
    queryFn: async () => {
      const response = await fetchJson<Order[]>(API_ROUTES.GET_DRAFTS)
      return response
    },
    staleTime: 1000 * 60 * 5,
  })
}
