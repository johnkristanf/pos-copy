import { Shield } from "lucide-react"
import { Button } from "@/components/ui/common/button"

interface DisableTwoFactorProps {
  closeDialog: () => void
  handleDisableTwoFactor: () => void
  isPending: boolean
}

export const DisableTwoFactor = ({
  closeDialog,
  handleDisableTwoFactor,
  isPending,
}: DisableTwoFactorProps) => {
  return (
    <div className="space-y-4">
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 text-amber-600 mt-0.5" />
          <div>
            <p className="font-medium text-amber-800">Security Notice</p>
            <p className="text-sm text-amber-700 mt-1">
              Disabling 2FA will remove the extra security layer from your
              account. We recommend keeping it enabled for better protection.
            </p>
          </div>
        </div>
      </div>
      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={closeDialog}
          className="flex-1"
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button
          variant={"bridge_digital"}
          onClick={handleDisableTwoFactor}
          className="flex-1"
          disabled={isPending}
        >
          {isPending ? "Disabling..." : "Disable 2FA"}
        </Button>
      </div>
    </div>
  )
}
