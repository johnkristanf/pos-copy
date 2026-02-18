import { AnimatePresence, motion } from "framer-motion"
import {
  ImageIcon,
  Layers,
  Package,
  QrCode,
  Ruler,
  Tag,
  User,
} from "lucide-react"
import { memo, useMemo } from "react"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/common/avatar"
import { Badge } from "@/components/ui/common/badge"
import { getCategoryIcon } from "@/components/ui/common/get-category-icon"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/common/pop-over"
import { ImagePreview } from "@/components/ui/media/image-preview"
import { useDynamicDialog } from "@/hooks/ui/use-dynamic-dialog"
import { useImagePreviewStore } from "@/hooks/ui/use-image-preview"
import { OrderableItem } from "@/types"
import ImageComponent from "../media/image"
import { TruncateText } from "./truncate-text"

interface ItemDetailsProps {
  item: OrderableItem
}

const TRUNCATE_LENGTHS = {
  DESCRIPTION: 17,
  ATTRIBUTE: 15,
  CATEGORY: 15,
  SUPPLIER: 15,
} as const

const STATUS_VARIANTS = {
  available: {
    label: "Available",
    className:
      "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50",
    icon: "●",
  },
  low: {
    label: "Low Stock",
    className: "bg-red-50 text-red-700 border-red-200 hover:bg-red-50",
    icon: "⚠",
  },
  overstock: {
    label: "Overstock",
    className: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50",
    icon: "▲",
  },
} as const

const popoverVariants = {
  hidden: { opacity: 0, scale: 0.95, y: -10 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 24,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: -10,
    transition: { duration: 0.15 },
  },
}

const sectionVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.05,
      duration: 0.2,
    },
  }),
}

