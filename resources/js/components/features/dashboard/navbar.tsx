import { UserButton } from "@/components/features/dashboard/user-button"
import { SheetMenu } from "@/components/ui/sidebar/sheet-menu"
import { NotificationButton } from "./notification-button"

interface NavbarProps {
  title: string
  userId: number
}

interface NavbarItemProps {
  children: React.ReactNode
}

const NavbarItem: React.FC<NavbarItemProps> = ({ children }) => (
  <div className="transition-transform active:scale-95">{children}</div>
)

export const Navbar = ({ title, userId }: NavbarProps) => {
  return (
    <header className="sticky top-0 z-20 w-full bg-zinc-50">
      <nav className="flex h-14 sm:h-16 items-center justify-between px-4 sm:px-6 lg:px-8 max-w-full">
        <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
          <div className="shrink-0">
            <SheetMenu />
          </div>
          <h6 className="font-bold text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-foreground dark:text-white truncate min-w-0">
            {title}
          </h6>
        </div>

        <div className="flex items-center gap-1 sm:gap-2 md:gap-3 lg:gap-4 shrink-0 ml-2">
          <NotificationButton userId={userId} />
          <NavbarItem>
            <UserButton />
          </NavbarItem>
        </div>
      </nav>
    </header>
  )
}
