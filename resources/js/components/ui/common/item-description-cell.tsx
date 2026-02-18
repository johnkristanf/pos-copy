import { Image as ImageIcon, QrCode } from "lucide-react"
import ImageComponent from "@/components/ui/media/image"
import { ImagePreview } from "@/components/ui/media/image-preview"
import { useDynamicDialog } from "@/hooks/ui/use-dynamic-dialog"
import { useImagePreviewStore } from "@/hooks/ui/use-image-preview"
import { Item } from "@/types"

type ItemWithOptionalIds = Omit<Item, "category_id" | "supplier_id"> & {
  category_id?: number
  supplier_id?: number
}

export const ItemDescriptionCell = ({
  item,
}: {
  item: ItemWithOptionalIds
}) => {
  const { openDialog } = useDynamicDialog()
  const { setImage } = useImagePreviewStore()

  const cleanImageUrl = item.image_url
    ? item.image_url.replace(/\\\//g, "/")
    : null

  const handleImageClick = (e: React.MouseEvent) => {
    e.stopPropagation()

    if (cleanImageUrl) {
      setImage(cleanImageUrl, {
        alt: item.description,
      })

      openDialog({
        title: "Preview Item Image",
        description: item.description,
        children: <ImagePreview />,
      })
    }
  }

  return (
    <div className="ml-5">
      <div className="font-medium flex items-center gap-3">
        <div
          onClick={handleImageClick}
          className="h-10 w-10 rounded-md bg-secondary/40 border border-border/50 flex items-center justify-center shrink-0 overflow-hidden cursor-pointer transition-transform hover:scale-105 hover:ring-2 hover:ring-primary/20"
        >
          {cleanImageUrl ? (
            <ImageComponent
              src={cleanImageUrl}
              alt={item.description}
              className="h-full w-full object-cover"
            />
          ) : (
            <ImageIcon className="h-5 w-5 text-muted-foreground/40" />
          )}
        </div>
        <div className="flex flex-col">
          <div className="font-medium">{item.description}</div>
          <kbd className="text-xs text-muted-foreground font-mono flex flex-row gap-1">
            <QrCode className="size-3.5" />
            {item.sku}
          </kbd>
        </div>
      </div>
    </div>
  )
}
