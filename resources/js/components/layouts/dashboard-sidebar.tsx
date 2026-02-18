import { Sidebar } from "@/components/ui/sidebar/sidebar"
import { useSidebarToggle } from "@/hooks/ui/use-sidebar-toggle"
import { useStore } from "@/hooks/ui/use-store"
import { cn } from "@/lib/cn"

export const DashboardSideBar = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const sidebar = useStore(useSidebarToggle, (state) => state)
  if (!sidebar) return null
  return (
    <div>
      <Sidebar />
      <main
        className={cn(
          "z-20 min-h-[calc(100vh)] bg-zinc-50 transition-[margin-left] duration-300 ease-in-out dark:bg-zinc-900",
          sidebar?.isOpen === false ? "lg:ml-22.5" : "lg:ml-60",
        )}
      >
        {children}
      </main>
    </div>
  )
}
