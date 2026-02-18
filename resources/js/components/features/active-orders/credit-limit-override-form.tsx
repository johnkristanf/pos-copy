import { AlertCircle } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/common/button"
import { Label } from "@/components/ui/common/label"
import { Input } from "@/components/ui/inputs/input"

interface CreditLimitOverrideFormProps {
  onConfirm: (credentials: { email: string; password: string }) => Promise<void>
  onCancel: () => void
  errorMessage?: string
}

export const CreditLimitOverrideForm = ({
  onConfirm,
  onCancel,
  errorMessage,
}: CreditLimitOverrideFormProps) => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    await onConfirm({ email, password }).finally(() => setIsLoading(false))
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex items-start gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
        <div className="flex flex-col gap-1">
          <p className="font-semibold">Credit Limit Exceeded</p>
          <p>{errorMessage || "Authorization required to proceed."}</p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label>Authorized Email (EVP or Purchasing Head)</Label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="admin@example.com"
            disabled={isLoading}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Password</Label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="destructive"
          disabled={isLoading || !email || !password}
        >
          {isLoading ? "Authorizing..." : "Authorize Override"}
        </Button>
      </div>
    </form>
  )
}
