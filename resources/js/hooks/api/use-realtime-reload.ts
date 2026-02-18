import { router } from "@inertiajs/react"
import { useEffect, useRef } from "react"
import { echo } from "@/config/echo"

export function useRealtimeReload(
  channel: string,
  event: string,
  propNames: string[] = [],
  onEvent?: (data: any) => void,
  onFinish?: () => void,
) {
  const isReloadingRef = useRef(false)
  const onEventRef = useRef(onEvent)
  const onFinishRef = useRef(onFinish)

  useEffect(() => {
    onEventRef.current = onEvent
    onFinishRef.current = onFinish
  }, [onEvent, onFinish])

  useEffect(() => {
    const channelInstance = echo.channel(channel)

    const handleEvent = (e: any) => {
      console.log("Realtime event received:", event, e)

      if (isReloadingRef.current) {
        console.log("Reload already in progress, skipping...")
        return
      }

      isReloadingRef.current = true

      if (onEventRef.current) {
        onEventRef.current(e)
      }

      router.reload({
        only: propNames.length > 0 ? propNames : undefined,
        onFinish: () => {
          isReloadingRef.current = false
          if (onFinishRef.current) {
            onFinishRef.current()
          }
        },
        onError: (errors) => {
          console.error("Reload failed:", errors)
          isReloadingRef.current = false
          if (onFinishRef.current) {
            onFinishRef.current()
          }
        },
      })
    }

    channelInstance.listen(event, handleEvent)

    channelInstance.error((error: any) => {
      console.error("Channel error:", error)
    })

    return () => {
      channelInstance.stopListening(event)
      echo.leave(channel)
    }
  }, [channel, event, propNames.join(",")])
}
