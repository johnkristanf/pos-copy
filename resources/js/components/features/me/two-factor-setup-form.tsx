import { Check, Copy, Key, Scan, Smartphone } from "lucide-react"
import { useEffect, useState } from "react"
import AlertError from "@/components/ui/alerts/alert-error"
import { Badge } from "@/components/ui/common/badge"
import { Button } from "@/components/ui/common/button"
import { Spinner } from "@/components/ui/common/spinner"
import { useClipboard } from "@/hooks/ui/use-clipboard"

interface TwoFactorSetupFormProps {
  qrCodeSvg: string | null
  manualSetupKey: string | null
  buttonText: string
  onNextStep: () => void
  errors: string[]
  fetchSetupData: () => Promise<void>
  recoveryCodes: string[]
  onRegenerateRecoveryCodes: () => Promise<void>
  isRegenerating: boolean
}

export const TwoFactorSetupForm = ({
  qrCodeSvg,
  manualSetupKey,
  buttonText,
  onNextStep,
  errors,
  fetchSetupData,
  recoveryCodes,
}: TwoFactorSetupFormProps) => {
  const [copiedText, copy] = useClipboard()
  const [isLoading, setIsLoading] = useState(true)
  const IconComponent = copiedText === manualSetupKey ? Check : Copy

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      await fetchSetupData()
      setIsLoading(false)
    }
    loadData()
  }, [fetchSetupData])

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-8">
        <Spinner className="h-8 w-8" />
        <p className="text-sm text-muted-foreground">
          Setting up two-factor authentication...
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {errors?.length ? (
        <AlertError errors={errors} />
      ) : (
        <>
          <div>
            <div className="pb-4">
              <div className="flex items-center gap-2">
                <Scan className="h-5 w-5 text-blue-600" />
                <div className="text-lg">Scan QR Code</div>
              </div>
              <div>Use your authenticator app to scan this QR code</div>
            </div>
            <div className="space-y-4">
              <div className="mx-auto flex max-w-xs justify-center rounded-lg border-2 border-dashed border-gray-200 bg-white p-4">
                <div className="flex items-center justify-center">
                  {qrCodeSvg ? (
                    <div
                      className="rounded-lg shadow-sm"
                      dangerouslySetInnerHTML={{
                        __html: qrCodeSvg,
                      }}
                    />
                  ) : (
                    <div className="flex h-48 w-48 items-center justify-center">
                      <Spinner />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-lg bg-blue-50 p-3">
                <Smartphone className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-blue-900">
                    Recommended apps
                  </p>
                  <p className="text-xs text-blue-700">
                    Google Authenticator, Authy, Microsoft Authenticator, or any
                    TOTP-compatible app
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center">
              <Badge
                variant="secondary"
                className="bg-white px-3 text-sm font-normal"
              >
                OR
              </Badge>
            </div>
          </div>

          <div>
            <div className="pb-4">
              <div className="flex items-center gap-2">
                <Key className="h-5 w-5 text-orange-600" />
                <div className="text-lg">Manual Setup</div>
              </div>
              <div>Enter this code manually if you can't scan the QR code</div>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <span className="text-sm font-medium text-gray-700">
                  Setup Key
                </span>
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      readOnly
                      value={manualSetupKey || ""}
                      className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Generating setup key..."
                    />
                    {manualSetupKey && (
                      <button
                        type="button"
                        onClick={() => copy(manualSetupKey)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-2 text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-colors"
                        title="Copy to clipboard"
                      >
                        <IconComponent
                          className={`h-4 w-4 ${
                            copiedText === manualSetupKey
                              ? "text-green-600"
                              : ""
                          }`}
                        />
                      </button>
                    )}
                  </div>
                </div>
                {copiedText === manualSetupKey && (
                  <p className="text-xs text-green-600 flex items-center gap-1">
                    <Check className="h-3 w-3" />
                    Copied to clipboard!
                  </p>
                )}
              </div>

              <div className="rounded-lg bg-amber-50 p-3">
                <p className="text-xs text-amber-800">
                  <strong>Important:</strong> Save this backup code in a secure
                  location. You'll need it if you lose access to your
                  authenticator app.
                </p>
              </div>
            </div>
          </div>

          {recoveryCodes.length > 0 && (
            <div>
              <div className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Key className="h-5 w-5 text-purple-600" />
                    <div className="text-lg">Recovery Codes</div>
                  </div>
                </div>
                <div>Save these codes in a secure location</div>
              </div>
              <div className="space-y-4">
                <div className="rounded-lg border border-gray-300 bg-gray-50 p-4">
                  <div className="grid grid-cols-2 gap-2">
                    {recoveryCodes.map((code, index) => (
                      <div
                        key={index}
                        className="font-mono text-sm text-gray-700 bg-white px-3 py-2 rounded border border-gray-200"
                      >
                        {code}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-lg bg-red-50 p-3">
                  <p className="text-xs text-red-800">
                    <strong>Warning:</strong> Each recovery code can only be
                    used once. Store them securely.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3 pt-2">
            <Button
              onClick={onNextStep}
              size="lg"
              className="w-full"
              variant={"bridge_digital"}
            >
              {buttonText}
            </Button>
            <p className="text-center text-xs text-gray-500">
              You'll verify a code from your authenticator app in the next step
            </p>
          </div>
        </>
      )}
    </div>
  )
}
