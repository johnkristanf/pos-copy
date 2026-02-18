import { DynamicDialog } from "@/components/ui/dialogs/dynamic-dialog"
import { useDynamicDialog } from "@/hooks/ui/use-dynamic-dialog"

export function GlobalDynamicDialog() {
  const {
    isOpen,
    title,
    description,
    children,
    variant,
    confirmationType,
    icon,
    onConfirm,
    onCancel,
    confirmText,
    cancelText,
    setOpen,
    dialogClassName,
  } = useDynamicDialog()

  return (
    <DynamicDialog
      open={isOpen}
      onOpenChange={setOpen}
      title={title}
      description={description}
      variant={variant}
      confirmationType={confirmationType}
      icon={icon}
      onConfirm={onConfirm}
      onCancel={onCancel}
      confirmText={confirmText}
      cancelText={cancelText}
      className={dialogClassName}
    >
      {children}
    </DynamicDialog>
  )
}
