import { Link, usePage } from "@inertiajs/react"
import { Ellipsis } from "lucide-react"
import { useEffect } from "react"

import { Button } from "@/components/ui/common/button"
import { ScrollArea } from "@/components/ui/common/scroll-area"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/common/tooltip"
import { useRolePermissionFeatureViewer } from "@/hooks/ui/use-role-permission-viewer"
import { cn } from "@/lib/cn"
import { SharedData } from "@/types"
import { CollapseMenuButton } from "../common/collapse-menu-button"
import { getMenuList, Menu as MenuType } from "./menu-list"

interface MenuProps {
  isOpen?: boolean
}

export const Menu = ({ isOpen }: MenuProps) => {
  const { url, props } = usePage<SharedData>()
  const { auth } = props
  const { setUser, viewWrapper } = useRolePermissionFeatureViewer()

  useEffect(() => {
    if (auth.user) {
      setUser(auth.user)
    }
  }, [auth.user, setUser])

  const menuList = getMenuList(url)
    .map((group) => {
      const menus = group.menus || []

      const filteredMenus = menus.reduce<MenuType[]>((acc, menu) => {
        const isParentAllowed = viewWrapper(
          menu.allowedRoles,
          menu.allowedFeatures,
          menu.allowedDepartments,
          menu.allowedPermissions,
          auth.user,
        )

        const filteredSubmenus = (menu.submenus || []).filter((submenu) =>
          viewWrapper(
            submenu.allowedRoles,
            submenu.allowedFeatures,
            submenu.allowedDepartments,
            submenu.allowedPermissions,
            auth.user,
          ),
        )

        if (isParentAllowed) {
          if (menu.submenus && menu.submenus.length > 0) {
            if (filteredSubmenus.length > 0) {
              acc.push({ ...menu, submenus: filteredSubmenus })
            }
          } else {
            acc.push(menu)
          }
        }

        return acc
      }, [])

      return {
        ...group,
        menus: filteredMenus,
      }
    })
    .filter((group) => group.menus && group.menus.length > 0)

  return (
    <ScrollArea className="[&>div>div[style]]:block! text-foreground">
      <nav className="mt-2">
        <ul className="flex min-h-[calc(100vh-48px-36px-16px-32px)] flex-col items-start space-y-1 px-2 lg:min-h-[calc(100vh-32px-40px-32px)]">
          {menuList.map(({ groupLabel, menus }, index) => (
            <li className={cn("w-full", groupLabel ? "pt-5" : "")} key={index}>
              {(isOpen && groupLabel) || isOpen === undefined ? (
                <p className="max-w-70 truncate px-4 pb-2 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                  {groupLabel}
                </p>
              ) : !isOpen && isOpen !== undefined && groupLabel ? (
                <TooltipProvider>
                  <Tooltip delayDuration={100}>
                    <TooltipTrigger className="w-full">
                      <div className="flex w-full items-center justify-center">
                        <Ellipsis className="size-5 text-muted-foreground" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>{groupLabel}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                <p className="pb-2" />
              )}

              {menus?.map(
                ({ href, label, icon: Icon, active, submenus }, menuIndex) =>
                  !submenus || submenus.length === 0 ? (
                    <div className="w-full" key={menuIndex}>
                      <TooltipProvider disableHoverableContent>
                        <Tooltip delayDuration={100}>
                          <TooltipTrigger asChild>
                            <Button
                              variant={active ? "secondary" : "ghost"}
                              className={cn(
                                "mb-1 h-10 w-full justify-start relative",
                                active
                                  ? "bg-secondary text-secondary-foreground hover:bg-secondary/80 dark:bg-[#181818FF] hover:text-black/80 dark:text-white dark:hover:bg-[#181818FF]/50"
                                  : "hover:bg-accent hover:text-accent-foreground dark:hover:bg-[#181818FF]/50 dark:hover:text-white",
                              )}
                              asChild
                            >
                              <Link href={href || "#"}>
                                <span
                                  className={cn(
                                    isOpen === false ? "-ml-1" : "mr-4",
                                    "transition-all",
                                  )}
                                >
                                  {Icon && <Icon size={18} />}
                                </span>
                                <p
                                  className={cn(
                                    "max-w-62.5 truncate font-medium",
                                    isOpen === false
                                      ? "-translate-x-96 opacity-0"
                                      : "translate-x-0 opacity-100",
                                  )}
                                >
                                  {label}
                                </p>
                              </Link>
                            </Button>
                          </TooltipTrigger>
                          {isOpen === false && (
                            <TooltipContent side="right">
                              {label}
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  ) : (
                    <div className="w-full" key={menuIndex}>
                      <CollapseMenuButton
                        icon={Icon}
                        label={label}
                        active={active}
                        submenus={submenus}
                        isOpen={isOpen}
                      />
                    </div>
                  ),
              )}
            </li>
          ))}
        </ul>
      </nav>
    </ScrollArea>
  )
}
