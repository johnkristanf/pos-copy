import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/common/button"
import { cn } from "@/lib/cn"

interface SidebarToggleProps {
  isOpen: boolean | undefined
  setIsOpen?: () => void
}

export const SidebarToggle = ({ isOpen, setIsOpen }: SidebarToggleProps) => {
  return (
    <div className="-right-4 bg-background rounded-lg invisible absolute top-3 z-20 lg:visible ">
      <Button
        onClick={() => setIsOpen?.()}
        className="size-8 rounde    d-md border-none"
        variant="bridge_digital"
        size="icon"
      >
        <ChevronLeft
          className={cn(
            "size-4 transition-transform duration-300 ease-in-out",
            isOpen === false ? "rotate-180" : "rotate-0",
          )}
        />
      </Button>
    </div>
  )
}
