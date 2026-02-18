import { Head, router } from "@inertiajs/react"
import { ArrowLeft, LogOut, ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/common/button"
import { API_ROUTES } from "@/config/api-routes"

export default function UnauthorizedPage() {
  const handleLogout = () => {
    router.post(API_ROUTES.LOGOUT)
  }

  return (
    <>
      <Head title="403 - Unauthorized" />
      <div className="relative min-h-screen flex items-center justify-center bg-linear-to-b from-orange-50/50 via-background to-background dark:from-orange-950/10">
        <div className="absolute inset-0" />

        <div className="relative w-full">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
            <div className="flex flex-col items-center text-center space-y-8">
              <div className="relative">
                <div className="absolute inset-0 blur-3xl opacity-20 rounded-full bg-orange-500/20" />
                <div className="relative rounded-2xl p-6 bg-orange-500/10 dark:bg-orange-500/20 ring-1 ring-orange-200/50 dark:ring-orange-900/50">
                  <ShieldAlert
                    className="h-12 w-12 text-orange-600 dark:text-orange-400"
                    strokeWidth={1.5}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-center gap-3">
                  <h1 className="text-7xl sm:text-9xl font-bold tracking-tighter tabular-nums text-orange-600 dark:text-orange-400">
                    403
                  </h1>
                </div>
                <div className="space-y-3">
                  <h2 className="text-2xl sm:text-4xl font-semibold tracking-tight text-foreground">
                    Access Denied
                  </h2>
                  <p className="text-base sm:text-lg text-muted-foreground max-w-lg mx-auto leading-relaxed">
                    You don't have permission to access this resource. If you
                    believe this is a mistake, please contact your administrator
                    or try logging in with a different account.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
                <Button
                  size="lg"
                  variant="bridge_digital"
                  onClick={() => window.history.back()}
                  className="gap-2 h-11 px-6 rounded-full font-medium"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Go Back
                </Button>

                <Button
                  size="lg"
                  variant="ghost"
                  onClick={handleLogout}
                  className="gap-2 h-11 px-6 rounded-full font-medium text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              </div>

              <div className="pt-8 text-xs text-muted-foreground/60 font-mono">
                Error Code: HTTP_FORBIDDEN
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
