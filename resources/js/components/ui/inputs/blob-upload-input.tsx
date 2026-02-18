import { useMutation } from "@tanstack/react-query"
import axios from "axios"
import { AnimatePresence, motion, useMotionValue } from "framer-motion"
import {
  AlertTriangle,
  Check,
  FileText,
  Loader2,
  Trash2,
  Upload,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react"
import { useEffect, useId, useMemo, useRef, useState } from "react"
import { useStore } from "zustand"
import { Button } from "@/components/ui/common/button"
import { API_ROUTES } from "@/config/api-routes"
import { cn } from "@/lib/cn"
import { formatBytes } from "@/lib/format"
import { createBlobUploadStore } from "./use-upload-blob"

const TARGET_DIMENSION = 450

export interface BlobUploadInputProps {
  value: any
  itemId?: number
  onChange: (value: any) => void
  disabled?: boolean
  accept?: string
  isUserSignature?: boolean
  fieldName?: string
}

interface NormalizedFile {
  url: string
  name: string
  size: number
  type: string
  isImage: boolean
  isPending?: boolean
}

const normalizeValue = (value: any): NormalizedFile | null => {
  if (!value) return null

  if (value instanceof File) {
    return {
      url: URL.createObjectURL(value),
      name: value.name,
      size: value.size,
      type: value.type,
      isImage: value.type.startsWith("image/"),
      isPending: true,
    }
  }

  if (typeof value === "string") {
    return {
      url: value,
      name: value.split("/").pop() || "Attached File",
      size: 0,
      type: "application/octet-stream",
      isImage: true,
    }
  }

  const mimeType =
    value.mime_type ||
    (value.fileType === "image" ? "image/webp" : "application/octet-stream")
  const url = value.file_url || value.image_url || value.url

  return {
    url,
    name: value.file_name || value.name || "File",
    size: value.file_size || value.size || 0,
    type: mimeType,
    isImage: mimeType.startsWith("image/") || value.fileType === "image",
  }
}

const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.src = src
    img.onload = () => resolve(img)
    img.onerror = reject
  })
}

