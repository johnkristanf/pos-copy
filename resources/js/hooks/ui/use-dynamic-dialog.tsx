import {
  AlertCircle,
  AlertTriangleIcon,
  CheckCircle,
  Info,
  XCircle,
} from "lucide-react"
import { ReactNode } from "react"
import { create } from "zustand"
import { immer } from "zustand/middleware/immer"

export type DialogVariant = "default" | "confirmation"
export type ConfirmationType =
  | "success"
  | "error"
  | "info"
  | "danger"
  | "warning"

interface DialogState {
  isOpen: boolean
  title?: string
  description?: string
  children?: ReactNode
  variant: DialogVariant
  confirmationType?: ConfirmationType
  icon?: ReactNode
  onConfirm?: () => void
  onCancel?: () => void
  confirmText?: string
  cancelText?: string
  dialogClassName?: string
}

interface DialogStore extends DialogState {
  openDialog: (
    config: Omit<DialogState, "isOpen" | "variant"> & {
      variant?: DialogVariant
      dialogClass?: string
    },
  ) => void
  openConfirmation: (config: {
    title?: string
    description?: string
    type: ConfirmationType
    onConfirm: () => void
    onCancel?: () => void
    confirmText?: string
    cancelText?: string
  }) => void
  closeDialog: () => void
  setOpen: (open: boolean) => void
}

export const confirmationConfig: Record<
  ConfirmationType,
  { icon: React.ReactNode; confirmButtonClass: string; titleClass: string }
> = {
  success: {
    icon: <CheckCircle className="size-8 text-green-500" />,
    confirmButtonClass: "bg-green-600 hover:bg-green-700 text-white",
    titleClass: "text-green-700",
  },
  error: {
    icon: <XCircle className="size-8 text-red-500" />,
    confirmButtonClass: "bg-red-600 hover:bg-red-700 text-white",
    titleClass: "text-red-700",
  },
  info: {
    icon: <Info className="size-8 text-blue-500" />,
    confirmButtonClass: "bg-blue-600 hover:bg-blue-700 text-white",
    titleClass: "text-blue-700",
  },
  danger: {
    icon: <AlertCircle className="size-8 text-[#ffcc08]" />,
    confirmButtonClass: "bg-amber-600 hover:bg-[#ffcc08] text-white",
    titleClass: "text-[#ffcc08]",
  },
  warning: {
    icon: <AlertTriangleIcon className="size-8 text-[#ffcc08]" />,
    confirmButtonClass: "bg-yellow-600 hover:bg-[#ffcc08] text-white",
    titleClass: "text-black",
  },
}

export const useDynamicDialog = create<DialogStore>()(
  immer((set) => ({
    isOpen: false,
    title: undefined,
    description: undefined,
    children: undefined,
    variant: "default",
    confirmationType: undefined,
    icon: undefined,
    onConfirm: undefined,
    onCancel: undefined,
    confirmText: "Confirm",
    cancelText: "Cancel",
    dialogClassName: undefined,

    openDialog: (config) =>
      set((state) => {
        state.isOpen = true
        state.title = config.title
        state.description = config.description
        state.children = config.children
        state.variant = config.variant || "default"
        state.confirmationType = config.confirmationType
        state.icon = config.icon
        state.onConfirm = config.onConfirm
        state.onCancel = config.onCancel
        state.confirmText = config.confirmText
        state.cancelText = config.cancelText
        state.dialogClassName = config.dialogClassName || config.dialogClass
      }),

    openConfirmation: (config) => {
      const { type, ...rest } = config
      const { icon } = confirmationConfig[type]

      set((state) => {
        state.isOpen = true
        state.variant = "confirmation"
        state.confirmationType = type
        state.icon = icon
        state.dialogClassName = undefined
        state.title = rest.title
        state.description = rest.description
        state.onConfirm = rest.onConfirm
        state.onCancel = rest.onCancel
        state.confirmText = rest.confirmText
        state.cancelText = rest.cancelText
      })
    },

    closeDialog: () =>
      set((state) => {
        state.isOpen = false
        state.title = undefined
        state.description = undefined
        state.children = undefined
        state.variant = "default"
        state.confirmationType = undefined
        state.icon = undefined
        state.onConfirm = undefined
        state.onCancel = undefined
        state.confirmText = "Confirm"
        state.cancelText = "Cancel"
        state.dialogClassName = undefined
      }),

    setOpen: (open) =>
      set((state) => {
        state.isOpen = open
        if (!open) {
          state.title = undefined
          state.description = undefined
          state.children = undefined
          state.variant = "default"
          state.confirmationType = undefined
          state.icon = undefined
          state.onConfirm = undefined
          state.onCancel = undefined
          state.confirmText = "Confirm"
          state.cancelText = "Cancel"
          state.dialogClassName = undefined
        }
      }),
  })),
)
