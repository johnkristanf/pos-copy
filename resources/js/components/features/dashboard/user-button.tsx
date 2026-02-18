import { router, usePage } from "@inertiajs/react"
import { LogOut, MapPin, User2Icon } from "lucide-react"
import toast from "react-hot-toast"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/common/avatar"
import { Badge } from "@/components/ui/common/badge"
import { Button } from "@/components/ui/common/button"
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
import { PAGE_ROUTES } from "@/config/page-routes"
import { useLogOutUser } from "@/hooks/api/auth"
import { useRealtimeReload } from "@/hooks/api/use-realtime-reload"
import { useDynamicDialog } from "@/hooks/ui/use-dynamic-dialog"
import { useInitials } from "@/hooks/ui/use-initials"
import { type SharedData } from "@/types"

export const UserButton = () => {
  useRealtimeReload("users", ".user.modified", ["user"])
  const { auth } = usePage<SharedData>().props
  const user = auth.user
  const getInitials = useInitials()
  const logOutMutation = useLogOutUser()
  const { openConfirmation } = useDynamicDialog()

  const handleSignOut = async () => {
    await toast.promise(logOutMutation.mutateAsync(), {
      loading: <span className="animate-pulse">Logging out...</span>,
      success: "Logged out successfully",
      error: (error) => error?.message || "Failed to log out",
    })
  }

  const handleConfirmLogOut = () => {
    openConfirmation({
      title: "Log Out",
      description:
        "Are you sure you want to log out? You'll need to log in again to access your account.",
      type: "warning",
      onConfirm: handleSignOut,
      confirmText: "Log out",
      cancelText: "Cancel",
    })
  }

  const fullName = `${user.first_name} ${user.last_name}`.trim()
  const stockLocations = user.assigned_stock_locations || []

  return (
    <DropdownMenu>
      <TooltipProvider disableHoverableContent>
        <Tooltip delayDuration={100}>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="relative flex h-10 items-center gap-2 rounded-full transition-all duration-200 hover:bg-accent hover:border-border hover:shadow-md md:h-9 lg:h-10 px-2 md:px-3 lg:pr-4 lg:pl-2"
              >
                <Avatar className="size-8 md:size-7 lg:size-8 ring-2 ring-transparent transition-all duration-200 hover:ring-primary/20 hover:scale-105">
                  <AvatarImage
                    src={user.user_image ?? user.name}
                    alt={fullName}
                  />
                  <AvatarFallback className="font-bold bg-linear-to-br from-gray-900 to-gray-700 text-white">
                    {getInitials(fullName)}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:flex flex-col items-start min-w-0">
                  <span className="font-semibold text-sm lg:text-sm text-foreground truncate max-w-24 lg:max-w-36">
                    {fullName}
                  </span>
                </div>
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="md:hidden">
            <div className="text-center">
              <p className="font-medium">{fullName}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <DropdownMenuContent
        className="w-72 md:w-80 lg:w-85 border border-border/50 rounded-xl p-2"
        align="end"
        forceMount
        sideOffset={8}
      >
        <DropdownMenuLabel className="px-3 py-3">
          <div className="flex items-center space-x-3">
            <Avatar className="size-12 ring-2 ring-primary/10">
              <AvatarImage src={user.user_image ?? user.name} alt={fullName} />
              <AvatarFallback className="font-bold bg-linear-to-br from-gray-900 to-gray-700 text-white text-xl">
                {getInitials(fullName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col space-y-1 min-w-0 flex-1">
              <h2 className="font-bold text-base text-foreground leading-tight truncate">
                {fullName}
              </h2>
              <p className="text-muted-foreground text-xs leading-tight truncate">
                {user.email}
              </p>
              {stockLocations.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1 pt-1">
                  {stockLocations.slice(0, 2).map((loc) => (
                    <Badge
                      key={loc.id}
                      variant="secondary"
                      className="text-[10px] h-5 px-1.5 font-normal bg-secondary/50"
                    >
                      <MapPin className="w-3 h-3 mr-0.5 opacity-70" />
                      {loc.name}
                    </Badge>
                  ))}
                  {stockLocations.length > 2 && (
                    <Badge
                      variant="secondary"
                      className="text-[10px] h-5 px-1.5 font-normal bg-secondary/50"
                    >
                      +{stockLocations.length - 2}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="mx-1 my-2" />
        <DropdownMenuItem
          onClick={() => router.visit(PAGE_ROUTES.ME_PAGE)}
          className="mx-1 rounded-lg focus:bg-accent/50 cursor-pointer"
        >
          <div className="flex w-full items-center px-3 py-2 text-foreground transition-colors">
            <User2Icon className="mr-3 size-4 text-muted-foreground" />
            <span className="font-medium">Profile Settings</span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleConfirmLogOut}
          className="mx-1 rounded-lg focus:bg-destructive/10 cursor-pointer group"
        >
          <div className="flex w-full items-center px-3 py-2 text-foreground group-focus:text-destructive transition-colors">
            <LogOut className="mr-3 size-4 text-muted-foreground group-focus:text-destructive" />
            <span className="font-medium">Log Out</span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