const DeleteConfirmation = ({
  isOpen,
  onClose,
  onConfirm,
}: {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-100 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={(e) => e.stopPropagation()}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative w-full max-w-sm overflow-hidden rounded-xl border border-border bg-card shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center p-6 text-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 border border-amber-500/20">
                <AlertTriangle className="h-6 w-6 text-amber-500" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-foreground">
                  Remove Attachment
                </h3>
                <p className="text-sm text-muted-foreground">
                  Are you sure you want to remove this file? It will be deleted
                  permanently when you save changes.
                </p>
              </div>

              <div className="flex w-full gap-2">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                  type="button"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={onConfirm}
                  className="flex-1 gap-2"
                  type="button"
                >
                  Remove
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

const ImageCropper = ({
  imageSrc,
  onCancel,
  onCrop,
}: {
  imageSrc: string
  onCancel: () => void
  onCrop: (file: File) => void
}) => {
  const [zoom, setZoom] = useState(1)
  const [isDragging, setIsDragging] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)

  const x = useMotionValue(0)
  const y = useMotionValue(0)

  useEffect(() => {
    const init = async () => {
      const img = await loadImage(imageSrc)
      const ratio = Math.max(
        TARGET_DIMENSION / img.width,
        TARGET_DIMENSION / img.height,
      )
      setZoom(ratio)
    }
    init()
  }, [imageSrc])

  const handleSave = async () => {
    if (!imageRef.current || !containerRef.current) return

    const canvas = document.createElement("canvas")
    canvas.width = TARGET_DIMENSION
    canvas.height = TARGET_DIMENSION
    const ctx = canvas.getContext("2d")

    if (!ctx) return

    const img = await loadImage(imageSrc)

    const currentX = x.get()
    const currentY = y.get()

    ctx.clearRect(0, 0, TARGET_DIMENSION, TARGET_DIMENSION)
    ctx.translate(TARGET_DIMENSION / 2, TARGET_DIMENSION / 2)
    ctx.translate(currentX, currentY)
    ctx.scale(zoom, zoom)
    ctx.drawImage(img, -img.width / 2, -img.height / 2)

    canvas.toBlob(
      (blob) => {
        if (blob) {
          const file = new File([blob], "cropped_image.webp", {
            type: "image/webp",
          })
          onCrop(file)
        }
      },
      "image/webp",
      1.0,
    )
  }

  const checkerboardUrl =
    "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbC1vcGFjaXR5PSIwLjEiPjxyZWN0IHg9IjEwIiB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIC8+PHJlY3QgeT0iMTAiIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCIgLz48L3N2Zz4="

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-100 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative w-full max-w-lg overflow-hidden rounded-xl border border-border bg-card shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b p-4">
            <h3 className="font-semibold text-foreground">Adjust Image</h3>
            <Button
              size="icon"
              variant="ghost"
              onClick={onCancel}
              type="button"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="relative flex flex-col items-center bg-neutral-900 p-6 sm:p-8">
            <div
              ref={containerRef}
              className="relative aspect-square w-112.5 max-w-full overflow-hidden rounded-md border-2 border-primary/50 bg-neutral-800 shadow-2xl"
            >
              <div
                className="absolute inset-0 pointer-events-none opacity-20 bg-size-[20px_20px] bg-repeat"
                style={{ backgroundImage: `url('${checkerboardUrl}')` }}
              />

              <motion.img
                ref={imageRef}
                src={imageSrc}
                alt="Crop preview"
                drag
                dragConstraints={containerRef}
                dragElastic={0.05}
                style={{ x, y, scale: zoom }}
                onDragStart={() => setIsDragging(true)}
                onDragEnd={() => setIsDragging(false)}
                className={cn(
                  "absolute left-1/2 top-1/2 max-w-none -translate-x-1/2 -translate-y-1/2 touch-none select-none",
                  isDragging ? "cursor-grabbing" : "cursor-grab",
                )}
                draggable={false}
              />

              <div className="pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-3">
                {[...Array(9)].map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "border-white/20",
                      i < 3 && "border-b",
                      i % 3 !== 2 && "border-r",
                      i >= 6 && "border-b-0",
                    )}
                  />
                ))}
              </div>
            </div>

            <div
              className="mt-6 flex w-full max-w-75 items-center gap-4"
              onClick={(e) => e.stopPropagation()}
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setZoom(Math.max(0.1, zoom - 0.1))}
                type="button"
                className="hover:bg-white/10 text-muted-foreground hover:text-white"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>

              <input
                type="range"
                min={0.1}
                max={3}
                step={0.01}
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                className="h-2 flex-1 cursor-pointer appearance-none rounded-full bg-secondary accent-primary"
              />

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setZoom(Math.min(3, zoom + 0.1))}
                type="button"
                className="hover:bg-white/10 text-muted-foreground hover:text-white"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex justify-end gap-2 bg-muted/30 p-4 border-t">
            <Button variant="outline" onClick={onCancel} type="button">
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!imageSrc}
              variant={"bridge_digital"}
              type="button"
            >
              <Check className="mr-2 h-4 w-4" />
              Apply Crop
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

