import { format } from "date-fns"
import { FileText, Loader2 } from "lucide-react"
import { parseAsInteger, useQueryState } from "nuqs"
import { useEffect } from "react"
import toast from "react-hot-toast"

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/common/command"
import { useGetDraftedOrders } from "@/hooks/api/use-get-drafted-orders"
import { useDynamicDialog } from "@/hooks/ui/use-dynamic-dialog"
import { cn } from "@/lib/cn"
import { formatCurrency } from "@/lib/format"
import { Order } from "@/types"

import { useCreateOrderActions } from "./use-create-order-store"
import { useDraftOrderActions } from "./use-draft-order-store"

export const DraftOrders = () => {
  const { data: drafts, isLoading } = useGetDraftedOrders()
  const { closeDialog } = useDynamicDialog()
  const { addItem, resetSelection } = useCreateOrderActions()
  const { setCustomer, setPaymentMethod, resetDraft, setDraftId } =
    useDraftOrderActions()

  const [highlightId, setHighlightId] = useQueryState(
    "highlight",
    parseAsInteger,
  )

  useEffect(() => {
    if (highlightId && !isLoading && drafts?.length) {
      const scrollTimer = setTimeout(() => {
        const element = document.getElementById(`draft-${highlightId}`)
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" })
        }
      }, 300)

      const clearTimer = setTimeout(() => {
        setHighlightId(null)
      }, 5000)

      return () => {
        clearTimeout(scrollTimer)
        clearTimeout(clearTimer)
      }
    }
  }, [highlightId, isLoading, drafts, setHighlightId])

  const handleSelectDraft = (draft: Order) => {
    try {
      resetSelection()
      resetDraft()
      setDraftId(draft.id)

      if (draft.customer) {
        setCustomer(draft.customer)
      }

      if (draft.payment_method) {
        setPaymentMethod(draft.payment_method)
      }

      draft.order_items?.forEach((orderItem) => {
        if (orderItem.item) {
          const uomId =
            orderItem.selected_uom_id || orderItem.pivot?.selected_uom_id

          if (uomId) {
            addItem(orderItem.item, orderItem.quantity, uomId)
          } else {
            console.warn(
              `Missing UOM for item ${orderItem.item.id} in draft ${draft.id}`,
            )
          }
        }
      })

      toast.success("Draft loaded successfully")
      closeDialog()
    } catch (error) {
      console.error(error)
      toast.error("Failed to load draft data")
    }
  }

  return (
    <Command className="h-100 w-full border-none shadow-none">
      <CommandInput placeholder="Search drafts by customer..." />
      <CommandList>
        {isLoading && (
          <div className="flex items-center justify-center gap-2 py-6 text-center text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading drafts...
          </div>
        )}

        {!isLoading && drafts?.length === 0 && (
          <CommandEmpty>No drafts found.</CommandEmpty>
        )}

        <CommandGroup heading="Recent Drafts">
          {drafts?.map((draft) => (
            <CommandItem
              key={draft.id}
              id={`draft-${draft.id}`}
              onSelect={() => handleSelectDraft(draft)}
              className={cn(
                "flex cursor-pointer items-center justify-between py-3 transition-all duration-500",
                highlightId === draft.id &&
                  "bg-linear-to-r from-[#349083]/10 to-[#e3ea4e]/10 border-y-2 border-transparent [border-image:linear-gradient(to_right,#349083,#e3ea4e)1]",
              )}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <FileText className="h-4 w-4" />
                </div>
                <div className="flex flex-col">
                  <span className="font-medium">
                    {draft.customer?.name || "Unknown Customer"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {format(
                      new Date(draft.created_at),
                      "MMM d, yyyy 'at' h:mm a",
                    )}
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="font-semibold text-sm">
                  {formatCurrency(Number(draft.total_payable))}
                </span>
                <span className="rounded bg-secondary px-1.5 py-0.5 uppercase text-[10px] text-muted-foreground">
                  {draft.payment_method?.name}
                </span>
              </div>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  )
}
