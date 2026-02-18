/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

interface ImportMetaEnv {
  readonly VITE_BRIDGE_LOGO: string
  readonly VITE_AUTH_COMPANY_BG: string
  readonly VITE_COMPANY_LOGO: string
  readonly VITE_COMPANY_LOGO_PNG: string
  readonly VITE_HEXAT_LOGO: string
  readonly VITE_FAVICON: string
  readonly VITE_FAVICON16X16: string
  readonly VITE_FAVICON32X32: string
  readonly VITE_FAVICON_APPLE_TOUCHED: string
  readonly VITE_PESO_SIGN: string
  readonly VITE_COMPANY_VAT: string
  readonly VITE_COMPANY_NAME: string
  readonly VITE_COMPANY_LOCATION: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
