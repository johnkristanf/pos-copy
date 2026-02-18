import { useEffect, useMemo } from "react"
import { match, P } from "ts-pattern"
import ImageComponent from "@/components/ui/media/image"
import { useImagePreviewStore } from "@/hooks/ui/use-image-preview"

type ImageSource = string | Blob | File | null | any

export const ImagePreview = () => {
  const { source: rawSource, alt } = useImagePreviewStore()

  const source = rawSource as ImageSource

  const objectUrl = useMemo(() => {
    if (source instanceof Blob || source instanceof File) {
      return URL.createObjectURL(source)
    }
    return null
  }, [source])

  useEffect(() => {
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [objectUrl])

  const displaySrc = match(source)
    .with(P.string, (url) => url)
    .with(P.instanceOf(Blob), () => objectUrl)
    .with(P.instanceOf(File), () => objectUrl)
    .otherwise(() => null)

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-[50vh] p-4 relative border-none shadow-none">
      {match(displaySrc)
        .with(P.string, (src) => (
          <ImageComponent
            src={src}
            alt={alt}
            className="max-h-[80vh] w-auto object-contain rounded-md animate-in zoom-in-95 duration-200"
          />
        ))
        .with(null, () => (
          <div className="bg-background/90 p-8 rounded-lg text-muted-foreground">
            No image source available
          </div>
        ))
        .exhaustive()}
    </div>
  )
}
