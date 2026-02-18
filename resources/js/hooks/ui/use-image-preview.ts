import { parseAsBoolean } from "nuqs"
import { create } from "zustand"
import { immer } from "zustand/middleware/immer"

type ImageSource = string | Blob | File | null

interface ImagePreviewState {
  source: ImageSource
  alt: string
  mimeType: string | null
}

interface ImagePreviewActions {
  setImage: (
    source: ImageSource,
    meta?: { alt?: string; mimeType?: string },
  ) => void
  reset: () => void
}

export const previewDialogParsers = {
  previewOpen: parseAsBoolean.withDefault(false),
}

export const useImagePreviewStore = create<
  ImagePreviewState & ImagePreviewActions
>()(
  immer((set) => ({
    source: null,
    alt: "Preview",
    mimeType: null,

    setImage: (source, meta) =>
      set((state) => {
        state.source = source
        if (meta?.alt) state.alt = meta.alt
        if (meta?.mimeType) state.mimeType = meta.mimeType
      }),

    reset: () =>
      set((state) => {
        state.source = null
        state.alt = "Preview"
        state.mimeType = null
      }),
  })),
)
