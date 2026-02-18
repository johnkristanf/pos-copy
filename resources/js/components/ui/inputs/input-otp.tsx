import { OTPInput, OTPInputContext } from "input-otp"
import { Minus } from "lucide-react"
import type { ComponentProps } from "react"
import { useContext } from "react"
import { cn } from "@/lib/cn"

type InputOTPProps = ComponentProps<typeof OTPInput> & {
  containerClassName?: string
}

export function InputOTP({
  className,
  containerClassName,
  ...props
}: InputOTPProps) {
  return (
    <OTPInput
      data-slot="input-otp"
      containerClassName={cn(
        "flex items-center gap-3 has-disabled:opacity-50",
        containerClassName,
      )}
      className={cn("disabled:cursor-not-allowed", className)}
      {...props}
    />
  )
}

export function InputOTPGroup({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="input-otp-group"
      className={cn("flex items-center gap-3", className)}
      {...props}
    />
  )
}

type InputOTPSlotProps = ComponentProps<"div"> & {
  index: number
}

export function InputOTPSlot({
  index,
  className,
  ...props
}: InputOTPSlotProps) {
  const inputOTPContext = useContext(OTPInputContext)
  const slot = inputOTPContext.slots[index]
  if (!slot) return null
  const { char, isActive } = slot

  return (
    <div
      data-slot="input-otp-slot"
      className={cn(
        "relative flex h-12 w-12 items-center justify-center rounded-lg border-2 text-lg font-medium transition-all duration-200 ease-in-out",
        "bg-background/50 backdrop-blur-sm",
        "border-border/50 hover:border-border/80",
        "focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20",
        "shadow-sm hover:shadow-md",
        isActive && [
          "border-primary ring-2 ring-primary/20 shadow-lg",
          "scale-105 transform",
        ],
        char && ["border-primary/80 bg-primary/5", "shadow-inner"],
        "animate-in fade-in-0 zoom-in-95 duration-200",
        className,
      )}
      {...props}
    >
      <span
        className={cn(
          "transition-all duration-150",
          char && "animate-in zoom-in-50 duration-100",
          isActive && "text-primary",
        )}
      >
        {char}
      </span>

      {isActive && !char && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div
            className={cn(
              "h-5 w-0.5 animate-pulse bg-primary/80 rounded-full",
              "animate-caret-blink duration-1000",
            )}
          />
        </div>
      )}

      {isActive && (
        <div className="absolute inset-0 rounded-lg bg-primary/5 animate-pulse" />
      )}
    </div>
  )
}

export function InputOTPSeparator({
  className,
  ...props
}: ComponentProps<"div">) {
  return (
    <div
      data-slot="input-otp-separator"
      className={cn(
        "flex items-center justify-center text-muted-foreground/60",
        "animate-in fade-in-50 duration-300",
        className,
      )}
      {...props}
    >
      <Minus className="h-4 w-4" />
    </div>
  )
}
