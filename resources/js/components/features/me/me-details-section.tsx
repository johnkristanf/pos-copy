import { usePage } from "@inertiajs/react"
import {
  KeyRound,
  MapPin,
  Shield,
  User as UserIcon,
  XCircle,
} from "lucide-react"
import toast from "react-hot-toast"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/common/avatar"
import { Badge } from "@/components/ui/common/badge"
import { Button } from "@/components/ui/common/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/common/card"
import { Label } from "@/components/ui/common/label"
import { useDisableTwoFactor, useEnableTwoFactor } from "@/hooks/api/auth"
import { useRealtimeReload } from "@/hooks/api/use-realtime-reload"
import { useDynamicDialog } from "@/hooks/ui/use-dynamic-dialog"
import { useInitials } from "@/hooks/ui/use-initials"
import { formatDate } from "@/lib/format"
import { SharedData, User } from "@/types"
import { ChangePasswordForm } from "./change-password-form"
import { DisableTwoFactor } from "./disable-two-factor"
import { TwoFactorConfig } from "./two-factor-config"

interface MeDetailsSectionProps {
  user?: User
}

export const MeDetailsSection = ({ user: propUser }: MeDetailsSectionProps) => {
  useRealtimeReload("users", ".user.modified", ["user"])
  const { auth } = usePage<SharedData>().props
  const user = propUser || auth.user
  const getInitials = useInitials()
  const fullName = [user.first_name, user.middle_name, user.last_name]
    .filter(Boolean)
    .join(" ")
    .trim()
  const { openDialog, closeDialog } = useDynamicDialog()
  const { mutateAsync: enableTwoFactor, isPending: isEnabling } =
    useEnableTwoFactor()
  const { mutateAsync: disableTwoFactor, isPending: isDisabling } =
    useDisableTwoFactor()

  const handleChangePassword = () => {
    openDialog({
      title: "Change Password",
      description: "Input the details of your new password",
      children: <ChangePasswordForm />,
    })
  }

  const openTwoFactorConfigDialog = () => {
    openDialog({
      title: "Enable Two-Factor Authentication",
      description: "Add an extra layer of security to your account",
      children: <TwoFactorConfig onBack={closeDialog} onClose={closeDialog} />,
    })
  }

  const handleEnableTwoFactor = async () => {
    try {
      await toast.promise(enableTwoFactor(), {
        loading: "Enabling two-factor authentication...",
        success: (response: any) => {
          setTimeout(() => {
            openTwoFactorConfigDialog()
          }, 100)
          return response.message
        },
        error: (error) => error.message,
      })
    } catch (error) {}
  }

  const handleDisableTwoFactor = async () => {
    try {
      await toast.promise(disableTwoFactor(), {
        loading: "Disabling two-factor authentication...",
        success: (response: any) => {
          closeDialog()
          return (
            response.message || "Two-factor authentication has been disabled"
          )
        },
        error: (error) => error.message,
      })
    } catch (error) {}
  }

  const handleTwoFactorAuth = () => {
    if (!user.two_factor_confirmed_at) {
      handleEnableTwoFactor()
      return
    }

    openDialog({
      title: "Disable Two-Factor Authentication",
      description:
        "Are you sure you want to disable two-factor authentication? This will make your account less secure.",
      children: (
        <DisableTwoFactor
          closeDialog={closeDialog}
          handleDisableTwoFactor={handleDisableTwoFactor}
          isPending={isDisabling}
        />
      ),
    })
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full min-h-100">
        <div className="text-center">
          <XCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground font-medium">
            No user data found
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full overflow-y-auto bg-background">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 pb-8 border-b">
          <Avatar className="h-24 w-24 sm:h-32 sm:w-32 ring-4 ring-background shadow-sm shrink-0">
            <AvatarImage
              src={user.user_image ?? user.name}
              alt={fullName}
              className="object-cover"
            />
            <AvatarFallback className="font-bold text-2xl sm:text-4xl bg-linear-to-br from-gray-900 to-gray-700 text-white">
              {getInitials(fullName)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-3 text-center md:text-left min-w-0 w-full">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground truncate">
                {fullName}
              </h1>
              <p className="text-muted-foreground break-all">{user.email}</p>
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              {user.roles?.map((role) => (
                <Badge
                  key={role.id}
                  variant="secondary"
                  className="font-medium bg-secondary/50 text-secondary-foreground hover:bg-secondary/70 whitespace-nowrap"
                >
                  <UserIcon className="h-3 w-3 mr-1" />
                  {role.name}
                </Badge>
              ))}
              {user.assigned_stock_locations?.map((loc) => (
                <Badge
                  key={loc.id}
                  variant="outline"
                  className="font-medium border-border whitespace-nowrap"
                >
                  <MapPin className="h-3 w-3 mr-1 text-muted-foreground" />
                  {loc.name}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* User Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Info Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Your basic profile details and contact information.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      First Name
                    </Label>
                    <p className="text-sm font-medium leading-none">
                      {user.first_name}
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Last Name
                    </Label>
                    <p className="text-sm font-medium leading-none">
                      {user.last_name}
                    </p>
                  </div>
                  {user.middle_name && (
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Middle Name
                      </Label>
                      <p className="text-sm font-medium leading-none">
                        {user.middle_name}
                      </p>
                    </div>
                  )}
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Email Address
                    </Label>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium leading-none">
                        {user.email}
                      </p>
                      {user.email_verified_at ? (
                        <Badge
                          variant="secondary"
                          className="h-5 px-1.5 text-[10px] bg-green-500/15 text-green-700 hover:bg-green-500/25 border-transparent"
                        >
                          Verified
                        </Badge>
                      ) : (
                        <Badge
                          variant="secondary"
                          className="h-5 px-1.5 text-[10px] bg-amber-500/15 text-amber-700 hover:bg-amber-500/25 border-transparent"
                        >
                          Unverified
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Features & Permissions */}
            {user.user_features && user.user_features.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Assigned Features</CardTitle>
                  <CardDescription>
                    Features and capabilities accessible to your account.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {user.user_features.map((feature) => (
                      <div
                        key={feature.id}
                        className="flex flex-col gap-2 p-3 rounded-lg border bg-card text-card-foreground shadow-sm h-full"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium text-sm truncate">
                            {feature.name}
                          </span>
                          <Shield className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        </div>
                        {feature.permissions &&
                          feature.permissions.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-auto pt-1">
                              {feature.permissions.map((perm) => (
                                <span
                                  key={perm}
                                  className="inline-flex items-center rounded-md bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-secondary-foreground"
                                >
                                  {perm}
                                </span>
                              ))}
                            </div>
                          )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar Column */}
          <div className="space-y-6">
            {/* Security Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Security</CardTitle>
                <CardDescription>Manage your account security.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 2FA Status */}
                <div className="flex items-center justify-between p-3 bg-muted/40 rounded-lg border w-full">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-full shrink-0 ${
                        user.two_factor_confirmed_at
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <Shield className="size-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Two-Factor Auth</p>
                      <p className="text-xs text-muted-foreground">
                        {user.two_factor_confirmed_at ? "Enabled" : "Disabled"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button
                    variant="bridge_digital"
                    className="w-full justify-center"
                    onClick={handleChangePassword}
                  >
                    <KeyRound className="size-4 mr-2" />
                    Change Password
                  </Button>

                  <Button
                    variant={
                      user.two_factor_confirmed_at ? "destructive" : "outline"
                    }
                    className="w-full justify-center"
                    onClick={handleTwoFactorAuth}
                    disabled={isEnabling || isDisabling}
                  >
                    <Shield className="size-4 mr-2" />
                    {user.two_factor_confirmed_at
                      ? "Disable 2FA"
                      : "Enable 2FA"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Account Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Timeline</CardTitle>
                <CardDescription>Key dates for your account.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative pl-6 border-l border-border space-y-8 my-2">
                  <div className="relative">
                    <div className="absolute -left-7.25 top-0.5 h-3 w-3 rounded-full bg-primary ring-4 ring-background" />
                    <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-0.5">
                      Joined
                    </p>
                    <p className="text-sm font-medium">
                      {formatDate(user.created_at)}
                    </p>
                  </div>

                  <div className="relative">
                    <div className="absolute -left-7.25 top-0.5 h-3 w-3 rounded-full bg-muted-foreground/30 ring-4 ring-background" />
                    <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-0.5">
                      Last Updated
                    </p>
                    <p className="text-sm font-medium">
                      {formatDate(user.updated_at)}
                    </p>
                  </div>

                  {user.email_verified_at && (
                    <div className="relative">
                      <div className="absolute -left-7.25 top-0.5 h-3 w-3 rounded-full bg-green-500 ring-4 ring-background" />
                      <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-0.5">
                        Verified
                      </p>
                      <p className="text-sm font-medium">
                        {formatDate(user.email_verified_at)}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
