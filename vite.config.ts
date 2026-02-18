/// <reference types="vitest/config" />
import { wayfinder } from "@laravel/vite-plugin-wayfinder"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import laravel from "laravel-vite-plugin"
// import { visualizer } from "rollup-plugin-visualizer"
import { defineConfig } from "vite"
import { ViteImageOptimizer } from "vite-plugin-image-optimizer"
import { VitePWA } from "vite-plugin-pwa"
import svgr from "vite-plugin-svgr"
import tsconfigPaths from "vite-tsconfig-paths"

export default defineConfig({
  plugins: [
    laravel({
      input: ["resources/css/app.css", "resources/js/app.tsx"],
      ssr: "resources/js/ssr.tsx",
      refresh: true,
    }),
    react({
      babel: {
        plugins: ["babel-plugin-react-compiler"],
      },
    }),
    tailwindcss(),
    wayfinder({
      formVariants: true,
    }),
    svgr({
      include: "**/*.svg?react",
      exclude: "",
    }),
    ViteImageOptimizer({
      png: { quality: 80 },
      jpeg: { quality: 80 },
      webp: { quality: 80 },
      avif: { quality: 70 },
      cache: true,
    }),
    VitePWA({
      registerType: "autoUpdate",
      devOptions: {
        enabled: true,
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
      },
    }),
    tsconfigPaths({
      projects: ["./tsconfig.json"],
    }),
  ],
  esbuild: {
    jsxDev: false,
    jsx: "automatic",
    drop: ["console", "debugger"],
  },
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "@inertiajs/react",
      "axios",
      "immer",
      "nuqs",
      "react-day-picker",
      "@radix-ui/react-popover",
      "cmdk",
    ],
  },
  server: {
    watch: { usePolling: false },
    hmr: {
      overlay: true,
    },
    fs: { strict: true },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./resources/js/vitest.setup.ts"],
    include: ["resources/js/**/*.{test,spec}.{js,ts,jsx,tsx}"],
    exclude: ["node_modules", "build", "public", "vendor"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "resources/js/vitest.setup.ts",
        "**/*.d.ts",
        "**/*.config.*",
      ],
    },
  },
  define: {
    global: "window",
  },
})
