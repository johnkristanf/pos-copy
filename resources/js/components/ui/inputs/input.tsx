import { EyeIcon, EyeOffIcon } from "lucide-react"
import * as React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/common/button"
import { cn } from "@/lib/cn"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  isPassword?: boolean
  variant?: "default" | "usi_pos"
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, isPassword, variant = "default", ...props }, ref) => {
    const [showPassword, setShowPassword] = useState<boolean>(false)
    const inputType = isPassword ? (showPassword ? "text" : "password") : type

    const baseClasses =
      "flex h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:font-medium file:text-foreground file:text-sm placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"

    const variantClasses = {
      default:
        "outline-ring/50 ring-ring/10 focus-visible:outline-1 focus-visible:ring-4 aria-invalid:border-destructive/60 aria-invalid:outline-destructive/60 aria-invalid:ring-destructive/20 aria-invalid:focus-visible:outline-none aria-invalid:focus-visible:ring-[3px] dark:outline-ring/40 dark:ring-ring/20 dark:aria-invalid:border-destructive dark:aria-invalid:outline-destructive dark:aria-invalid:ring-destructive/40 dark:aria-invalid:ring-destructive/50 dark:aria-invalid:focus-visible:ring-4",
      usi_pos:
        "outline-[#ffcc08]/50 ring-[#ffcc08]/10 focus-visible:outline-[#ffcc08] focus-visible:outline-1 focus-visible:ring-4 focus-visible:ring-[#ffcc08]/30 aria-invalid:border-destructive/60 aria-invalid:outline-destructive/60 aria-invalid:ring-destructive/20 aria-invalid:focus-visible:outline-none aria-invalid:focus-visible:ring-[3px] dark:outline-[#ffcc08]/40 dark:ring-[#ffcc08]/20 dark:focus-visible:ring-[#ffcc08]/40 dark:aria-invalid:border-destructive dark:aria-invalid:outline-destructive dark:aria-invalid:ring-destructive/40 dark:aria-invalid:ring-destructive/50 dark:aria-invalid:focus-visible:ring-4",
    }

    return (
      <div className="relative w-full">
        <input
          type={inputType}
          data-slot="input"
          className={cn(
            baseClasses,
            variantClasses[variant],
            isPassword ? "hide-password-toggle pr-10" : "",
            className,
          )}
          ref={ref}
          {...props}
        />

        {isPassword && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setShowPassword((prev) => !prev)}
            disabled={props.disabled}
          >
            {showPassword && !props.disabled ? (
              <EyeIcon className="size-4" aria-hidden="true" />
            ) : (
              <EyeOffIcon className="size-4" aria-hidden="true" />
            )}
            <span className="sr-only">
              {showPassword ? "Hide password" : "Show password"}
            </span>
          </Button>
        )}
      </div>
    )
  },
)

Input.displayName = "Input"

export { Input }
