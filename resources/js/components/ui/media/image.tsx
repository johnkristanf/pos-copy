import { LazyLoadImage } from "react-lazy-load-image-component"
import "react-lazy-load-image-component/src/effects/blur.css"
import { cn } from "@/lib/cn"

interface ImageComponentProps {
  src: string
  alt: string
  height?: string | number
  width?: string | number
  caption?: string
  className?: string
  wrapperClassName?: string
  imageClassName?: string
  captionClassName?: string
  disableEffect?: boolean
  objectFit?: "cover" | "contain" | "fill" | "none" | "scale-down"
  objectPosition?: string
  loading?: "lazy" | "eager"
  onLoad?: () => void
  onError?: () => void
  placeholder?: string
  formatParam?: string
  /**
   * If true, will only serve WebP without fallback (use when you know browser supports WebP)
   */
  webpOnly?: boolean
  /**
   * Additional sources for different formats (avif, jpg, png, etc.)
   */
  additionalSources?: Array<{
    srcSet: string
    type: string
    media?: string
  }>
}

/**
 * ImageComponent automatically serves WebP version when supported with fallback to original format.
 * Includes automatic URL cleaning to remove escaped slashes.
 */
const ImageComponent = ({
  src,
  alt,
  height,
  width,
  caption,
  className,
  wrapperClassName,
  imageClassName,
  captionClassName,
  disableEffect = false,
  objectFit = "cover",
  objectPosition = "center",
  loading = "lazy",
  onLoad,
  onError,
  placeholder,
  formatParam = "?format=webp",
  webpOnly = false,
  additionalSources = [],
}: ImageComponentProps) => {
  const cleanedSrc = src ? src.replace(/\\\//g, "/") : ""

  const webpSrc = cleanedSrc.includes("?")
    ? `${cleanedSrc}&format=webp`
    : `${cleanedSrc}${formatParam}`

  const renderImageElement = () => {
    const commonProps = {
      alt,
      height,
      width,
      loading,
      onLoad,
      onError,
      className: cn("h-full w-full", `object-${objectFit}`, imageClassName),
      style: { objectPosition },
    }

    if (disableEffect) {
      return <img {...commonProps} src={cleanedSrc} alt={alt} />
    }

    return (
      <LazyLoadImage
        {...commonProps}
        src={cleanedSrc}
        effect="blur"
        wrapperClassName={cn("h-full w-full", wrapperClassName)}
        placeholderSrc={placeholder}
      />
    )
  }

  return (
    <div className={cn("relative", className)}>
      <picture>
        <source srcSet={webpSrc} type="image/webp" />

        {additionalSources.map((source, index) => (
          <source
            key={index}
            srcSet={source.srcSet}
            type={source.type}
            media={source.media}
          />
        ))}

        {!webpOnly && renderImageElement()}

        {webpOnly &&
          (disableEffect ? (
            <img
              src={webpSrc}
              alt={alt}
              height={height}
              width={width}
              loading={loading}
              onLoad={onLoad}
              onError={onError}
              className={cn(
                "h-full w-full",
                `object-${objectFit}`,
                imageClassName,
              )}
              style={{ objectPosition }}
            />
          ) : (
            <LazyLoadImage
              src={webpSrc}
              alt={alt}
              height={height}
              width={width}
              effect="blur"
              wrapperClassName={cn("h-full w-full", wrapperClassName)}
              className={cn(
                "h-full w-full",
                `object-${objectFit}`,
                imageClassName,
              )}
              style={{ objectPosition }}
              loading={loading}
              onLoad={onLoad}
              onError={onError}
              placeholderSrc={placeholder}
            />
          ))}
      </picture>

      {caption && (
        <span
          className={cn(
            "mt-2 block text-sm text-muted-foreground",
            captionClassName,
          )}
        >
          {caption}
        </span>
      )}
    </div>
  )
}

export default ImageComponent
