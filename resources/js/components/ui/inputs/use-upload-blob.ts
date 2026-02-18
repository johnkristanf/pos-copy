import { immer } from "zustand/middleware/immer"
import { createStore } from "zustand/vanilla"

interface UploadState {
  progress: number
  isUploading: boolean
  isDragActive: boolean
  error: string | null
  actions: {
    setProgress: (progress: number) => void
    setIsUploading: (isUploading: boolean) => void
    setDragActive: (isActive: boolean) => void
    setError: (error: string | null) => void
    reset: () => void
  }
}

export type BlobUploadStore = ReturnType<typeof createBlobUploadStore>

export const createBlobUploadStore = () =>
  createStore<UploadState>()(
    immer((set) => ({
      progress: 0,
      isUploading: false,
      isDragActive: false,
      error: null,
      actions: {
        setProgress: (progress) =>
          set((state) => {
            state.progress = progress
          }),
        setIsUploading: (isUploading) =>
          set((state) => {
            state.isUploading = isUploading
          }),
        setDragActive: (isActive) =>
          set((state) => {
            state.isDragActive = isActive
          }),
        setError: (error) =>
          set((state) => {
            state.error = error
          }),
        reset: () =>
          set((state) => {
            state.progress = 0
            state.isUploading = false
            state.isDragActive = false
            state.error = null
          }),
      },
    })),
  )
