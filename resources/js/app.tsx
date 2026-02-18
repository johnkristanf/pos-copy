import "../css/app.css"

import { createInertiaApp } from "@inertiajs/react"
import { configureEcho } from "@laravel/echo-react"
import { resolvePageComponent } from "laravel-vite-plugin/inertia-helpers"
import { createRoot } from "react-dom/client"
import { GlobalDynamicDialog } from "./components/contexts/global-dynamic-dialog"
import { HttpRequestsObserver } from "./components/contexts/http-observer-context"
import NuqsAdapterContext from "./components/contexts/nuqs-adapter"
import { QueryProvider } from "./components/contexts/query"
// import { TailwindIndicator } from "./components/contexts/tailwind-indicator"
import { ToastProvider } from "./components/contexts/toast"
import { WrapBalancerContext } from "./components/contexts/wrap-balancer"
import { TooltipProvider } from "./components/ui/common/tooltip"
import "./config/echo"
import { initializeTheme } from "./hooks/ui/use-appearance"
import { requestObserver } from "./lib/http-observer-service"

configureEcho({
  broadcaster: "pusher",
  client: window.Echo,
})

const appName = import.meta.env.VITE_APP_NAME || "Laravel"

createInertiaApp({
  title: (title) => (title ? `${title} | ${appName}` : appName),
  resolve: (name) =>
    resolvePageComponent(
      `./pages/${name}.tsx`,
      import.meta.glob("./pages/**/*.tsx"),
    ),
  setup({ el, App, props }) {
    const root = createRoot(el)
    requestObserver.captureInitialPage(props.initialPage)
    root.render(
      <NuqsAdapterContext>
        <TooltipProvider disableHoverableContent>
          <QueryProvider>
            <WrapBalancerContext>
              <App {...props} />
            </WrapBalancerContext>
            <ToastProvider />
            {/* <TailwindIndicator /> */}
            <HttpRequestsObserver />
            <GlobalDynamicDialog />
          </QueryProvider>
        </TooltipProvider>
      </NuqsAdapterContext>,
    )
  },
  progress: {
    color: "#349083",
  },
}).then(() => {
  document.getElementById("app")?.removeAttribute("data-page")
})

initializeTheme()
