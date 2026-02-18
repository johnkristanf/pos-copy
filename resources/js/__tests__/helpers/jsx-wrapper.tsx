import { QueryClientProvider } from "@tanstack/react-query"
import { createQueryClient } from "../helpers/query-client-helper"

export const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={createQueryClient()}>
    {children}
  </QueryClientProvider>
)
