import { Link } from "@inertiajs/react"
import { DropdownMenuArrow } from "@radix-ui/react-dropdown-menu"
import { ChevronDown, LucideIcon } from "lucide-react"
import { useEffect, useRef } from "react"
import { Button } from "@/components/ui/common/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/common/collapsible"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/common/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/common/tooltip"
import { useSidebarToggle } from "@/hooks/ui/use-sidebar-toggle"
import { useStore } from "@/hooks/ui/use-store"
import { cn } from "@/lib/cn"
import { Submenu } from "../sidebar/menu-list"

interface CollapseMenuButtonProps {
  icon?: LucideIcon
  label?: string
  active?: boolean
  submenus: Submenu[]
  isOpen?: boolean
}

export function CollapseMenuButton({
  icon: Icon,
  label,
  active,
  submenus,
  isOpen,
}: CollapseMenuButtonProps) {
  const isSubmenuActive = submenus.some((submenu) => submenu.active)
  const sidebar = useStore(useSidebarToggle, (state) => state)

  const isCollapsed = sidebar?.openMenus[label || ""] ?? isSubmenuActive
  const hasInitialized = useRef(false)
  const userInteractedRef = useRef(false)

  const handleToggle = () => {
    if (label && sidebar?.toggleMenu) {
      userInteractedRef.current = true
      sidebar.toggleMenu(label)
    }
  }

  useEffect(() => {
    if (!hasInitialized.current && label && sidebar?.setMenuOpen) {
      if (isSubmenuActive) {
        sidebar.setMenuOpen(label, true)
      }
      hasInitialized.current = true
    }
  }, [])

  return isOpen ? (
    <Collapsible
      open={isCollapsed}
      onOpenChange={handleToggle}
      className="w-full"
    >
      <CollapsibleTrigger
        className="mb-1 [&[data-state=open]>div>div>svg]:rotate-180"
        asChild
      >
        <Button
          variant={active ? "secondary" : "ghost"}
          className="h-10 w-full justify-start"
        >
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center">
              <span className="mr-4">{Icon && <Icon size={18} />}</span>
              <p
                className={cn(
                  "max-w-37.5 truncate font-medium",
                  isOpen
                    ? "translate-x-0 opacity-100"
                    : "-translate-x-96 opacity-0",
                )}
              >
                {label}
              </p>
            </div>
            <div
              className={cn(
                "whitespace-nowrap",
                isOpen
                  ? "translate-x-0 opacity-100"
                  : "-translate-x-96 opacity-0",
              )}
            >
              <ChevronDown
                size={18}
                className="transition-transform duration-200"
              />
            </div>
          </div>
        </Button>
      </CollapsibleTrigger>

      <CollapsibleContent
        className={cn(
          "overflow-hidden",
          userInteractedRef.current &&
            "data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down",
        )}
      >
        <div className="relative ml-4 my-1 pl-3 border-l border-border/50 space-y-1">
          {submenus.map(({ href, label, active, icon: SubmenuIcon }, index) => (
            <div key={index} className="relative">
              {active && (
                <div className="absolute -left-3 top-0 bottom-0 w-0.5 bg-linear-to-b from-[#349083] to-[#e3ea4e]" />
              )}
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-8 w-full justify-start text-sm font-normal",
                  active
                    ? "text-foreground font-medium bg-accent/50"
                    : "text-muted-foreground hover:text-foreground",
                )}
                asChild
              >
                <Link href={href || "#"}>
                  {SubmenuIcon && (
                    <span className="mr-2 opacity-75">
                      <SubmenuIcon size={14} />
                    </span>
                  )}
                  <p
                    className={cn(
                      "max-w-42.5 truncate transition-all",
                      isOpen
                        ? "translate-x-0 opacity-100"
                        : "-translate-x-96 opacity-0",
                    )}
                  >
                    {label}
                  </p>
                </Link>
              </Button>
            </div>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  ) : (
    <DropdownMenu>
      <TooltipProvider disableHoverableContent>
        <Tooltip delayDuration={100}>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                variant={active ? "secondary" : "ghost"}
                className="mb-1 h-10 w-full justify-start"
              >
                <div className="flex w-full items-center justify-between">
                  <div className="flex items-center">
                    <span className={cn(isOpen === false ? "" : "mr-4")}>
                      {Icon && <Icon size={18} />}
                    </span>
                    <p
                      className={cn(
                        "max-w-50 truncate",
                        isOpen === false ? "opacity-0" : "opacity-100",
                      )}
                    >
                      {label}
                    </p>
                  </div>
                </div>
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="right" align="start" alignOffset={2}>
            {label}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <DropdownMenuContent side="right" sideOffset={25} align="start">
        <DropdownMenuLabel className="max-w-47.5 truncate">
          {label}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {submenus.map(({ href, label, icon: SubmenuIcon }, index) => (
          <DropdownMenuItem key={index} asChild>
            <Link className="cursor-pointer" href={href || "#"}>
              {SubmenuIcon && <SubmenuIcon size={16} className="mr-2" />}
              <p className="max-w-45 truncate transition-all duration-300 ease-in-out">
                {label}
              </p>
            </Link>
          </DropdownMenuItem>
        ))}
        <DropdownMenuArrow className="fill-border" />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
