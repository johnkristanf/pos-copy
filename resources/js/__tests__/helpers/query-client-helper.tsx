import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { render } from "@testing-library/react"
import { ReactElement } from "react"

/**
 * Creates a fresh QueryClient instance for each test,
 * preventing query cache pollution between test runs.
 */
export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

/**
 * Renders a component wrapped in QueryClientProvider,
 * ensuring React Query hooks work in test environments.
 */
export const renderWithQueryClient = (ui: ReactElement) => {
  const client = createQueryClient()
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>)
}