const FileCard = ({
  file,
  onRemove,
  progress,
  isUploading,
  isUserSignature,
}: {
  file: NormalizedFile
  onRemove: () => void
  progress: number
  isUploading: boolean
  isUserSignature?: boolean
}) => {
  return (
    <div className="group relative flex w-full items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-sm transition-all hover:shadow-md">
      {!isUserSignature && (
        <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-secondary/20 border border-border/50">
          {file.isImage ? (
            <img
              src={file.url}
              alt={file.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <FileText className="h-8 w-8 text-muted-foreground" />
          )}
        </div>
      )}

      <div className="flex flex-1 flex-col overflow-hidden">
        <span className="truncate block font-medium text-sm text-muted-foreground">
          {file.name}
        </span>
        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
          <span className="uppercase font-semibold tracking-wider text-[10px]">
            {file.type.split("/")[1] || "FILE"}
          </span>
          {file.size > 0 && (
            <>
              <span className="h-1 w-1 rounded-full bg-muted-foreground/30" />
              <span>{formatBytes(file.size)}</span>
            </>
          )}
          {file.isPending && !isUploading && (
            <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700">
              Ready
            </span>
          )}
        </div>
        {isUploading && (
          <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={onRemove}
          disabled={isUploading}
          type="button"
          className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          {isUploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  )
}

export const BlobUploadInput = ({
  value,
  itemId,
  onChange,
  disabled,
  accept,
  isUserSignature = false,
  fieldName,
}: BlobUploadInputProps) => {
  const inputId = useId()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [cropFile, setCropFile] = useState<string | null>(null)

  const blobUploadStore = useMemo(() => {
    const uniqueKey = `${fieldName}-${inputId}`
    return createBlobUploadStore()
  }, [fieldName, inputId])

  const { progress, isUploading, isDragActive, error } =
    useStore(blobUploadStore)
  const { setProgress, setIsUploading, setDragActive, setError, reset } =
    useStore(blobUploadStore, (state) => state.actions)

  const normalizedFile = useMemo(() => normalizeValue(value), [value])

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      setIsUploading(true)
      setError(null)
      const formData = new FormData()
      formData.append("file", file)
      formData.append("item_id", itemId?.toString() || "")

      return axios.post(API_ROUTES.UPLOAD_BLOB_ATTACHMENTS, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (ev) => {
          const total = ev.total || 1
          setProgress(Math.round((ev.loaded / total) * 100))
        },
      })
    },
    onSuccess: (response) => {
      const data = response.data.success || response.data
      const resultUrl = data.url || data.file_url
      onChange(resultUrl)
      reset()
    },
    onError: (err) => {
      console.error(err)
      setError("Upload failed. Please try again.")
      setIsUploading(false)
    },
  })

  const processUpload = (file: File) => {
    uploadMutation.mutate(file)
  }

  const validateAndProcess = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      processUpload(file)
      return
    }

    try {
      const url = URL.createObjectURL(file)
      const img = await loadImage(url)

      const isValidSize =
        img.width === TARGET_DIMENSION && img.height === TARGET_DIMENSION

      if (isValidSize) {
        processUpload(file)
      } else {
        setCropFile(url)
      }
    } catch (e) {
      setError("Failed to validate image.")
    }
  }

  const handleDelete = () => {
    onChange(null)
    setShowDeleteConfirm(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files?.[0]) {
      validateAndProcess(e.dataTransfer.files[0])
    }
  }

  return (
    <>
      <DeleteConfirmation
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
      />

      {cropFile && (
        <ImageCropper
          imageSrc={cropFile}
          onCancel={() => setCropFile(null)}
          onCrop={(croppedFile) => {
            setCropFile(null)
            processUpload(croppedFile)
          }}
        />
      )}

      <div className="w-full space-y-3">
        {normalizedFile ? (
          <FileCard
            file={normalizedFile}
            onRemove={() => setShowDeleteConfirm(true)}
            progress={progress}
            isUploading={isUploading}
            isUserSignature={isUserSignature}
          />
        ) : (
          <div
            className={cn(
              "relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-all duration-200 ease-in-out cursor-pointer w-full",
              isDragActive
                ? "border-primary bg-primary/5 scale-[1.01]"
                : "border-muted-foreground/20 hover:border-primary/50 hover:bg-muted/5",
              (disabled || isUploading) && "cursor-not-allowed opacity-60",
              error && "border-destructive/50 bg-destructive/5",
            )}
            onDragEnter={(e) => {
              e.preventDefault()
              setDragActive(true)
            }}
            onDragLeave={(e) => {
              e.preventDefault()
              setDragActive(false)
            }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
          >
            <input
              id={inputId}
              type="file"
              className="absolute inset-0 z-50 cursor-pointer opacity-0"
              onChange={(e) => {
                if (e.target.files?.[0]) validateAndProcess(e.target.files[0])
                e.target.value = ""
              }}
              disabled={disabled || isUploading}
              accept={accept}
            />

            {isUploading ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <span className="text-xs font-bold text-primary">
                  {progress}%
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-center">
                <div
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-full bg-secondary/50 shadow-sm",
                    isDragActive && "bg-background shadow-md",
                  )}
                >
                  <Upload
                    className={cn(
                      "h-6 w-6 transition-colors",
                      isDragActive ? "text-primary" : "text-muted-foreground",
                      error && "text-destructive",
                    )}
                  />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold">
                    <span className="text-primary hover:underline">
                      Click to upload
                    </span>{" "}
                    or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Required: {TARGET_DIMENSION}x{TARGET_DIMENSION}px
                  </p>
                  {error && (
                    <p className="text-xs font-medium text-destructive mt-2">
                      {error}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}
