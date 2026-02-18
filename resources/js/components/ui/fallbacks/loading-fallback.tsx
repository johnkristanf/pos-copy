import { Loader2 } from "lucide-react"
import { APP_ASSETS } from "@/config/assets"
import ImageComponent from "../media/image"

export const LoadingFallback = () => {
  return (
    <div className="flex h-[100vh] flex-col items-center justify-center">
      <ImageComponent
        src={APP_ASSETS.BRIDGE_LOGO}
        alt={APP_ASSETS.BRIDGE_LOGO}
      />
      <Loader2 className="mt-4 size-15 animate-spin" />
    </div>
  )
}
