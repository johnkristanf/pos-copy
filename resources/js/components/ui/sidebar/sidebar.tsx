import { Link } from "@inertiajs/react"
import { Button } from "@/components/ui/common/button"
import { Menu } from "@/components/ui/sidebar/menu"
import { SidebarToggle } from "@/components/ui/sidebar/sidebar-toggle"
import { useSidebarToggle } from "@/hooks/ui/use-sidebar-toggle"
import { useStore } from "@/hooks/ui/use-store"
import { cn } from "@/lib/cn"

interface SidebarProps {
  title?: string
  homeUrl?: string
}

export const Sidebar = ({
  title = "BridgePOS",
  homeUrl = "/",
}: SidebarProps) => {
  const sidebar = useStore(useSidebarToggle, (state) => state)

  if (!sidebar) return null

  return (
    <aside
      className={cn(
        "-translate-x-full fixed top-0 left-0 z-30 h-screen transition-[width] duration-300 ease-in-out lg:translate-x-0",
        sidebar?.isOpen === false ? "w-22.5" : "w-60",
      )}
    >
      <SidebarToggle isOpen={sidebar?.isOpen} setIsOpen={sidebar?.setIsOpen} />
      <div className="relative flex h-full flex-col overflow-y-auto px-3 py-4 shadow-md">
        <Button
          className={cn(
            "mb-1 transition-all duration-300 ease-in-out",
            sidebar?.isOpen === false ? "translate-x-1" : "translate-x-0",
          )}
          variant="link"
          asChild
        >
          <Link
            href={homeUrl}
            className="flex items-center gap-2"
            prefetch={["mount", "hover"]}
          >
            {sidebar?.isOpen ? (
              <span className="font-semibold text-base dark:text-white transition-opacity duration-300">
                {title}
              </span>
            ) : (
              <span className="font-semibold text-base dark:text-white transition-opacity duration-300">
                POS
              </span>
            )}
          </Link>
        </Button>
        <Menu isOpen={sidebar?.isOpen} />
      </div>
    </aside>
  )
}
