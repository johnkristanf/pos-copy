import { Link } from "@inertiajs/react"
import { type PropsWithChildren } from "react"
import ImageComponent from "@/components/ui/media/image"
import { APP_ASSETS } from "@/config/assets"
import { PAGE_ROUTES } from "@/config/page-routes"

interface AuthSplitLayoutProps {
  title?: string
  description?: string
}

export default function AuthSplitLayout({
  children,
  title,
  description,
}: PropsWithChildren<AuthSplitLayoutProps>) {
  return (
    <div className="relative grid h-screen lg:grid-cols-2 overflow-hidden">
      {/* Left panel */}
      <div className="relative flex flex-col justify-center px-8 sm:px-0 lg:px-16 bg-white overflow-y-auto">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-87.5 py-8">
          <Link
            href={PAGE_ROUTES.LOGIN_PAGE}
            className="relative z-20 flex items-center justify-center mb-8"
          >
            <ImageComponent
              src={APP_ASSETS.BRIDGE_LOGO}
              alt={APP_ASSETS.BRIDGE_LOGO}
              className="h-16 w-auto"
              disableEffect
              webpOnly
            />
          </Link>
          <div className="relative z-10 flex flex-col items-start gap-2 text-left">
            <h1 className="text-xl font-medium">{title}</h1>
            <p className="text-sm text-balance text-muted-foreground">
              {description}
            </p>
          </div>
          <div className="relative z-10">{children}</div>
        </div>
      </div>

      {/* Right panel */}
      <div className="relative hidden lg:block h-screen">
        <ImageComponent
          src={APP_ASSETS.AUTH_COMPANY_BG}
          alt={APP_ASSETS.AUTH_COMPANY_BG}
          className="absolute inset-0 h-full w-full object-cover"
          disableEffect
          webpOnly
        />
        <div className="absolute inset-0 bg-white/80" />
        <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-primary/5" />

        <div className="relative z-10 flex flex-col items-center justify-center h-full p-8">
          <div className="text-center space-y-6">
            <ImageComponent
              src={APP_ASSETS.COMPANY_LOGO}
              alt={APP_ASSETS.COMPANY_LOGO}
              className="mx-auto w-full max-w-md h-auto drop-shadow-2xl"
              disableEffect
              webpOnly
            />
          </div>
        </div>
      </div>
    </div>
  )
}
