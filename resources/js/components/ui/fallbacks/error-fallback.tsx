import { ServerCrash } from "lucide-react"
import { Button } from "../common/button"

export const ErrorFallback = ({ error }: { error: Error }) => {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="rounded-full bg-red-50 p-3">
            <ServerCrash className="size-8 text-red-500" />
          </div>
        </div>

        <div className="space-y-3">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold text-gray-900">
              Application Error
            </h1>
            <p className="text-sm text-gray-600">
              A client-side exception has occurred
            </p>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-left">
            <p className="text-sm font-mono text-red-800 break-words">
              {error.message}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            variant="bridge_digital"
            onClick={() => window.location.reload()}
          >
            Try again
          </Button>
          <Button
            variant="outline"
            onClick={() => window.location.assign(window.location.origin)}
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Go to homepage
          </Button>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            If this error persists, please contact support
          </p>
        </div>
      </div>
    </div>
  )
}
