import { useQueryClient } from "@tanstack/react-query"
import { useEffect } from "react"
import { echo } from "@/config/echo"

export function useRealtimeInvalidation(
  channel: string,
  event: string,
  queryKey: unknown[],
) {
  const queryClient = useQueryClient()

  useEffect(() => {
    const channelInstance = echo.channel(channel)

    channelInstance.listen(event, () => {
      queryClient.invalidateQueries({ queryKey })
    })

    return () => {
      channelInstance.stopListening(event)
      echo.leave(channel)
    }
  }, [channel, event, queryClient, queryKey])
}