export const ItemDetails = memo(function ItemDetails({
  item,
}: ItemDetailsProps) {
  const { openDialog } = useDynamicDialog()
  const { setImage } = useImagePreviewStore()

  const cleanImageUrl = useMemo(
    () => item.image_url?.replace(/\\\//g, "/") ?? null,
    [item.image_url],
  )

  const itemInitials = useMemo(
    () => item.description.substring(0, 2).toUpperCase(),
    [item.description],
  )

  const status = useMemo(() => {
    const totalStock =
      item.stocks?.reduce((acc, s) => acc + s.available_quantity, 0) ?? 0
    const min = item.min_quantity ?? 0
    const max = item.max_quantity ?? Infinity

    if (totalStock <= min) return STATUS_VARIANTS.low
    if (totalStock >= max) return STATUS_VARIANTS.overstock
    return STATUS_VARIANTS.available
  }, [item.stocks, item.min_quantity, item.max_quantity])

  const hasAttributes = useMemo(
    () => !!(item.brand || item.size || item.color),
    [item.brand, item.size, item.color],
  )

  const handleImageClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!cleanImageUrl) return

    setImage(cleanImageUrl, { alt: item.description })
    openDialog({
      title: "Preview Item Image",
      description: item.description,
      children: <ImagePreview />,
    })
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="ml-2 flex items-center gap-3 cursor-pointer group">
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

          <div className="flex flex-col text-left max-w-50 min-w-0">
            <span
              className="font-semibold text-sm truncate group-hover:text-primary transition-colors"
              title={item.description}
            >
              <TruncateText
                text={item.description ?? "Unknown Item"}
                maxLength={TRUNCATE_LENGTHS.DESCRIPTION}
              />
            </span>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
              <QrCode className="size-3 shrink-0" />
              <span className="truncate">{item.sku}</span>
            </div>
          </div>
        </div>
      </PopoverTrigger>

      <PopoverContent
        className="w-96 p-0 overflow-hidden border-border/50 shadow-lg"
        align="start"
        asChild
      >
        <motion.div
          variants={popoverVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <div className="max-h-128 overflow-y-auto">
            <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b px-4 py-3">
              <div className="flex items-start gap-3">
                <Avatar className="size-12 rounded-lg border-2">
                  <AvatarImage
                    src={cleanImageUrl ?? ""}
                    alt={item.description}
                  />
                  <AvatarFallback className="rounded-lg bg-linear-to-br from-primary/10 to-primary/5">
                    {itemInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm leading-tight wrap-break-word">
                    {item.description}
                  </h3>
                  <p className="text-xs text-muted-foreground font-mono mt-1">
                    {item.sku}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 space-y-5">
              <motion.div
                className="space-y-2.5"
                custom={0}
                variants={sectionVariants}
                initial="hidden"
                animate="visible"
              >
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Package className="size-3.5" /> Stock Status
                </h4>
                <Badge
                  variant="outline"
                  className={`${status.className} font-medium text-xs px-3 py-1.5`}
                >
                  <span className="mr-1.5">{status.icon}</span>
                  {status.label}
                </Badge>
              </motion.div>

              <motion.div
                className="space-y-2.5"
                custom={1}
                variants={sectionVariants}
                initial="hidden"
                animate="visible"
              >
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Tag className="size-3.5" /> Attributes
                </h4>
                <AnimatePresence mode="wait">
                  {!hasAttributes ? (
                    <motion.span
                      key="no-attributes"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-muted-foreground text-xs italic block"
                    >
                      No attributes set
                    </motion.span>
                  ) : (
                    <motion.div
                      key="attributes"
                      className="flex flex-wrap gap-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      {item.brand && (
                        <Badge
                          variant="outline"
                          className="gap-1.5 font-normal px-2.5 py-1.5 h-auto border-border/50 hover:border-primary/30 transition-colors"
                        >
                          <Tag className="size-3 text-muted-foreground shrink-0" />
                          <TruncateText
                            text={item.brand}
                            maxLength={TRUNCATE_LENGTHS.ATTRIBUTE}
                            className="capitalize text-xs"
                          />
                        </Badge>
                      )}
                      {item.size && (
                        <Badge
                          variant="secondary"
                          className="gap-1.5 font-normal px-2.5 py-1.5 h-auto hover:bg-secondary/80 transition-colors"
                        >
                          <Ruler className="size-3 text-muted-foreground shrink-0" />
                          <TruncateText
                            text={item.size}
                            maxLength={TRUNCATE_LENGTHS.ATTRIBUTE}
                            className="text-xs"
                          />
                        </Badge>
                      )}
                      {item.color && (
                        <Badge
                          variant="secondary"
                          className="gap-1.5 font-normal px-2.5 py-1.5 h-auto hover:bg-secondary/80 transition-colors"
                        >
                          <div
                            className="size-3 rounded-full border border-border shadow-sm shrink-0"
                            style={{ backgroundColor: item.color }}
                          />
                          <TruncateText
                            text={item.color}
                            maxLength={TRUNCATE_LENGTHS.ATTRIBUTE}
                            className="capitalize text-xs"
                          />
                        </Badge>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              <motion.div
                className="space-y-2.5"
                custom={2}
                variants={sectionVariants}
                initial="hidden"
                animate="visible"
              >
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Layers className="size-3.5" /> Category
                </h4>
                <Badge
                  variant="outline"
                  className="gap-2 font-normal px-2.5 py-1.5 h-auto border-border/50 hover:border-primary/30 transition-colors"
                >
                  <span className="shrink-0 flex items-center">
                    {item.category?.name
                      ? getCategoryIcon(item.category.name)
                      : null}
                  </span>
                  <TruncateText
                    text={item.category?.name ?? "Uncategorized"}
                    maxLength={TRUNCATE_LENGTHS.CATEGORY}
                    className="text-xs"
                  />
                </Badge>
              </motion.div>

              <motion.div
                className="space-y-2.5"
                custom={3}
                variants={sectionVariants}
                initial="hidden"
                animate="visible"
              >
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <User className="size-3.5" /> Supplier
                </h4>
                <div className="text-sm font-medium wrap-break-word bg-secondary/30 px-3 py-2 rounded-md">
                  <TruncateText
                    text={item.supplier?.name ?? "Unknown Supplier"}
                    maxLength={TRUNCATE_LENGTHS.SUPPLIER}
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </PopoverContent>
    </Popover>
  )
})
