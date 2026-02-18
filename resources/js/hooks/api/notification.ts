import {
  UseMutationOptions,
  UseQueryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import axios from "axios"
import { API_ROUTES } from "@/config/api-routes"
import {
  GetManyNotificationsParams,
  Notification,
  PaginatedResponse,
  UpdateNotificationPayload,
} from "@/types"

export const getManyNotifications = async (
  params: GetManyNotificationsParams,
) => {
  const response = await axios.get<PaginatedResponse<Notification>>(
    API_ROUTES.GET_MANY_NOTIFICATIONS,
    { params },
  )
  return response.data
}

export const updateNotification = async (
  id: number,
  payload: UpdateNotificationPayload,
) => {
  const url = API_ROUTES.UPDATE_NOTIFICATION(id)

  const response = await axios.put<Notification>(url, payload)
  return response.data
}

export const useGetManyNotifications = (
  params: GetManyNotificationsParams,
  options?: Omit<
    UseQueryOptions<PaginatedResponse<Notification>, Error>,
    "queryKey" | "queryFn"
  >,
) => {
  return useQuery({
    queryKey: ["notifications", params],
    queryFn: () => getManyNotifications(params),
    placeholderData: (previousData) => previousData,
    ...options,
  })
}

export const useUpdateNotification = (
  options?: UseMutationOptions<
    Notification,
    Error,
    { id: number; payload: UpdateNotificationPayload }
  >,
) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }) => updateNotification(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
    },
    ...options,
  })
}
