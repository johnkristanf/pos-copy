import { AnimatePresence, motion } from "framer-motion"
import * as React from "react"
import {
  ConfirmationType,
  confirmationConfig,
  DialogVariant,
} from "@/hooks/ui/use-dynamic-dialog"
import { cn } from "@/lib/cn"
import { Button } from "../common/button"
import { ScrollArea } from "../common/scroll-area"
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogTrigger,
} from "./responsive-dialog"

interface DynamicDialogProps {
  children: React.ReactNode
  title?: string
  description?: string
  trigger?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  variant?: DialogVariant
  confirmationType?: ConfirmationType
  onConfirm?: () => void
  onCancel?: () => void
  confirmText?: string
  cancelText?: string
  showCloseButton?: boolean
  icon?: React.ReactNode
  className?: string
}

export function DynamicDialog({
  children,
  title,
  description,
  trigger,
  open,
  onOpenChange,
  variant = "default",
  confirmationType = "info",
  onConfirm,
  onCancel,
  confirmText = "Confirm",
  cancelText = "Cancel",
  icon,
  className,
}: DynamicDialogProps) {
  const [internalOpen, setInternalOpen] = React.useState(false)
  const isControlled = open !== undefined
  const dialogOpen = isControlled ? open : internalOpen

  const handleOpenChange = (open: boolean) => {
    if (!isControlled) {
      setInternalOpen(open)
    }
    onOpenChange?.(open)
  }

  const handleCancel = () => {
    onCancel?.()
    handleOpenChange(false)
  }

  const handleConfirm = () => {
    onConfirm?.()
    handleOpenChange(false)
  }

  const getIcon = () => {
    if (icon) return icon
    if (variant === "confirmation") {
      return confirmationConfig[confirmationType].icon
    }
    return null
  }

  const dialogIcon = getIcon()

  return (
    <ResponsiveDialog open={dialogOpen} onOpenChange={handleOpenChange}>
      {trigger && (
        <ResponsiveDialogTrigger asChild>{trigger}</ResponsiveDialogTrigger>
      )}
      <ResponsiveDialogContent
        className={cn(
          "w-full p-0 gap-0 overflow-hidden",
          "sm:max-w-md md:max-w-lg lg:max-w-xl",
          className,
        )}
      >
        <AnimatePresence mode="wait">
          {dialogOpen && (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
                duration: 0.2,
              }}
              className="relative flex flex-col h-full max-h-[90vh] w-full"
            >
              <ResponsiveDialogHeader className="px-6 pt-6 pb-2 space-y-0 shrink-0">
                <div className="flex items-start gap-3">
                  {dialogIcon && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 25,
                        delay: 0.1,
                      }}
                      className="w-6 h-6 flex items-center justify-center shrink-0 mt-0.5"
                    >
                      {dialogIcon}
                    </motion.div>
                  )}
                  <div className="flex-1 min-w-0 space-y-1">
                    <ResponsiveDialogTitle
                      className={cn(
                        "text-base font-semibold leading-tight",
                        variant === "confirmation" &&
                          confirmationConfig[confirmationType].titleClass,
                      )}
                    >
                      {title}
                    </ResponsiveDialogTitle>
                    {description && (
                      <ResponsiveDialogDescription className="text-sm text-muted-foreground leading-tight">
                        {description}
                      </ResponsiveDialogDescription>
                    )}
                  </div>
                </div>
              </ResponsiveDialogHeader>

              <ScrollArea className="flex-1 min-h-0">
                <div className="px-6 py-2">{children}</div>
              </ScrollArea>

              {variant === "confirmation" && (
                <motion.div
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                    delay: 0.15,
                  }}
                  className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 px-6 py-3 shrink-0"
                >
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    size="sm"
                    className="w-full sm:w-auto min-w-25 text-sm font-medium"
                  >
                    {cancelText}
                  </Button>
                  <Button
                    onClick={handleConfirm}
                    size="sm"
                    className={cn(
                      "w-full sm:w-auto min-w-25 text-sm font-medium text-white",
                      confirmationType === "success" &&
                        "bg-green-600 hover:bg-green-700",
                      confirmationType === "error" &&
                        "bg-red-600 hover:bg-red-700",
                      confirmationType === "warning" &&
                        "bg-yellow-400 hover:bg-yellow-600",
                      confirmationType === "danger" &&
                        "bg-red-600 hover:bg-red-700",
                      confirmationType === "info" &&
                        "bg-blue-600 hover:bg-blue-700",
                    )}
                  >
                    {confirmText}
                  </Button>
                </motion.div>
              )}

              {variant !== "confirmation" && <div className="py-3 shrink-0" />}
            </motion.div>
          )}
        </AnimatePresence>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  )
}
